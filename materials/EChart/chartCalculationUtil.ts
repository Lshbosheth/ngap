// 图表单位计算公共方法

// 单位类型定义
export interface UnitType {
    type: 'time' | 'percentage' | 'number';
    unit: string;
}

// 判断值的单位类型
export const detectUnitType = (value: any): UnitType => {
    if (typeof value !== 'string') {
        return { type: 'number', unit: '' };
    }

    // 检查时间格式 (xx:xx:xx)
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
        return { type: 'time', unit: '秒' };
    }

    // 检查百分比格式 (xx%)
    if (/^-?\d+\.?\d*%$/.test(value)) {
        return { type: 'percentage', unit: '%' };
    }

    return { type: 'number', unit: '' };
};

// 将值转换为数字，用于图表显示和计算
export const convertValueToNumber = (value: any): number => {
    // 处理空值、null、undefined等异常情况
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    const unitInfo = detectUnitType(value);

    switch (unitInfo.type) {
        case 'time': {
            // 时间格式 (HH:mm:ss) 转换为秒
            const timeParts = value.split(':');
            return parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60 + parseInt(timeParts[2]);
        }
        case 'percentage':
            // 百分比格式转换为小数
            return parseFloat(value.replace('%', '')) / 100;

        case 'number':
            return typeof value === 'number' ? value : parseFloat(value);

        default:
            return 0;
    }
};

// 格式化数值用于显示（带单位）
export const formatValueWithUnit = (value: number, unitType: string): string => {
    switch (unitType) {
        case 'time': {
            // 秒数转换为 HH:mm:ss 格式
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            const seconds = Math.floor(value % 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        case 'percentage':
            // 小数转换为百分比格式
            return `${(value * 100).toFixed(2)}%`;

        case 'number':
        default:
            return value.toString();
    }
};

// 格式化差值用于显示（按实际差值展示并携带单位）
export const formatDifferenceWithUnit = (diff: number, unitType: string): string => {
    switch (unitType) {
        case 'time':
            // 时间类型：直接显示秒数
            return `${Math.abs(diff).toFixed(2)}秒`;

        case 'percentage':
            // 百分比类型：显示百分比差值
            return `${(diff * 100).toFixed(2)}%`;

        case 'number':
        default:
            // 数字类型：直接显示差值
            return diff.toFixed(2);
    }
};

// 将十六进制颜色转换为浅色（用于"同色系浅一色"效果）
export const getLighterColor = (hexColor: string, factor: number = 0.3) => {
    // 如果不是 hex 颜色，直接返回原色
    if (!hexColor.startsWith('#')) return hexColor;

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // 混合白色使颜色变浅，使用更大的系数使浅色更明显
    const newFactor = factor * 2.0; // 增加到原来的2倍，使浅色更加明显
    const newR = Math.round(r + (255 - r) * newFactor);
    const newG = Math.round(g + (255 - g) * newFactor);
    const newB = Math.round(b + (255 - b) * newFactor);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};
