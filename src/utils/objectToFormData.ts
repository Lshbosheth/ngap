/**
 * 将对象转换为FormData
 * @param data 要转换的对象
 * @param options 转换选项
 * @returns FormData实例
 */
export const objectToFormData = (
    data: Record<string, any>,
    options: {
        indices?: boolean; // 数组是否使用索引格式
        nullsAsUndefined?: boolean; // 是否将null视为undefined
        allowEmptyArrays?: boolean; // 是否允许空数组
    } = {},
): FormData => {
    const formData = new FormData();
    const { indices = false, nullsAsUndefined = false, allowEmptyArrays = false } = options;

    const appendValue = (key: string, value: any) => {
        if (value === null && nullsAsUndefined) return;
        if (value === undefined) return;

        // 处理文件类型
        if (value instanceof File) {
            formData.append(key, value);
        }
        // 处理Blob类型（如图片）
        else if (value instanceof Blob) {
            formData.append(key, value, 'file.bin');
        }
        // 处理数组
        else if (Array.isArray(value)) {
            if (value.length === 0 && !allowEmptyArrays) return;

            value.forEach((item, index) => {
                const arrayKey = indices ? `${key}[${index}]` : `${key}[]`;

                appendValue(arrayKey, item);
            });
        }
        // 处理嵌套对象（转换为JSON字符串）
        else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
        }
        // 处理基本类型
        else {
            formData.append(key, value.toString());
        }
    };

    Object.entries(data).forEach(([key, value]) => {
        appendValue(key, value);
    });

    return formData;
};

/**
 * 将FormData转换为对象（用于调试）
 * 注意：这个方法不能处理文件，仅用于调试
 */
export const formDataToObject = (formData: FormData): Record<string, any> => {
    const obj: Record<string, any> = {};
    formData.forEach((value, key) => {
        // 处理数组格式
        if (key.endsWith('[]')) {
            const baseKey = key.slice(0, -2);
            if (!obj[baseKey]) {
                obj[baseKey] = [];
            }
            obj[baseKey].push(value);
        }
        // 处理索引数组格式
        else if (key.includes('[') && key.includes(']')) {
            const match = key.match(/(\w+)\[(\d+)\]/);
            if (match) {
                const [, baseKey, index] = match;
                if (!obj[baseKey]) {
                    obj[baseKey] = [];
                }
                obj[baseKey][parseInt(index)] = value;
            }
        }
        // 处理普通键值对
        else {
            obj[key] = value;
        }
    });
    return obj;
};

/**
 * 打印FormData内容（用于调试）
 */
export const logFormData = (formData: FormData) => {
    const obj = formDataToObject(formData);
    console.log('FormData内容:', obj);
};

/**
 * 类型定义：对象转FormData的选项
 */
export type ObjectToFormDataOptions = {
    indices?: boolean;
    nullsAsUndefined?: boolean;
    allowEmptyArrays?: boolean;
};
