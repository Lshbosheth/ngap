import request from '../../utils/request';
import { message } from '@/utils/AntdGlobal';
/**
 * 获取字典映射关系表
 * Example: { 'PV': '环比', 'UV': '同比' }
 */
export const getDictionary = (interfaceId: string, callback: (mapping: Record<string, any>) => void) => {
    request
        .post('/csf/appInterface/getInterfaceParamsAndCheck', { params: { interfaceId } })
        .then((data: any) => {
            const mapping = Object.fromEntries(data.beans.map((item: any) => [item.value, item.name]));
            callback(mapping);
        })
        .catch(() => {
            message.error('接口返回错误，请检查');
        });
};
