import { memo, useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Dropdown, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import NodeModal from '../FlowNode/NodeModal';
import { NodeType } from '../FlowNode/FlowNode';
import styles from './index.module.less';
import { useAppContext } from './../../utils/AppProvider';
const EventConfig = memo(() => {
    type callback = (nodeList: NodeType[]) => void;
    const nodeRef = useRef<{ open: (nodeList: NodeType[], callback: callback) => void }>();
    const { pageStore } = useAppContext();
    const state = pageStore();
    const [form] = Form.useForm();
    const [columnsVersion, setColumnsVersion] = useState(0);

    const elementConfig = state?.page?.pageData?.elementsMap?.[state.selectedElement?.id];
    const builtInEvents = elementConfig?.events || [];
    const currentEvents = elementConfig?.config?.events || [];
    const columnsConfig = elementConfig?.config?.props?.columns || [];
    const columnsConfigJson = JSON.stringify(columnsConfig);
    const builtInEventsJson = JSON.stringify(builtInEvents);

    const getValidEventKeys = () => {
        const validKeys = new Set<string>();
        builtInEvents.forEach((e: any) => validKeys.add(e.value));
        columnsConfig.forEach((col: any) => {
            if (col.type === 'action') {
                (col.list || []).forEach((btn: any) => {
                    if (btn.eventName) validKeys.add(btn.eventName);
                });
            } else {
                if (col.eventName) validKeys.add(col.eventName);
                if (col.suffixIcon?.onClickEvent) validKeys.add(col.suffixIcon.onClickEvent);
                if (col.suffixIcon?.onMouseEnterEvent) validKeys.add(col.suffixIcon.onMouseEnterEvent);
                if (col.suffixIcon?.onMouseLeaveEvent) validKeys.add(col.suffixIcon.onMouseLeaveEvent);
            }
        });
        return validKeys;
    };

    useEffect(() => {
        form.resetFields();
        if (!state.selectedElement) {
            form.setFieldsValue({ events: state?.page?.pageData?.config?.events || [] });
            return;
        }
        const validKeys = getValidEventKeys();
        const builtInKeys = new Set(builtInEvents.map((e: any) => e.value));
        const cleanedEvents = currentEvents.filter((e: any) => {
            if (builtInKeys.has(e.eventName)) return true;
            if (e.source === 'user') return true;
            return validKeys.has(e.eventName);
        });
        form.setFieldsValue({ events: cleanedEvents });
        if (cleanedEvents.length !== currentEvents.length) {
            state.editElement({
                id: state.selectedElement.id,
                type: 'events',
                events: cleanedEvents,
            });
        }
    }, [state.selectedElement?.id, columnsConfigJson, JSON.stringify(currentEvents), form]);

    useEffect(() => {
        setColumnsVersion(prev => prev + 1);
    }, [columnsConfigJson]);

    const buildItems = () => {
        if (!state.selectedElement?.id) {
            return state?.page?.pageData?.events?.map((item: any) => ({
                key: item.value,
                label: item.name,
            })) || [];
        }

        const builtInKeys = new Set(builtInEvents.map((e: { value: any; }) => e.value));
        const columns = columnsConfig || [];

        const columnEventMap = new Map<string, { key: string; label: string }>();
        columns.forEach((col: any) => {
            if (col.type === 'action') {
                (col.list || []).forEach((btn: any) => {
                    if (btn.eventName && !builtInKeys.has(btn.eventName)) {
                        columnEventMap.set(btn.eventName, {
                            key: btn.eventName,
                            label: `点击${typeof btn.text === 'string' ? btn.text : '按钮'}事件`,
                        });
                    }
                });
            } else {
                if (col.eventName && !builtInKeys.has(col.eventName)) {
                    columnEventMap.set(col.eventName, {
                        key: col.eventName,
                        label: `点击${col.title || '列'}事件`,
                    });
                }
                if (col.suffixIcon?.onClickEvent && !builtInKeys.has(col.suffixIcon.onClickEvent)) {
                    columnEventMap.set(col.suffixIcon.onClickEvent, {
                        key: col.suffixIcon.onClickEvent,
                        label: `${col.title || '列'}图标点击事件`,
                    });
                }
                if (col.suffixIcon?.onMouseEnterEvent && !builtInKeys.has(col.suffixIcon.onMouseEnterEvent)) {
                    columnEventMap.set(col.suffixIcon.onMouseEnterEvent, {
                        key: col.suffixIcon.onMouseEnterEvent,
                        label: `${col.title || '列'}图标鼠标移入事件`,
                    });
                }
                if (col.suffixIcon?.onMouseLeaveEvent && !builtInKeys.has(col.suffixIcon.onMouseLeaveEvent)) {
                    columnEventMap.set(col.suffixIcon.onMouseLeaveEvent, {
                        key: col.suffixIcon.onMouseLeaveEvent,
                        label: `${col.title || '列'}图标鼠标移出事件`,
                    });
                }
            }
        });

        const staticEvents = builtInEvents.map((item: any) => ({
            key: item.value,
            label: item.name,
        }));

        return [...staticEvents, ...Array.from(columnEventMap.values())];
    };

    const items = useMemo(() => buildItems(), [columnsVersion, state.selectedElement?.id, columnsConfigJson, JSON.stringify(builtInEvents)]);

    const saveEvents = useCallback((events: any[]) => {
        if (state.selectedElement?.id) {
            state.editElement({
                id: state.selectedElement.id,
                type: 'events',
                events: events || [],
            });
        } else {
            state.savePageInfo({
                type: 'events',
                events: events || [],
            });
        }
    }, [state.selectedElement, state]);

    const handleValueChange = (_: any, values: any) => {
        saveEvents(values.events || []);
    };

    const handleRemoveEvent = useCallback((index: number) => {
        const currentEvents = form.getFieldValue(['events']) || [];
        const newEvents = currentEvents.filter((_: any, i: number) => i !== index);
        saveEvents(newEvents);
        setColumnsVersion(prev => prev + 1);
    }, [form, saveEvents]);

    const handleAddAction = (index: number) => {
        nodeRef.current?.open(form.getFieldValue(['events', index, 'actions']), (nodeList: any) => {
            const currentEvents = form.getFieldValue(['events']) || [];
            const updatedEvents = [...currentEvents];
            updatedEvents[index] = { ...updatedEvents[index], actions: nodeList };
            form.setFieldValue(['events'], updatedEvents);
            saveEvents(updatedEvents);
        });
    };

    const handleAddEvent = (key: string) => {
        const nickName = items.find((item: any) => item.key === key)?.label;
        const newEvent = { nickName, eventName: key, actions: [], source: 'user' };
        form.setFieldValue(['events'], [...currentEvents, newEvent]);
        saveEvents([...currentEvents, newEvent]);
    };

    const formLayout = {
        labelCol: { span: 7 },
        wrapperCol: { span: 15 },
    };

    return (
        <>
            <Form key={columnsVersion} form={form} {...formLayout} onValuesChange={handleValueChange}>
                <div style={{ marginBottom: 10 }}>
                    <Form.List name="events">
                        {(fields, { add }) => (
                            <>
                                <div className={styles.event}>
                                    <Dropdown
                                        menu={{
                                            items,
                                            onClick: ({ key }) => {
                                                handleAddEvent(key);
                                            },
                                        }}
                                        placement="bottom"
                                    >
                                        <a onClick={(e) => e.preventDefault()}>
                                            <PlusOutlined />
                                            <span className={styles.ml5}>添加事件</span>
                                        </a>
                                    </Dropdown>
                                </div>
                                {fields.map(({ key: fieldKey, name }) => (
                                    <div key={'event' + fieldKey} className={styles.eventFlow}>
                                        <h2 className={styles.title}>
                                            <span>{form.getFieldValue(['events', name, 'nickName'])}</span>
                                            <DeleteOutlined onClick={() => handleRemoveEvent(name)} className={styles.ml5} />
                                        </h2>
                                        <div className={styles.addAction}>
                                            <Button type="primary" onClick={() => handleAddAction(name)}>
                                                设置事件流
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </Form.List>
                </div>
            </Form>
            <NodeModal ref={nodeRef} source="page" />
        </>
    );
});
export default EventConfig;
