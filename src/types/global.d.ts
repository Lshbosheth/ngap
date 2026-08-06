// src/types/global.d.ts
declare global {
    /**
     * 补充 Object.hasOwn 类型，解决 TS 校验报错
     */
    interface ObjectConstructor {
        hasOwn(obj: any, prop: string | symbol): boolean;
    }

    /**
     * 补充 ResizeObserver 相关类型
     */
    interface ResizeObserverEntry {
        devicePixelContentBoxSize?: ResizeObserverSize[];
    }

    const __GIT_BRANCH__: string;
    interface Window {
        GIT_BRANCH: string;
    }
}
export {};
