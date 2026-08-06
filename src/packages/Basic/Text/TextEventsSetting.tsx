import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Form, FormInstance, Input, Card, message } from 'antd';
import { memo, useRef } from 'react';
import { useAppContext } from '../../../utils/AppProvider';
import { produce } from 'immer';

/**
 * Text事件名称配置组件
 * 用于维护组件的 events 属性（不是 config.events）
 */
interface TextEventsSettingProps {
    form: FormInstance;
}

// Text组件的默认事件（从Schema中定义）
const DEFAULT_EVENTS = [
    {
        value: 'onClick',
        name: '点击事件',
    },
];

const TextEventsSetting = memo(({ form }: TextEventsSettingProps) => {
    const { pageStore } = useAppContext();
    const { editEvents, editElement } = pageStore((state: any) => ({
        editEvents: state.editEvents,
        editElement: state.editElement,
    }));
    
    // 使用 ref 存储每个事件项的旧名称
    const oldNameRef = useRef<{ [key: number]: string }>({});

    // 更新组件事件（不是 config.events）
    const updateEvents = () => {
        const events = form.getFieldValue('events') || [];
        
        // 过滤出有效的事件名称（非空）
        const validEvents = events.filter((item: any) => item?.name && item.name.trim() !== '');
        
        // 校验重复（只对有效事件名称进行校验）
        const eventNames = validEvents.map((item: any) => item.name.trim());
        const duplicates = eventNames.filter((name: string, index: number) =>
            eventNames.indexOf(name) !== index
        );
        
        if (duplicates.length > 0) {
            message.error(`事件名称"${duplicates[0]}"已存在，请勿重复添加`);
            return;
        }
        
        // 从 store 中获取最新的 selectedElement
        const state = pageStore.getState();
        const currentSelectedElement = state.selectedElement;
        const elementId = currentSelectedElement?.id;
        
        if (!elementId) return;
        
        // 将用户添加的事件格式化
        const userAddedEvents = events.map((item: any) => ({
            name: (item.name + '点击事件') || '',
            value: item.name || '',
        }));
        
        // 始终保留默认事件，与用户添加的事件合并
        const mergedEvents = [...DEFAULT_EVENTS, ...userAddedEvents];
        
        editEvents({
            id: elementId,
            events: mergedEvents,
        });
    };

    // 删除事件时同步删除 config.events 中对应的事件流
    const handleDeleteEvent = (index: number) => {
        const events = form.getFieldValue('events') || [];
        const deletedEventName = events[index]?.name;
        
        // 先执行删除
        form.setFieldValue('events', events.filter((_: any, i: number) => i !== index));
        
        // 延迟执行以等待表单更新
        setTimeout(() => {
            // 从 store 中获取最新的 selectedElement
            const state = pageStore.getState();
            const currentSelectedElement = state.selectedElement;
            const elementId = currentSelectedElement?.id;
            
            if (!elementId) return;
            
            // 更新组件事件列表
            updateEvents();
            
            // 同步删除 config.events 中对应的事件流
            if (deletedEventName) {
                const currentConfig = state?.page?.pageData?.elementsMap?.[elementId]?.config;
                const currentEvents = currentConfig?.events || [];
                
                // 过滤掉 config.events 中的同名事件
                const filteredConfigEvents = currentEvents.filter((event: any) => event.eventName !== deletedEventName);
                
                if (filteredConfigEvents.length !== currentEvents.length) {
                    editElement({
                        id: elementId,
                        type: 'events',
                        events: filteredConfigEvents,
                    });
                }
                
                // 同时删除 elementsMap[id].events 中的同名事件
                const elementEvents = state?.page?.pageData?.elementsMap?.[elementId]?.events || [];
                const filteredElementEvents = elementEvents.filter((event: any) => event.value !== deletedEventName);
                
                // 使用 produce 更新 elementsMap[id].events
                pageStore.setState(
                    produce((draft: any) => {
                        if (draft.page?.pageData?.elementsMap?.[elementId]) {
                            draft.page.pageData.elementsMap[elementId].events = filteredElementEvents;
                        }
                    })
                );
            }
        }, 0);
    };

    return (
        <div style={{ padding: '0 10px' }}>
            <Form.List name="events">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Card
                                key={key}
                                size="small"
                                style={{ 
                                    marginBottom: '8px',
                                    position: 'relative',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '2px'
                                }}
                                bodyStyle={{ padding: '12px' }}
                            >
                                {/* 右上角删除按钮 */}
                                <DeleteOutlined
                                    onClick={() => {
                                        handleDeleteEvent(name);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        color: '#ff4d4f',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        zIndex: 1
                                    }}
                                />

                                {/* 事件名称输入 */}
                                <Form.Item
                                    {...restField}
                                    label="事件名称"
                                    name={[name, 'name']}
                                    rules={[{ required: true, message: '请输入事件名称' }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input
                                        placeholder="请输入事件名称"
                                        onChange={() => {
                                            // 首次输入时，从表单获取旧名称存储到 ref
                                            if (!oldNameRef.current[name as number]) {
                                                const formEvents = form.getFieldValue('events') || [];
                                                oldNameRef.current[name as number] = formEvents[name as number]?.name || '';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const newName = e.target.value?.trim() || '';
                                            
                                            // 从 ref 中获取旧名称，如果为空则从表单获取
                                            let oldName = oldNameRef.current[name as number];
                                            if (!oldName) {
                                                const formEvents = form.getFieldValue('events') || [];
                                                oldName = formEvents[name as number]?.name || '';
                                                oldNameRef.current[name as number] = oldName;
                                            }
                                            
                                            // 如果事件名称被清空，删除该事件及其配置的事件流
                                            if (oldName && !newName) {
                                                handleDeleteEvent(name);
                                                oldNameRef.current[name as number] = '';
                                            } else if (oldName && newName && oldName !== newName) {
                                                // 事件名称变更时，同步更新 config.events 中的事件流名称
                                                setTimeout(() => {
                                                    // 从 store 中获取最新的 selectedElement
                                                    const state = pageStore.getState();
                                                    const currentSelectedElement = state.selectedElement;
                                                    const elementId = currentSelectedElement?.id;
                                                    
                                                    if (!elementId) return;
                                                    
                                                    // 从 store 中获取最新的配置
                                                    const currentConfig = state?.page?.pageData?.elementsMap?.[elementId]?.config;
                                                    const currentEvents = currentConfig?.events || [];
                                                    
                                                    // 查找并更新 config.events 中的同名事件
                                                    let hasUpdated = false;
                                                    const updatedConfigEvents = currentEvents.map((event: any) => {
                                                        if (event.eventName === oldName) {
                                                            hasUpdated = true;
                                                            return {
                                                                ...event,
                                                                eventName: newName,
                                                                nickName: newName + '点击事件',
                                                            };
                                                        }
                                                        return event;
                                                    });
                                                    
                                                    // 同时更新 elementsMap[id].events 中的事件名称
                                                    const elementEvents = state?.page?.pageData?.elementsMap?.[elementId]?.events || [];
                                                    const updatedElementEvents = elementEvents.map((event: any) => {
                                                        if (event.value === oldName) {
                                                            return {
                                                                ...event,
                                                                name: newName + '点击事件',
                                                                value: newName,
                                                            };
                                                        }
                                                        return event;
                                                    });
                                                    
                                                    // 调用 editElement 更新 config.events
                                                    if (hasUpdated) {
                                                        editElement({
                                                            id: elementId,
                                                            type: 'events',
                                                            events: updatedConfigEvents,
                                                        });
                                                    }
                                                    
                                                    // 使用 produce 更新 elementsMap[id].events
                                                    pageStore.setState(
                                                        produce((draft: any) => {
                                                            if (draft.page?.pageData?.elementsMap?.[elementId]) {
                                                                draft.page.pageData.elementsMap[elementId].events = updatedElementEvents;
                                                            }
                                                        })
                                                    );
                                                    
                                                    // 更新事件列表
                                                    updateEvents();

                                                    // 更新 ref 中的旧名称
                                                    oldNameRef.current[name as number] = newName;
                                                }, 0);
                                            } else if (newName) {
                                                updateEvents();
                                                oldNameRef.current[name as number] = newName;
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </Card>
                        ))}
                        
                        {/* 添加事件按钮 */}
                        <div
                            onClick={() => {
                                const events = form.getFieldValue('events') || [];
                                // 检查是否所有事件名称都已填写
                                const hasEmptyName = events.some((item: any) => !item?.name);
                                if (hasEmptyName) {
                                    message.warning('请先填写当前事件名称');
                                    return;
                                }
                                add({ name: '' });
                            }}
                            style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                color: '#0085d0', 
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '4px 0'
                            }}
                        >
                            <PlusOutlined style={{ marginRight: '4px' }} />
                            添加点击事件
                        </div>
                    </>
                )}
            </Form.List>
        </div>
    );
});

export default TextEventsSetting;
