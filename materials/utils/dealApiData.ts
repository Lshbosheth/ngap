// 根据配置的key将数据转换为表格结构
import { isEmpty } from 'lodash-es';

export const dealApiData = (data: Record<string, any> = {}, keys: string[] = []) => {
    keys = keys.filter(Boolean);
    if (isEmpty(data) || isEmpty(keys)) return [];
    const length = Math.max(...keys.map((key) => data?.[key]?.length || 0));
    return Array.from({ length }, (_, i) => {
        return keys.reduce((prev: Record<string, any>, key: string) => {
            const hasChild = key.endsWith('children') || key.endsWith('child');
            if (hasChild) {
                prev[key] = dealChildren(data[key]?.[i], key);
            } else {
                prev[key] = data[key]?.[i];
            }
            return prev;
        }, {});
    });
};
const dealChildren = (data: Record<string, any>[], childrenKey: string) => {
    if (isEmpty(data)) return undefined;
    const prefix = childrenKey.replace(/children$/g, '').replace(/child$/g, '');
    return data.map((item) => {
        const newItem = { ...item };
        const childEntries = Object.entries(newItem);
        for (const [child_key, child_value] of childEntries) {
            const hasChild = child_key.endsWith('children') || child_key.endsWith('child');
            if (hasChild) {
                newItem[childrenKey] = dealChildren(child_value, childrenKey);
            } else if (!child_key.includes(prefix)) {
                const newKey = prefix + child_key;
                newItem[newKey] = child_value;
            }
        }
        return newItem;
    });
};
