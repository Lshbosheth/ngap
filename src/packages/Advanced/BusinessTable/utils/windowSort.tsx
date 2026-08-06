/**
 * 混合数据类型文本排序器（分组再对比方案）
 * 支持：特殊符号、数字、字节单位、字母、中文（按拼音首字母）
 *
 * 核心特性：
 * 1. 支持开头连续数字+字节单位累加比较（如 20GB200MB45KB）
 * 2. 支持普通文本逐 token 比较（类型优先级：special < digit < size < alpha < cjk）
 * 3. 中文按拼音首字母排序，同音字按 Unicode 排序
 */

import { pinyin } from 'pinyin-pro';

export class MixedTypeSorter {
  // ==================== 类型优先级配置 ====================

  private static readonly TYPE_PRIORITY: Record<string, number> = {
    special: 1,
    digit: 2,
    size: 3,
    alpha: 4,
    cjk: 5,
  };

  private static readonly SIZE_UNIT_TO_BYTES: Record<string, number> = {
    'B': 1, 'BYTE': 1, 'BYTES': 1,
    'K': 1024, 'KB': 1024,
    'M': 1024 ** 2, 'MB': 1024 ** 2,
    'G': 1024 ** 3, 'GB': 1024 ** 3,
    'T': 1024 ** 4, 'TB': 1024 ** 4,
    'P': 1024 ** 5, 'PB': 1024 ** 5,
  };

  private static readonly SIZE_UNIT_PRIORITY: Record<string, number> = {
    'B': 0, 'BYTE': 0, 'BYTES': 0,
    'K': 1, 'KB': 1,
    'M': 2, 'MB': 2,
    'G': 3, 'GB': 3,
    'T': 4, 'TB': 4,
    'P': 5, 'PB': 5,
  };

  // ==================== 拼音缓存 ====================

  private static pinyinCache: Map<string, string> = new Map();

  private static getPinyinFirstLetters(text: string): string {
    if (this.pinyinCache.has(text)) {
      return this.pinyinCache.get(text)!;
    }
    const result = pinyin(text, {
      pattern: 'first',
      toneType: 'none',
      type: 'string',
    }).toUpperCase();
    this.pinyinCache.set(text, result);
    return result;
  }

  // ==================== 字符分类工具 ====================

  private static isDigit(char: string): boolean {
    return /\d/.test(char);
  }

  private static isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char) && !this.isChinese(char);
  }

  private static isChinese(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      (code >= 0x4E00 && code <= 0x9FFF) ||
      (code >= 0x3400 && code <= 0x4DBF) ||
      (code >= 0x2E80 && code <= 0x2EFF) ||
      (code >= 0x3000 && code <= 0x303F) ||
      (code >= 0xF900 && code <= 0xFAFF) ||
      (code >= 0xFE30 && code <= 0xFE4F)
    );
  }

  private static isSpecial(char: string): boolean {
    return !this.isDigit(char) && !this.isAlpha(char) && !this.isChinese(char);
  }

  // ==================== 提取字节单位（无分隔限制） ====================

  private static extractUnit(text: string, startIndex: number): { unit: string; length: number } | null {
    if (startIndex >= text.length) return null;
    const remaining = text.slice(startIndex);

    // 先尝试2字符单位（如 GB, MB）
    const twoChar = remaining.slice(0, 2).toUpperCase();
    if (this.SIZE_UNIT_PRIORITY[twoChar] !== undefined) {
      return { unit: twoChar, length: 2 };
    }
    // 再尝试1字符单位（如 G, M）
    const oneChar = remaining.slice(0, 1).toUpperCase();
    if (this.SIZE_UNIT_PRIORITY[oneChar] !== undefined) {
      return { unit: oneChar, length: 1 };
    }
    return null;
  }

  // ==================== 开头连续字节单位累加 ====================

  /**
   * 解析字符串开头的连续数字+字节单位，并累加总字节数
   * 例如 "3GB24MB" → { totalBytes: 3*1024^3 + 24*1024^2, remaining: "" }
   *     "8MB1000KB" → { totalBytes: 8*1024^2 + 1000*1024, remaining: "" }
   *     若不是以数字+单位开头，返回 null
   */
  private static parseContinuousSizePrefix(text: string): { totalBytes: number; remaining: string } | null {
    if (!text) return null;
    let totalBytes = 0;
    let index = 0;
    let hasSize = false;

    while (index < text.length) {
      // 匹配数字（含小数）
      const numMatch = text.slice(index).match(/^(\d+(?:\.\d+)?)/);
      if (!numMatch) break;
      const num = parseFloat(numMatch[1]);
      const numEnd = index + numMatch[0].length;

      // 尝试提取单位
      const unitResult = this.extractUnit(text, numEnd);
      if (!unitResult) break;

      const unit = unitResult.unit;
      const bytes = this.SIZE_UNIT_TO_BYTES[unit];
      if (bytes === undefined) break;

      totalBytes += num * bytes;
      index = numEnd + unitResult.length;
      hasSize = true;
    }

    if (!hasSize) return null;
    return { totalBytes, remaining: text.slice(index) };
  }

  // ==================== 分词器（核心） ====================

  static tokenize(text: string): Array<{ type: string; value: string }> {
    if (!text) return [];

    const tokens: Array<{ type: string; value: string }> = [];
    let current = '';
    let prevType: string | null = null;
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      let charType: string;

      if (this.isDigit(char)) {
        charType = 'digit';
      } else if (this.isAlpha(char)) {
        charType = 'alpha';
      } else if (this.isChinese(char)) {
        charType = 'cjk';
      } else {
        charType = 'special';
      }

      // 处理负号开头（负数）
      if (char === '-' && i + 1 < text.length && this.isDigit(text[i + 1])) {
        if (current) {
          tokens.push({ type: prevType!, value: current });
          current = '';
        }
        current = char;
        i++;
        while (i < text.length && this.isDigit(text[i])) {
          current += text[i];
          i++;
        }
        const unitMatch = this.extractUnit(text, i);
        if (unitMatch) {
          current += unitMatch.unit;
          i += unitMatch.length;
          tokens.push({ type: 'size', value: current });
        } else {
          tokens.push({ type: 'digit', value: current });
        }
        current = '';
        prevType = null;
        continue;
      }

      // 处理数字开头，检查是否是 size 单元
      if (charType === 'digit' && prevType !== 'digit' && prevType !== 'size') {
        if (current) {
          tokens.push({ type: prevType!, value: current });
          current = '';
        }
        current = char;
        i++;
        while (i < text.length && (this.isDigit(text[i]) || text[i] === '.')) {
          current += text[i];
          i++;
        }
        const unitMatch = this.extractUnit(text, i);
        if (unitMatch) {
          current += unitMatch.unit;
          i += unitMatch.length;
          tokens.push({ type: 'size', value: current });
        } else {
          tokens.push({ type: 'digit', value: current });
        }
        current = '';
        prevType = null;
        continue;
      }

      // 普通类型切换
      if (charType !== prevType && current) {
        tokens.push({ type: prevType!, value: current });
        current = '';
      }

      current += char;
      prevType = charType;
      i++;
    }

    if (current) {
      tokens.push({ type: prevType!, value: current });
    }

    return tokens;
  }

  // ==================== 各类型比较逻辑 ====================

  private static compareSpecial(a: string, b: string): number {
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      const codeA = a.charCodeAt(i);
      const codeB = b.charCodeAt(i);
      const isFullA = (codeA >= 0xFF01 && codeA <= 0xFF5E) || (codeA >= 0xFFE0 && codeA <= 0xFFE6);
      const isFullB = (codeB >= 0xFF01 && codeB <= 0xFF5E) || (codeB >= 0xFFE0 && codeB <= 0xFFE6);
      if (isFullA !== isFullB) return isFullA ? 1 : -1;
      if (codeA !== codeB) return codeA - codeB;
    }
    return a.length - b.length;
  }

  private static compareDigit(a: string, b: string): number {
    const isNegA = a.startsWith('-');
    const isNegB = b.startsWith('-');
    const absA = parseFloat(a.replace(/^-/, '')) || 0;
    const absB = parseFloat(b.replace(/^-/, '')) || 0;
    if (absA !== absB) return absA < absB ? -1 : 1;
    if (isNegA && !isNegB) return -1;
    if (!isNegA && isNegB) return 1;
    const digitsA = a.replace(/^-/, '');
    const digitsB = b.replace(/^-/, '');
    if (digitsA.length !== digitsB.length) {
      return digitsB.length - digitsA.length;
    }
    return 0;
  }

  private static parseSize(value: string): { num: number; unitPriority: number } | null {
    const match = value.match(/^(-?[\d.]+)([A-Z]+)$/i);
    if (!match) return null;
    const num = parseFloat(match[1]);
    if (isNaN(num)) return null;
    const unitPriority = this.SIZE_UNIT_PRIORITY[match[2].toUpperCase()];
    if (unitPriority === undefined) return null;
    return { num, unitPriority };
  }

  private static compareSize(a: string, b: string): number {
    const parsedA = this.parseSize(a);
    const parsedB = this.parseSize(b);
    if (!parsedA || !parsedB) return 0;
    if (parsedA.unitPriority !== parsedB.unitPriority) {
      return parsedA.unitPriority - parsedB.unitPriority;
    }
    if (parsedA.num !== parsedB.num) {
      return parsedA.num < parsedB.num ? -1 : 1;
    }
    return 0;
  }

  private static compareAlpha(a: string, b: string): number {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    if (aLower < bLower) return -1;
    if (aLower > bLower) return 1;
    if (a !== b) return a < b ? -1 : 1;
    return 0;
  }

  private static compareCJK(a: string, b: string): number {
    const lettersA = this.getPinyinFirstLetters(a);
    const lettersB = this.getPinyinFirstLetters(b);
    if (lettersA !== lettersB) {
      return lettersA < lettersB ? -1 : 1;
    }
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      const codeA = a.charCodeAt(i);
      const codeB = b.charCodeAt(i);
      if (codeA !== codeB) return codeA - codeB;
    }
    return a.length - b.length;
  }

  private static compareTokens(
    a: { type: string; value: string },
    b: { type: string; value: string }
  ): number {
    const priorityA = this.TYPE_PRIORITY[a.type] ?? 99;
    const priorityB = this.TYPE_PRIORITY[b.type] ?? 99;
    if (priorityA !== priorityB) return priorityA - priorityB;

    switch (a.type) {
      case 'special': return this.compareSpecial(a.value, b.value);
      case 'digit': return this.compareDigit(a.value, b.value);
      case 'size': return this.compareSize(a.value, b.value);
      case 'alpha': return this.compareAlpha(a.value, b.value);
      case 'cjk': return this.compareCJK(a.value, b.value);
      default: return 0;
    }
  }

  // ==================== 核心比较方法 ====================

  /**
   * 比较两个文本（混合类型）
   * @returns 负数=a在前, 正数=b在前, 0=相等
   */
  static compare(a: string, b: string): number {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;

    // 尝试提取开头连续字节单位累加结果
    const sizeA = this.parseContinuousSizePrefix(a);
    const sizeB = this.parseContinuousSizePrefix(b);

    // 1. 两者都是 size 整体 → 比较总字节，再递归比较剩余部分
    if (sizeA && sizeB) {
      if (sizeA.totalBytes !== sizeB.totalBytes) {
        return sizeA.totalBytes - sizeB.totalBytes;
      }
      return this.compare(sizeA.remaining, sizeB.remaining);
    }

    // 2. 仅 A 是 size 整体
    if (sizeA && !sizeB) {
      // 获取 B 的第一个 token 类型，进行类型优先级比较
      const tokensB = this.tokenize(b);
      if (tokensB.length) {
        const priorityB = this.TYPE_PRIORITY[tokensB[0].type] ?? 99;
        const priorityA = this.TYPE_PRIORITY.size;
        if (priorityA !== priorityB) return priorityA - priorityB;
        // 若优先级相同（理论上 size 不与任何其他类型同级），走具体值比较（但不会发生）
        // 如果 B 的第一个 token 也是 size，则应该已在上面处理，但这里防御
        if (tokensB[0].type === 'size') {
          // 比较 sizeA 的总字节与 B 第一个 size 的值
          const parsedB = this.parseSize(tokensB[0].value);
          if (parsedB) {
            const bytesB = parsedB.num * this.SIZE_UNIT_TO_BYTES[Object.keys(this.SIZE_UNIT_TO_BYTES)[parsedB.unitPriority]];
            if (sizeA.totalBytes !== bytesB) return sizeA.totalBytes - bytesB;
            // 若相等，继续比较剩余部分（A 剩余与 B 剩余 token）
            const remainingA = sizeA.remaining;
            const remainingB = b.slice(tokensB[0].value.length);
            return this.compare(remainingA, remainingB);
          }
        }
      }
      // 默认 size 整体排在前面（因为 priority 比 alpha/cjk 高，但比 digit 低，但 sizeA 不会与 digit 冲突？）
      // 实际上如果 B 开头是 digit，priority 2 < 3，则 A 应排在后面，所以需要处理
      // 但此处 sizeA 已确定，且 B 的第一个 token 是 digit 或 special 等，我们已经比较了优先级，所以直接返回 priorityA - priorityB 即可
      // 上面已经比较，如果 priority 不同已经返回，但可能有相同 priority？不会。
      // 但为了安全，如果走到了这里，说明优先级相同，但不可能，所以返回 -1 或 1？但根据逻辑，我们已经返回了。
      // 上面 if (priorityA !== priorityB) return priorityA - priorityB; 已经处理，所以不会到这里。
      // 但若 tokensB 为空，则 B 为空字符串，但前面已经处理了空。
      return -1; // 默认 A 在前（但实际不会执行到这里）
    }

    // 3. 仅 B 是 size 整体
    if (!sizeA && sizeB) {
      const tokensA = this.tokenize(a);
      if (tokensA.length) {
        const priorityA = this.TYPE_PRIORITY[tokensA[0].type] ?? 99;
        const priorityB = this.TYPE_PRIORITY.size;
        if (priorityA !== priorityB) return priorityA - priorityB;
        // 同理，若 tokensA[0] 是 size，则比较
        if (tokensA[0].type === 'size') {
          const parsedA = this.parseSize(tokensA[0].value);
          if (parsedA) {
            const bytesA = parsedA.num * this.SIZE_UNIT_TO_BYTES[Object.keys(this.SIZE_UNIT_TO_BYTES)[parsedA.unitPriority]];
            if (bytesA !== sizeB.totalBytes) return bytesA - sizeB.totalBytes;
            const remainingA = a.slice(tokensA[0].value.length);
            const remainingB = sizeB.remaining;
            return this.compare(remainingA, remainingB);
          }
        }
      }
      return 1; // B 在前
    }

    // 4. 都不是 size 整体 → 逐 token 比较
    const tokensA = this.tokenize(a);
    const tokensB = this.tokenize(b);
    const minLen = Math.min(tokensA.length, tokensB.length);
    for (let i = 0; i < minLen; i++) {
      const result = this.compareTokens(tokensA[i], tokensB[i]);
      if (result !== 0) return result;
    }
    return tokensA.length - tokensB.length;
  }

  // ==================== Ant Design Table Sorter ====================

  /**
   * 创建 Ant Design Table sorter
   * @param key 排序字段名（默认 'name'）
   */
  static createSorter(key: string = 'name'): (a: any, b: any, order: 'ascend' | 'descend') => number {
    return (recordA: any, recordB: any, order: 'ascend' | 'descend') => {
      const valueA = String(recordA[key] ?? '');
      const valueB = String(recordB[key] ?? '');
      const result = this.compare(valueA, valueB);
      return order === 'ascend' ? result : -result;
    };
  }
}
