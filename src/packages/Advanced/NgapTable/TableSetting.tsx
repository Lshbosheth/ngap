import { Form, FormInstance } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { memo, useCallback, useRef, useState, useEffect } from 'react';
import ColumnSetting from './ColumnSetting';
import DragColumn from './DragColumn';
import request from './../../../utils/request';
import { useAppContext } from './../../../utils/AppProvider';
/**
 * 表格配置
 */
const TableSetting = memo(({ form, config }: { form: FormInstance; config: any }) => {
    const columnRef = useRef<{ open: (index: number) => void }>();
    const { pageStore } = useAppContext();
    const { selectedElement, elementsMap, editEvents } = pageStore((state: any) => ({
        selectedElement: state.selectedElement,
        elementsMap: state.page.pageData.elementsMap,
        editEvents: state.editEvents,
    }));
    const [options, setOptions] = useState([
        { label: '姓名', value: 'name' },
        { label: '类型', value: 'type' },
        { label: '分布区域', value: 'area' },
        { label: '技能', value: 'skill' },
        { label: '状态', value: 'status' },
        { label: '创建时间', value: 'createdAt' },
        { label: '操作', value: 'action' },
    ]);

    useEffect(() => {
        if (config?.api?.sourceType == 'api' && config?.api?.id) {
            request
                .post('/csf/appInterface/getInterfaceParamsAndCheck', { params: { interfaceId: config.api.id } })
                .then((data: any) => {
                    const options = data.beans.map((item: any) => {
                        return { label: item.name, value: item.value };
                    });
                    setOptions(options);
                })
                .catch(() => {
                    message.error('接口返回错误，请检查');
                });
        } else if (config?.api?.sourceType == 'json') {
            const apiSelectOptions = Object.keys(config?.api?.source).map((item) => {
                return { label: item, value: item };
            });
            setOptions(apiSelectOptions);
        } else if (config?.api?.sourceType == 'variable') {

            const apiSelectOptions = Object.keys(config?.api?.source).map((item) => {
                return { label: item, value: item };
            });
            setOptions(apiSelectOptions);
        }
    }, [config?.api]);

    // 设置
    const handleOpen = useCallback((index: number) => {
        columnRef.current?.open(index);
    }, []);

    // 更新
    const handleUpdate = (vals: any, index: number) => {
        form.setFieldValue(['columns', index], vals);
    };

    // 删除列时清理关联事件
    const handleRemove = useCallback((index: number) => {
        const element = elementsMap[selectedElement?.id as string];
        if (!element) return;

        // 获取被删除列的事件名称
        const deletedColumn = element.config.props.columns[index];
        const eventNamesToRemove: string[] = [];

        // 收集需要删除的事件名称
        if (deletedColumn?.eventName) {
            eventNamesToRemove.push(deletedColumn.eventName);
        }
        if (deletedColumn?.suffixIcon?.onClickEvent) {
            eventNamesToRemove.push(deletedColumn.suffixIcon.onClickEvent);
        }
        if (deletedColumn?.suffixIcon?.onMouseEnterEvent) {
            eventNamesToRemove.push(deletedColumn.suffixIcon.onMouseEnterEvent);
        }
        if (deletedColumn?.suffixIcon?.onMouseLeaveEvent) {
            eventNamesToRemove.push(deletedColumn.suffixIcon.onMouseLeaveEvent);
        }
        if (deletedColumn?.list) {
            deletedColumn.list.forEach((btn: any) => {
                if (btn.eventName) {
                    eventNamesToRemove.push(btn.eventName);
                }
            });
        }

        // 从事件列表中移除被删除列的事件
        if (eventNamesToRemove.length > 0) {
            const updatedEvents = (element.events || []).filter((e: any) => !eventNamesToRemove.includes(e.value));
            editEvents({
                id: element.id,
                events: updatedEvents,
            });
        }
    }, [selectedElement, elementsMap, editEvents]);

    return (
        <>
            <Form.List name={['columns']}>
                {(fields, { add, remove, move }) => (
                    <>
                        {fields.map(({ key, name }) => (
                            <DragColumn
                                form={form}
                                options={options}
                                Len={fields.length}
                                key={key}
                                index={name}
                                add={add}
                                remove={remove}
                                handleOpen={handleOpen}
                                move={move}
                                onRemove={handleRemove}
                            />
                        ))}
                    </>
                )}
            </Form.List>
            <ColumnSetting columnRef={columnRef} update={handleUpdate} form={form} options={options} />
        </>
    );
});
export default TableSetting;
