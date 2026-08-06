// src/polyfills.ts
/**
 * 向下兼容 Chrome 80+
 */
if (!Array.prototype.at) {
    Object.defineProperty(Array.prototype, 'at', {
        value: function (index: number) {
            const idx = Math.floor(index);
            const length = this.length;
            const realIndex = idx < 0 ? length + idx : idx;
            return realIndex >= 0 && realIndex < length ? this[realIndex] : undefined;
        },
        writable: true,
        configurable: true,
    });

    // 为 TypedArray 补充 at 方法（antd 内部可能用到）
    const typedArrays = [Uint8Array, Uint16Array, Uint32Array, Int8Array, Int16Array, Int32Array, Float32Array, Float64Array];
    typedArrays.forEach((TypedArray) => {
        if (!TypedArray.prototype.at) {
            Object.defineProperty(TypedArray.prototype, 'at', {
                value: Array.prototype.at,
                writable: true,
                configurable: true,
            });
        }
    });
}

/**
 * 兼容 ResizeObserver
 */
if (!window.ResizeObserver) {
    class ResizeObserver {
        private callback: ResizeObserverCallback;
        private targets = new Map<Element, HTMLElement>();
        private observer: MutationObserver;

        constructor(callback: ResizeObserverCallback) {
            this.callback = callback;
            this.observer = new MutationObserver((mutations) => {
                const entries: any[] = [];
                mutations.forEach((mutation) => {
                    const target = mutation.target as Element;
                    if (this.targets.has(target)) {
                        const rect = target.getBoundingClientRect();
                        // 补充所有必选属性
                        entries.push({
                            target,
                            contentRect: rect,
                            borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
                            contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
                            devicePixelContentBoxSize: [], // Chrome 97+ 新增，设为空数组
                        });
                    }
                });
                if (entries.length) this.callback(entries, this);
            });
        }

        // 实现核心方法
        observe(target: Element) {
            if (!(target instanceof HTMLElement)) return;
            this.targets.set(target, target);
            this.observer.observe(target, {
                attributes: true,
                attributeFilter: ['style', 'class'],
                childList: true,
                subtree: true,
            });
        }

        unobserve(target: Element) {
            this.targets.delete(target);
            this.observer.disconnect();
            this.targets.forEach((el) => this.observe(el));
        }

        disconnect() {
            this.targets.clear();
            this.observer.disconnect();
        }
    }

    // 挂载到全局，跳过 TS 类型校验
    window.ResizeObserver = ResizeObserver as any;
}

/**
 * 兼容 Object.hasOwn
 */
if (!('hasOwn' in Object)) {
    (Object as any).hasOwn = function (obj: any, prop: string | symbol): boolean {
        if (obj === null || obj === undefined) return false;
        return Object.prototype.hasOwnProperty.call(Object(obj), prop);
    };
}
