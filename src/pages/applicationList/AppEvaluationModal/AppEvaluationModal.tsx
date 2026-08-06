import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    Button,
    Space,
    Typography,
    Divider,
    Row,
    Col,
    message,
    Checkbox,
} from 'antd';
import {PlusCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import {AppItem} from '../index'
import dayjs, {Dayjs} from 'dayjs';
import request from "@/utils/request.ts";
import {objectToFormData} from '@/utils/objectToFormData';
import {crossApiUserInfo} from '@/stores/crossapiStore';
import styles from './index.module.less';
import { hasPermission } from '@/config/permissionConfig.ts';

const {RangePicker} = DatePicker;
const {Text} = Typography;

interface AppEvaluationModalProps {
    appDetail: AppItem;
    appEvaluationModalVisible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
}

interface EvaluationDimensionProps {
    key: number;
    restField: any;
    name: number;
    form: any;
    dimensionItems: Array<SelectItem>;
    setDimensionItems: (dimensionItems: Array<SelectItem>) => void;
    evaluateConditions: Array<SelectItem>;
    onRemove?: () => void;
    onOpenDimensionManager: () => void;
    period?: [Dayjs, Dayjs];
    dimensionManagerMo: boolean;
    appDetail: AppItem;
    canRemove: boolean;
}

interface EvaluateInfoItem {
    dimensionId: string;
    dimensionNm: string;
    evaluateTarget: string;
    evaluateData: string;
}

interface DimensionManagerProps {
    dimensionManagerVisible: boolean,
    onCancel: () => void,
    onConfirm: (data: SelectItem[]) => void,
    initialData: SelectItem[],
    userInfo?: any,
    onRefresh?: () => void,
}

interface DisabledTimeReturn {
    disabledHours?: () => number[];
    disabledMinutes?: (hour?: number) => number[];
    disabledSeconds?: (hour?: number, minute?: number) => number[];
}

interface SelectItem {
    label: string;
    value: string;
}

const AppEvaluationModal: React.FC<AppEvaluationModalProps> = ({
                                                                   appEvaluationModalVisible,
                                                                   onCancel,
                                                                   onSubmit,
                                                                   appDetail,
                                                               }: AppEvaluationModalProps, ref: any) => {
    const [form] = Form.useForm();
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    // 评估维度
    const [dimensionItems, setDimensionItems] = useState<SelectItem[]>([]);
    // 评估依据
    const [evaluateConditions, setEvaluateConditions] = useState<SelectItem[]>([
        { label: "应用访问量", value: "appVisits" },
        { label: "覆盖坐席数", value: "appSeats" },
    ]);
    const [dimensionManagerVisible, setDimensionManagerVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const dimensionManagerMo = useMemo(() => hasPermission('维度管理'), [userInfo.permissionInfos]);
    // 获取评估维度选项
    const getDimensionItems = () => {
        request.post('/appEvaluate/queryAppEvaluateDimensionList', {
            params: {},
        })
            .then((res) => {
                if (res?.beans) {
                    const items = res.beans.map((item: any) => ({
                        label: item.dimensionNm,
                        value: item.dimensionId
                    }));
                    setDimensionItems(items);
                }
            }).finally(() => {
        })
    }
    // 获取评估依据选项
    const getAccessDetailData = () => {
        request.post('app/queryEvaluateCondition', objectToFormData({}))
            .then((res) => {
                if (res?.beans) {
                    const conditions = res.beans.map((item: any) => ({
                        label: item.evaluateTarget,
                        value: item.evaluateTargetId
                    }));
                    setEvaluateConditions(conditions);
                }
            }).finally(() => {
        })
    }
    const currentDate = dayjs();
    const getDefaultPeriod = () => {

        if (appDetail?.firstUpTime) {
            const firstUpTime =  dayjs(appDetail.firstUpTime);
            return [firstUpTime, currentDate];
        }
        return [currentDate.clone().startOf('year'), currentDate];
    }
    const handleAfterClose = () => {
        form.setFieldValue('evaluateConditions', [{}]);
        form.resetFields();
    };
    const defaultPeriod = getDefaultPeriod();
    useEffect(() => {
        if (appEvaluationModalVisible) {
            form.resetFields();
            // form.clearValidate();
            form.setFieldsValue({
                // evaluateRes: '0',
                evaluateConditions: [{}],
                period: defaultPeriod,
            });
            getDimensionItems();
            getAccessDetailData();
        }
    }, [appEvaluationModalVisible]);

    const disabledTime: (current: Dayjs, partial: 'start' | 'end') => DisabledTimeReturn = (current, partial) => {
        if (partial === 'end') {
            const today = dayjs();
            if (current.isSame(today, 'day')) {
                const hour = today.hour();
                const minute = today.minute();
                return {
                    disabledHours: () => range(hour + 1, 24),
                    disabledMinutes: (selectedHour) => {
                        if (selectedHour === hour) {
                            return range(minute + 1, 60);
                        }
                        return [];
                    },
                    disabledSeconds: () => [],
                };
            }
            if (current.isAfter(today, 'day')) {
                return {
                    disabledHours: () => range(0, 24),
                    disabledMinutes: () => range(0, 60),
                    disabledSeconds: () => range(0, 60),
                };
            }
        }
        return {};
    };

    const disabledDate = (current: Dayjs) => {
        return current < currentDate.startOf('year') || current > dayjs().endOf('day');
    };
    // 提交评估记录
    const handleAppEvaluateOk = async () => {
        try {
            const values = await form.validateFields();
            const evaluateConditionsList = values.evaluateConditions || [];
            for (let i = 0; i < evaluateConditionsList.length; i++) {
                const item = evaluateConditionsList[i];
                if (item.customizeDesc && item.customizeDesc.length > 500) {
                    message.error(`第${i + 1}条评估维度的自定义评估说明不能超过500字符`);
                    return;
                }
            }
            const period = values.period;
            const startTime = period[0].format('YYYY-MM-DD HH:mm:ss');
            const endTime = period[1].format('YYYY-MM-DD HH:mm:ss');
            const submitData = {
                evaluateStaffId: userInfo?.staffId || '',
                evaluateStaffNm: userInfo?.staffName || '',
                appNm: appDetail?.appName || '',
                appId: appDetail?.id || '',
                relationId: appDetail?.relationId || '',
                startTime: startTime,
                endTime: endTime,
                evaluateRes: values.evaluateRes,
                resDesc: values.conclusionDesc || '',
                evaluateConditions: evaluateConditionsList.map((item: any) => ({
                    dimensionId: item.dimensionId,
                    dimensionNm: item.dimensionNm,
                    evaluateTarget: Array.isArray(item.evaluateTarget) ? item.evaluateTarget.join(',') : item.evaluateTarget,
                    evaluateData: item.evaluateData || '',
                    customizeDesc: item.customizeDesc || '',
                })),
            };
            setSubmitting(true);
            request.post('/appEvaluate/insertAppEvaluate', {
                params:submitData
            })
                .then((res: any) => {
                    if (res?.returnCode === "0") {
                        message.success('提交成功');
                        onSubmit(submitData);
                        onCancel();
                    } else {
                        message.error(res?.returnMessage || '提交失败');
                    }
                })
                .catch(() => {
                    message.error('提交失败');
                })
                .finally(() => {
                    setSubmitting(false);
                });
        } catch (errorInfo) {
            console.log(errorInfo);

        }
    };

    const range = (start: number, end: number) => {
        const result: number[] = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    };

    const showDimensionManager = () => setDimensionManagerVisible(true);
    const hideDimensionManager = () => setDimensionManagerVisible(false);
    const handleDimensionConfirm = (data: SelectItem[]) => {
        setDimensionItems(data);
        hideDimensionManager();
        message.success('维度保存成功');
    };

    return (
        <Modal
            title="应用评估"
            open={appEvaluationModalVisible}
            onCancel={onCancel}
            destroyOnClose={true}
            afterClose={handleAfterClose}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button key="submit" type="primary" onClick={handleAppEvaluateOk} loading={submitting}>确定</Button>,
            ]}
        >
            <div style={{ maxHeight: '650px', overflowY: 'auto', overflowX: 'hidden' }}>
                <Form form={form} layout="horizontal" labelAlign="right"
                      initialValues={{
                          // evaluateRes: '0',
                          evaluateConditions: [{}]
                      }}
                >
                    <Form.Item className={styles['form-item-margin']}
                               label={<span className={styles['label-margin-left']}>应用名称</span>}>
                        <span>{appDetail?.appName}</span>
                    </Form.Item>
                    <Form.Item
                        label={<span>评估周期</span>}
                        name="period"
                        className={styles['form-item-margin']}
                        rules={[{required: true, message: '请选择评估周期'}]}
                    >
                        <RangePicker showTime={{format: 'HH:mm:ss'}}
                                     format="YYYY-MM-DD HH:mm:ss"
                                     disabledDate={disabledDate}
                                     disabledTime={disabledTime}
                                     className={styles['picker-width']}/>
                    </Form.Item>
                    <Form.Item className={styles['form-item-evaluateConditions']}
                               label={<span >评估依据</span>}
                               name="period_more"
                               required
                    >
                        <Form.List name="evaluateConditions">
                            {(fields, {add, remove}) => (
                                <>
                                    {fields.map(({key, name, ...restField}) => (
                                        <EvaluationDimensionItem
                                            appDetail={appDetail}
                                            form={form}
                                            key={key}
                                            name={name}
                                            restField={restField}
                                            setDimensionItems={setDimensionItems}
                                            dimensionItems={dimensionItems}
                                            evaluateConditions={evaluateConditions}
                                            dimensionManagerMo={dimensionManagerMo}
                                            onRemove={() => remove(name)}
                                            onOpenDimensionManager={showDimensionManager}
                                            canRemove={fields.length > 1}
                                        />
                                    ))}
                                    <Form.Item>
                                        <Button className={fields.length >= 10 ? '' : styles['font-green']} type="link" onClick={() => add()} disabled={fields.length >= 10}>
                                            +新增评估维度
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Divider className={styles['divider-margin']}/>

                    <Form.Item
                        label={<span>评估结论</span>}
                        name="evaluateRes"
                        rules={[
                            {required: true, message: '请选择评估结论'},
                            {
                                validator: (_, value) => {
                                    if (value && value !== '0') {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('请选择评估结论');
                                },
                            },
                        ]}
                    >
                        <Select placeholder="请选择">
                            <Select.Option value="1">稳健级</Select.Option>
                            <Select.Option value="2">改进级</Select.Option>
                            <Select.Option value="3">下线级</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="结论说明" name="conclusionDesc" className={styles['label-margin-left']}
                               rules={[{max: 500, message: '结论说明不能超过500字符'}]}>
                        <Input.TextArea rows={3} placeholder="评估结论说明不能超过500字符"/>
                    </Form.Item>
                </Form>
            </div>

            <DimensionManager
                dimensionManagerVisible={dimensionManagerVisible}
                onCancel={hideDimensionManager}
                onConfirm={handleDimensionConfirm}
                initialData={dimensionItems}
                userInfo={userInfo}
                onRefresh={getDimensionItems}
            />
        </Modal>
    );
};

const EvaluationDimensionItem: React.FC<EvaluationDimensionProps> = ({
                                                                         name,
                                                                         restField,
                                                                         onRemove,
                                                                         form,
                                                                         dimensionItems,
                                                                         evaluateConditions,
                                                                         onOpenDimensionManager,
                                                                         dimensionManagerMo,
                                                                         appDetail,
                                                                         canRemove,
                                                                     }) => {
    const [targetLoading, setTargetLoading] = useState(false);

    const fetchTargetData = useCallback((dimensionId: string, relationId: string) => {
        if (!dimensionId || dimensionId === '0') {
            form.setFieldValue(['evaluateConditions', name, 'evaluateData'], '');
            return;
        }
        setTargetLoading(true);
        request.post('/appEvaluate/getEvaluateInfo', {
            evaluateTarget: dimensionId,
            relationId: relationId
        })
            .then((res: any) => {
                const bean = res?.bean;
                if (bean && typeof bean === 'object' && Object.keys(bean).length > 0) {
                    const formattedData = evaluateConditions
                        .filter(item => bean[item.value] !== undefined && bean[item.value] !== null)
                        .map(item => `${item.label}:${bean[item.value]}`)
                        .join(',');
                    form.setFieldValue(['evaluateConditions', name, 'evaluateData'], formattedData);
                } else {
                    form.setFieldValue(['evaluateConditions', name, 'evaluateData'], '');
                    message.warning('未查询到指标数据');
                }
            })
            .catch(() => {
                form.setFieldValue(['evaluateConditions', name, 'evaluateData'], '');
                // message.error('查询指标数据失败');
            })
            .finally(() => {
                setTargetLoading(false);
            });
    }, [form, name, evaluateConditions]);

    const handleEvaluateTargetChange = (values: string[]) => {
        fetchTargetData(values.join(","), appDetail?.relationId || "");
    };

    const handleClearEvaluate = () => {
        form.setFieldsValue({
            evaluateConditions: {
                [name]: {
                    evaluateTarget: [],
                    evaluateData: '',
                }
            }
        });
    };

    return (
        <div className={styles['dimension-item']}>
            <Row gutter={16} justify="end">
                <Button type="link" danger onClick={onRemove} className={styles['delete-btn']} disabled={!canRemove}>删除</Button>
            </Row>
            <Row gutter={16} align="top">
                <Col span={4} className={styles['label-col']}>
                    <Text type="danger">*</Text>评估维度：
                </Col>
                <Col span={16}>
                    <Form.Item
                        {...restField}
                        name={[name, 'dimensionId']}
                        rules={[{required: true, message: '请选择评估维度'}]}
                    >
                        <Select
                            placeholder="请选择维度"
                            className={styles['select-full-width']}
                            onChange={(value) => {
                                const selected = dimensionItems.find(item => item.value === value);
                                if (selected) {
                                    form.setFieldValue(['evaluateConditions', name, 'dimensionNm'], selected.label);
                                }
                            }}
                        >
                            <Select.Option value="0">请选择</Select.Option>
                            {dimensionItems.map((item: SelectItem) =>
                                <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                            )}
                        </Select>
                    </Form.Item>
                </Col>
                {name === 0 && dimensionManagerMo &&  <Button onClick={onOpenDimensionManager} type="link"
                                                              className={styles['dimension-manager-btn']}>维度管理</Button>}
            </Row>

            <Row gutter={16} align="top">
                <Col span={4} className={styles['label-col']}>
                    <Text type="danger">+</Text>评估指标：
                </Col>
                <Col span={16}>
                    <Form.Item
                        {...restField}
                        name={[name, 'evaluateTarget']}
                        rules={[{
                            validator: (_, value) => {
                                const customizeDesc = form.getFieldValue(['evaluateConditions', name, 'customizeDesc']);
                                if (value && value.length > 0) {
                                    return Promise.resolve();
                                }
                                if (customizeDesc && customizeDesc.trim()) {
                                    return Promise.resolve();
                                }
                                return Promise.reject('评估指标和自定义评估说明至少填写一项');
                            }
                        }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="请选择评估指标"
                            maxTagCount="responsive"
                            allowClear={false}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(inputValue: string, option: any) => {
                                return option.children.toLowerCase().includes(inputValue.toLowerCase());
                            }}
                            onChange={handleEvaluateTargetChange}
                            suffixIcon={
                                <Space size={0} className={styles['suffix-space']}>
                                    <Button type="link" size="small" className={styles['select-btn']}>
                                        选择
                                    </Button>
                                    <span className={styles['separator']}> | </span>
                                    <Button type="link" danger size="small" className={styles['clear-btn']}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClearEvaluate();
                                            }}>
                                        清空
                                    </Button>
                                </Space>
                            }
                        >
                            {evaluateConditions.map((item: SelectItem) =>
                                <Select.Option key={item.value} value={item.value} label={item.label}>{item.label}</Select.Option>
                            )}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16} align="middle" className={styles['row-margin']}>
                <Col span={4} className={styles['label-col']}>
                    指标数据：
                </Col>
                <Col span={16}>
                    <Form.Item {...restField}
                               name={[name, 'evaluateData']} noStyle>
                        <Input
                            placeholder={targetLoading ? '加载中...' : '根据选中的评估指标自动查询指标数据'}
                            readOnly
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={4} className={`${styles['label-col']} ${styles['customize-label-col']}`}>
                    <Text type="danger">+</Text>自定义评&nbsp;&nbsp;&nbsp;<br/>估说明：
                </Col>
                <Col span={20}>
                    <Form.Item
                        {...restField}
                        name={[name, 'customizeDesc']}
                        rules={[{
                            validator: (_, value) => {
                                const evaluateTarget = form.getFieldValue(['evaluateConditions', name, 'evaluateTarget']);
                                if (value && value.trim()) {
                                    return Promise.resolve();
                                }
                                if (evaluateTarget && evaluateTarget.length > 0) {
                                    return Promise.resolve();
                                }
                                return Promise.reject('评估依据和自定义评估说明至少填写一项');
                            }
                        }]}
                        validateFirst
                    >
                        <Input.TextArea rows={3} placeholder="请输入自定义评估说明"/>
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

const DimensionManager: React.FC<DimensionManagerProps> = ({
                                                               dimensionManagerVisible,
                                                               onCancel,
                                                               initialData = [],
                                                               userInfo,
                                                               onRefresh,
                                                           }) => {
    const [dimensions, setDimensions] = useState<SelectItem[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (dimensionManagerVisible) {
            setDimensions(initialData.map(item => ({...item})));
            setIsAdding(false);
            setCollapsed(false);
        }
    }, [dimensionManagerVisible, initialData]);

    const handleDelete = (index: number) => {
        const dimensionId = dimensions[index].value;
        request.post('/appEvaluate/deleteAppEvaluateDimension', {
            params: {
                dimensionId: dimensionId,
            }
        })
            .then((res: any) => {
                if (res?.returnCode === "0") {
                    const newDimensions = dimensions.filter((_, i) => i !== index);
                    setDimensions(newDimensions);
                    message.success('已移除该维度');
                    if (onRefresh) {
                        onRefresh();
                    }
                } else {
                    message.error(res?.returnMessage || '删除失败');
                }
            })
            .catch(() => {
                message.error('删除失败');
            });
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditValue(dimensions[index].label);
    };

    const handleEditSave = () => {
        if (!editValue.trim()) {
            setEditingIndex(null);
            return;
        }
        const oldLabel = dimensions[editingIndex!].label;
        const editId = dimensions[editingIndex!].value;
        if (editValue === oldLabel) {
            setEditingIndex(null);
            return;
        }
        // 更新评估维度
        request.post('/appEvaluate/updateAppEvaluateDimension', {
            params: {
                dimensionId: editId,
                staffId: userInfo?.staffId,
                dimensionNm: editValue,
            }
        })
            .then((res: any) => {
                if (res?.returnCode === "0") {
                    const newDimensions = [...dimensions];
                    newDimensions[editingIndex!] = {
                        ...newDimensions[editingIndex!],
                        label: editValue,
                        value: editId,
                    };
                    setDimensions(newDimensions);
                    message.success('修改成功');
                    if (onRefresh) {
                        onRefresh();
                    }
                } else {
                    message.error(res?.returnMessage || '修改失败');
                }
            })
            .catch(() => {
                message.error('修改失败');
            })
            .finally(() => {
                setEditingIndex(null);
            });
    };


    const handleAddSave = (value: string) => {
        if (!value.trim()) {
            setIsAdding(false);
            return;
        }
        request.post('/appEvaluate/insertAppEvaluateDimension', {
            params: {
                "staffId": userInfo?.staffId,
                "dimensionNm": value
            },
        })
            .then((res: any) => {
                if (res?.returnCode === "0") {
                    const newItem: SelectItem = {
                        label: value,
                        value: value,
                    };
                    setDimensions([...dimensions, newItem]);
                    setIsAdding(false);
                    message.success('新增成功');
                    if (onRefresh) {
                        onRefresh();
                    }
                } else {
                    message.error(res?.returnMessage || '新增失败');
                }
            })
            .catch(() => {
                message.error('新增失败');
            })
            .finally(() => {
                setIsAdding(false);
            });
    };


    return (
        <Modal
            title="评估维度管理"
            open={dimensionManagerVisible}
            onCancel={onCancel}
            footer={null}
            width={500}
            destroyOnClose
        >
            <div
                className={styles['group-header']}
                onClick={() => setCollapsed(!collapsed)}
            >
                <span className={styles['group-title']}>根目录</span>
                <span
                    className={styles['arrow-icon']}
                    style={{transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}}
                >▼</span>
            </div>

            {!collapsed && (
                <div className={styles['dimension-list']}>
                    {dimensions.map((item, index) => (
                        <div
                            key={item.value}
                            className={`${styles['dimension-item-row']} ${index < dimensions.length - 1 ? styles['has-border'] : ''}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {editingIndex === index ? (
                                <>
                                    <Checkbox onChange={() => {
                                    }}/>
                                    <Input
                                        autoFocus
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={handleEditSave}
                                        onPressEnter={handleEditSave}
                                        className={styles['edit-input']}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </>
                            ) : (
                                <>
                                    <Checkbox onChange={() => {
                                    }}/>
                                    <span
                                        className={styles['dimension-name']}
                                        onDoubleClick={() => handleEdit(index)}
                                    >
                                        {item.label}
                                    </span>
                                    <Space size={8} style={{
                                        opacity: hoveredIndex === index ? 1 : 0,
                                        transition: 'opacity 0.2s'
                                    }}>
                                        <EditOutlined
                                            className={styles['edit-icon']}
                                            onClick={() => handleEdit(index)}
                                        />
                                        <DeleteOutlined
                                            className={styles['delete-icon']}
                                            onClick={() => handleDelete(index)}
                                        />
                                    </Space>
                                </>
                            )}
                        </div>
                    ))}

                    <div className={styles['add-section']}>
                        {isAdding ? (
                            <Input
                                autoFocus
                                placeholder=""
                                className={styles['edit-input']}
                                onBlur={(e) => handleAddSave(e.target.value)}
                                onPressEnter={(e) => handleAddSave((e.target as HTMLInputElement).value)}
                            />
                        ) : (
                            <Button
                                type="link"
                                icon={<PlusOutlined/>}
                                className={styles['add-btn']}
                                onClick={() => {
                                    if (dimensions.length >= 99) {
                                        message.warning('评估维度最多有99个');
                                        return;
                                    }
                                    setIsAdding(true);
                                }}
                            > 新增</Button>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default AppEvaluationModal;
