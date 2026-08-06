import { Input, Modal, Form, Col, Row, Select, Switch, Button, Card, InputNumber, Radio, Tabs, FormInstance, Tooltip, Flex, Space } from 'antd';
import { message } from '@/utils/AntdGlobal';
import TagSetting from './TagSetting';
import { ActionType } from './TagSetting/TriggerEventItem';
import { useImperativeHandle, useState, MutableRefObject, memo, useMemo, useRef, CSSProperties } from 'react';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined, FunctionOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { ComponentType } from '../../types';
import VsEditor from '../../../components/VsEditor';
import { createId } from '../../../utils/util';
import VariableBind from '../../../components/VariableBind/VariableBind';
import MColorPicker from '../../../components/ColorPicker';
import { useAppContext } from '../../../utils/AppProvider';
import VariableSelect from '@/components/VariableBind/VariableSelect';
import { UseMaterialTools } from '../../utils/useMaterialTools';
import { hideBox } from './index.module.less';
import InputPx from '@/components/StyleConfig/InputPx';
import Item from 'antd/es/list/Item';
export interface IModalProp {
    columnRef: MutableRefObject<{ open: (index: number) => void } | undefined>;
    update: (vals: any, index: number) => void;
    options: any;
    form: any;
}
/**
 * 列设置
 */

const ColumnSetting = memo((props: IModalProp) => {
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);
    const [title, setTitle] = useState('');
    const [listArr, setlistArr] = useState([]);
    const [currentColumn, setCurrentColumn] = useState<string>('');
    const [currentColumnTitle, setCurrentColumnTitle] = useState<string>('');
    const [form] = useForm();
    const tagSettingValueRef = useRef<any[]>([]);
    const materialTools = UseMaterialTools();
    const { pageStore } = useAppContext();
    const { selectedElement, elementsMap, editTableProps, editEvents, variableData } = pageStore((state: any) => ({
        selectedElement: state.selectedElement,
        elementsMap: state.page.pageData.elementsMap,
        editTableProps: state.editTableProps,
        editEvents: state.editEvents,
        variableData: state.page.pageData.variableData,
    }));

    // 暴露方法
    useImperativeHandle(props.columnRef, () => ({
        open(index: number) {
            const values = elementsMap[selectedElement?.id as string];
            const formColumns = form.getFieldValue('columns') || [];
            const defaultValues = formColumns[index] || values?.config?.props?.columns[index];
            if (!defaultValues) {
                console.error('列数据不存在', index);
                return;
            }
            const renderFn =
                defaultValues.render ||
                `function render(text, record, index) {
                return text;
            }`;
            const arrPs: any = [];
            for (let j = 0; j < defaultValues?.list?.length; j++) {
                if (values?.config?.props?.authInfo) {
                    const ffldsa = values?.config?.props?.authInfo[defaultValues.list[j].authCode] ? true : false;
                    arrPs.push(ffldsa);
                }
            }
            setlistArr(arrPs);
            form.resetFields();

            let titleDisplayValue = '';
            const titleObj = defaultValues.title;
            if (typeof titleObj === 'string') {
                titleDisplayValue = titleObj;
            } else if (titleObj?.type === 'static') {
                titleDisplayValue = titleObj.value || '';
            } else if (titleObj?.type === 'variable') {
                titleDisplayValue = materialTools.renderFormula(titleObj.value, variableData || {}, true) || titleObj.value || '';
            }

            const titleForForm = typeof titleObj === 'string' ? titleObj : titleObj;
            form.setFieldsValue({
                align: 'left',
                fixed: false,
                type: 'text',
                empty: '-',
                isHide: {
                    switch: false,
                    expression: '',
                },
                filter: false,
                sortable: false,
                analysisHtml: false,
                isShow: 'show',
                verticalMerge: false,
                mergeMode: 'continuous',
                ...defaultValues,
                title: titleForForm,
                headerCheckable: defaultValues.headerCheckable || false,
                cellCheckable: defaultValues.cellCheckable || false,
                render: renderFn,
                onCell:
                    defaultValues.onCell ||
                    `function onCell(record, index) {
                        // 此处可以设置数据跨行、跨列
                        return {

                        }
                    }`,
                summary: {
                    align: 'center',
                    ...defaultValues.summary,
                    enabled: defaultValues?.summary?.enabled || false,
                    calculationScope: defaultValues?.summary?.calculationScope || 'currentPage',
                    calculationType: defaultValues?.summary?.calculationType || 'sum',
                },
            });
            setIndex(index);
            setTitle(`列设置 - ${titleDisplayValue || ''}(${defaultValues?.dataIndex || ''})`);
            setCurrentColumn(defaultValues?.dataIndex || '');
            setCurrentColumnTitle(titleDisplayValue);
            tagSettingValueRef.current = defaultValues.tagSetting || [];
            setVisible(true);
        },
    }));

    // Tab组件
    const items = useMemo(
        () => [
            {
                key: 'basic',
                label: '基础配置',
                children: <AttrSetting props={props} form={form} renderFormula={materialTools.renderFormula} variableData={variableData} />,
            },
            {
                key: 'display',
                label: '展示配置',
                forceRender: true,
                children: <DisplaySetting props={listArr} form={form} />,
            },
            {
                key: 'custom',
                label: '自定义',
                forceRender: true,
                children: <CustomRender />,
            },
            {
                key: 'summary',
                label: '合计配置',
                forceRender: true,
                children: <SummarySetting />,
            },
            {
                key: 'tag',
                label: '动态规则',
                forceRender: true,
                children: (
                    <TagSetting
                        options={
                            elementsMap[selectedElement?.id as string]?.config?.props?.columns?.map((col: any) => ({
                                label: col.dataIndex,
                                value: col.dataIndex,
                            })) || []
                        }
                        currentColumn={currentColumn}
                        currentColumnTitle={currentColumnTitle}
                        value={tagSettingValueRef.current}
                        onChange={(cases) => {
                            tagSettingValueRef.current = cases;
                        }}
                    />
                ),
            },
        ],
        [props, listArr, currentColumn, elementsMap, selectedElement?.id, form],
    );

    // 提交
    const handleOk = () => {
        form.validateFields().then(() => {
            const allEvents = tagSettingValueRef.current.flatMap((caseItem: any) =>
                (caseItem.branches || []).flatMap((branch: any) => branch.config?.events || []),
            );
            const iconEvents = allEvents.filter((event: any) => event.action === ActionType.ShowIcon);
            for (const event of iconEvents) {
                if (!event.iconUrl) {
                    message.error('设置图标的触发结果中，图标上传为必填项');
                    return;
                }
                if (!event.iconName || !event.iconName.trim()) {
                    message.error('设置图标的触发结果中，图标名称为必填项');
                    return;
                }
            }
            const iconNames = iconEvents.map((event: any) => event.iconName?.trim()).filter(Boolean);
            const duplicateNames = iconNames.filter((name, index) => iconNames.indexOf(name) !== index);
            if (duplicateNames.length > 0) {
                message.error(`图标名称不可重复，当前重复的图标名称为：${[...new Set(duplicateNames)].join('、')}`);
                return;
            }

            const values = form.getFieldsValue();
            // 使用 ref 获取 tagSetting 值
            values.tagSetting = tagSettingValueRef.current;
            const element: ComponentType = elementsMap[selectedElement?.id as string];
            // 给当前列创建事件
            const cellEventName = createId(`ClickCell${values.dataIndex}`);
            if (values.clickable) {
                values.eventName = values.eventName || cellEventName;
            } else {
                values.eventName = '';
            }
            // 更新操作列属性
            editTableProps({
                id: selectedElement?.id,
                type: 'column',
                index,
                props: { ...values, key: values.dataIndex || index },
            });
            // 需要提前把已经存进去的动态事件过滤掉，不然会重复
            let events: any = element.events?.filter((item: any) => item.value.indexOf('Dynamic') == -1);
            values.list?.map((item: any, index: number) => {
                let name = '';
                if (typeof item.text === 'string' || item.text?.type === 'static') {
                    name = '点击' + (item.text?.value || item.text) + '事件';
                } else {
                    name = `操作列动态按钮${index + 1}事件`;
                }
                // 动态新增的按钮，需要动态生成事件
                events.push({
                    name,
                    value: item.eventName,
                });
            });
            // 如果列点击事件存在，先删除
            const oldEventName = element.config.props.columns[index].eventName;
            events = events.filter((item: any) => item.value != oldEventName);
            // 更新列点击事件
            if (values.clickable) {
                events.push({
                    name: `列${values.title}事件`,
                    value: values.eventName || cellEventName,
                });
            }
            // 更新操作列事件
            editEvents({
                id: element.id,
                events,
            });
            props.update(values, index);
            setVisible(false);
        });
    };

    // 关闭
    const handleCancel = () => {
        setVisible(false);
    };
    return (
        <Modal title={title} open={visible} onOk={handleOk} onCancel={handleCancel} width={900} destroyOnClose maskClosable={false} keyboard={false}>
            <Form form={form} labelCol={{ span: 6 }}>
                <Tabs items={items} />
            </Form>
        </Modal>
    );
});

// 属性设置
const AttrSetting = (props: any) => {
    const { form, props: outProps, renderFormula, variableData } = props;
    const { form: outForm } = outProps;
    const sortable = Form.useWatch('sortable', form);
    const verticalMerge = Form.useWatch('verticalMerge', form);
    const variableRef = useRef<{
        open: (value: string) => void;
    }>(null);
    const openVariablePopup = () => {
        const expression = form?.getFieldValue(['isHide', 'expression']);
        variableRef.current?.open(expression);
    };
    const selectVariable = ({ value }: { value: string }) => {
        form?.setFieldValue(['isHide', 'expression'], value);
    };
    // 自定义 "是否隐藏"组件，手动从 props 取出 checked/onChange 传给 Switch
    const SwitchWithIcon = (switchProps: { checked?: boolean; onChange?: (val: boolean) => void }) => {
        return (
            <Space className={hideBox}>
                <Switch checked={switchProps.checked} onChange={switchProps.onChange} />
                <FunctionOutlined onClick={openVariablePopup} style={{ marginLeft: 4, color: '#1890ff', fontSize: '16px' }} />
            </Space>
        );
    };
    // 处理 列排序 和 纵向合并 不能同时打开逻辑
    const handlerSortMerge = (check: boolean, type: 'merge' | 'sort') => {
        if (!check) return;
        if (type === 'merge') {
            form?.setFieldValue('sortable', false);
            form?.setFieldValue('sortableType', '');
        } else if (type === 'sort') {
            form?.setFieldValue('verticalMerge', false);
            form?.setFieldValue('sortableType', 'static');
        }
    };
    return (
        <>
            <Row>
                <Col span={12}>
                    <Form.Item label="列头" name="title" rules={[{ required: true, message: '请��入列名' }]}>
                        <VariableBind renderFormula={renderFormula} variableData={variableData} disabled={false} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item shouldUpdate label="字段" name="dataIndex" rules={[{ required: true, message: '请选择字段名称' }]}>
                        <Select
                            placeholder="请选择字段"
                            options={props.props.options}
                            onChange={(option) => {
                                // 当选中一个选项时，更新对应的 dataIndex
                                outForm.setFieldValue(['columns', 'dataIndex'], option?.value);
                            }}
                            // 从表单中读取 dataIndex 字段
                            value={outForm.getFieldValue('dataIndex')}
                        />
                    </Form.Item>
                    <Form.Item label="字段" name="dataIndex" hidden rules={[{ required: true, message: '请输入字段名称' }]}>
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item label="宽度" name="width">
                        <InputPx placeholder="eg: 100" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="对齐" name="align">
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="left">居左</Radio.Button>
                            <Radio.Button value="center">居中</Radio.Button>
                            <Radio.Button value="right">居右</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item label="固定方式" name="fixed">
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="">默认</Radio.Button>
                            <Radio.Button value="left">居左</Radio.Button>
                            <Radio.Button value="right">居右</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="表头跨列" name="colSpan">
                        <InputNumber placeholder="eg: 3" />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        label="是否隐藏"
                        name={['isHide', 'switch']}
                        tooltip="开启后，该列隐藏不展示，fx逻辑优先级高于开关。"
                        valuePropName="checked"
                    >
                        <SwitchWithIcon />
                    </Form.Item>
                </Col>
                {/* 添加隐藏的 expression 字段绑定 */}
                <Form.Item name={['isHide', 'expression']} hidden />
                <Col span={12}>
                    <Form.Item
                        label="列表头勾选"
                        name="headerCheckable"
                        tooltip="开启后对应列表头名称前展示复选框，支持选中列"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        label="列数据勾选"
                        name="cellCheckable"
                        tooltip="控制该列单元格的复选框展示，用于单元格级数据选择"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="列排序"
                        name="sortable"
                        tooltip="请确认列数据使用排序能力，合并列不支持排序能力，行合并数据排序时自动拆分展示。"
                        valuePropName="checked"
                    >
                        <Switch disabled={verticalMerge} onChange={(val: boolean) => handlerSortMerge(val, 'sort')} />
                    </Form.Item>
                </Col>
                {sortable && (
                    <Col span={12}>
                        <Form.Item label="排序类型" name="sortableType">
                            <Select
                                options={[
                                    {
                                        value: 'static',
                                        label: '前端排序',
                                    },
                                    {
                                        value: 'service',
                                        label: '服务端排序',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                )}
                <Col span={12}>
                    <Form.Item label="列筛选" name="filter" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="纵向合并" name="verticalMerge" valuePropName="checked">
                        <Switch disabled={sortable} onChange={(val: boolean) => handlerSortMerge(val, 'merge')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="合并模式"
                        name="mergeMode"
                        tooltip="相邻多行数据相同则连续自动合并，非相邻行的相同数据则不自动合并，树形结构仅对“无子节点”的行（叶子行），在同一父节点内进行连续同值合并。"
                    >
                        <Select placeholder="请选择合并模式">
                            <Select.Option value="continuous">连续同值自动合并</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <VariableSelect ref={variableRef} onSelect={selectVariable} />
        </>
    );
};

// 展示设置
const DisplaySetting = (listArr: any, form: FormInstance) => {
    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 8 },
    };
    const overlayStyle: CSSProperties = {
        maxWidth: '245px', // 自定义最大宽度
        whiteSpace: 'normal', // 允许自动换行（覆盖默认 nowrap）
        wordBreak: 'break-word', // 长单词/链接自动断行
    };
    type TypeItem = {
        label: string;
        value: string;
        tooltip?: string;
    };
    const typeList: TypeItem[] = [
        {
            label: '单行文本',
            value: 'text',
        },
        {
            label: '多行文本',
            value: 'multiline',
            tooltip: "需要返回数组格式：[{label: '名称',value: 'Jack'}]",
        },
        {
            label: '状态',
            value: 'statu',
            tooltip: "需要返回数组格式：[{status: 'success',text: '提交完成'}]",
        },
        {
            label: '图片',
            value: 'image',
            tooltip: "支持单张和多张预览，多张图片格式：['xxx.png','xxx.jpg']",
        },
        {
            label: '日期-不含时分秒',
            value: 'date1',
        },
        {
            label: '日期-包含时分秒',
            value: 'date2',
        },
        {
            label: '金额千分位',
            value: 'money',
        },
        {
            label: '数字千分位',
            value: 'number',
        },
        {
            label: '标签',
            value: 'tag',
            tooltip: "支持颜色配置，返回格式：[{label:'名称',color:'green'}]",
        },
        {
            label: '操作',
            value: 'action',
        },
    ];
    const handleTypeChange = (type: string) => {
        if (type === 'image') {
            form.setFieldValue(['imageConfig', 'width'], 30);
            form.setFieldValue(['imageConfig', 'height'], 30);
        } else {
            form.setFieldValue(['imageConfig', 'width'], null);
            form.setFieldValue(['imageConfig', 'height'], null);
        }
    };
    return (
        <>
            <Form.Item label="显示格式" name="type" {...layout}>
                <Select onChange={handleTypeChange}>
                    {typeList.map((typeItem) => {
                        return (
                            <Select.Option key={typeItem.value} value={typeItem.value}>
                                <Flex justify="space-between">
                                    <span>{typeItem.label}</span>
                                    {typeItem.tooltip && (
                                        <span>
                                            <Tooltip
                                                title={typeItem.tooltip}
                                                getPopupContainer={() => document.body}
                                                placement="right"
                                                overlayStyle={overlayStyle}
                                            >
                                                <QuestionCircleOutlined />
                                            </Tooltip>
                                        </span>
                                    )}
                                </Flex>
                            </Select.Option>
                        );
                    })}
                </Select>
            </Form.Item>
            <Form.Item label="可点击" name="clickable" tooltip="开启后，当前列展示为可点击的link格式，支持事件配置" {...layout}>
                <Switch />
            </Form.Item>
            <Form.Item name="eventName" hidden>
                <Input />
            </Form.Item>
            <Form.Item label="超长省略" name="ellipsis" tooltip="省略后，会自动开启tooltip功能" {...layout}>
                <Switch />
            </Form.Item>
            <Form.Item label="可复制" name="copyable" tooltip="开启后，列增加复制功能，只对文本生效" {...layout}>
                <Switch />
            </Form.Item>
            <Form.Item
                label="允许解析HTML"
                name="analysisHtml"
                tooltip="开启后，支持HTML标签解析能力，按接收到的格式展示文本信息。请确保传递信息合规!"
                {...layout}
            >
                <Switch />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
                {(form: FormInstance) => {
                    const type = form.getFieldValue('type');
                    if (type === 'image')
                        return (
                            <Form.Item name="imageConfig">
                                <Form.Item label="宽度" name={['imageConfig', 'width']} {...layout}>
                                    <InputPx placeholder="eg: 100" />
                                </Form.Item>
                                <Form.Item label="高度" name={['imageConfig', 'height']} {...layout}>
                                    <InputPx placeholder="eg: 100" />
                                </Form.Item>
                            </Form.Item>
                        );
                }}
            </Form.Item>
            <Form.Item shouldUpdate>
                {(form: FormInstance) => {
                    const type = form.getFieldValue('type'); // 假设你在某个地方已经定义了'type'字段
                    if (type === 'action') {
                        return (
                            <Form.Item label="折叠按钮" name="moreActionIndex" {...layout} tooltip="指定从第n个按钮开始折叠">
                                <InputNumber
                                    min={0}
                                    max={999}
                                    style={{
                                        width: '60px',
                                    }}
                                />
                            </Form.Item>
                        );
                    }
                    return null;
                }}
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
                {(form: FormInstance) => {
                    const type = form.getFieldValue('type');
                    if (type === 'action')
                        return (
                            <Form.List name="list">
                                {(fields: Array<{ key: number; name: number }>, { add, remove }: any) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Card
                                                style={{ width: '100%', marginBottom: 10 }}
                                                title="操作按钮设置"
                                                key={key}
                                                size="small"
                                                extra={
                                                    <Button onClick={() => remove(name)} icon={<MinusCircleOutlined />} type="text" danger>
                                                        删除
                                                    </Button>
                                                }
                                            >
                                                <Row gutter={5} style={{ marginBottom: -24 }}>
                                                    <Col span={7}>
                                                        <Form.Item {...restField} name={[name, 'text']} label="名称">
                                                            <VariableBind />
                                                        </Form.Item>
                                                    </Col>
                                                     <Col span={7}>
                                                        <Form.Item {...restField} name={[name, 'disable']} label="禁用">
                                                            <VariableBind />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={3}>
                                                        <Form.Item
                                                            label="danger"
                                                            name={[name, 'danger']}
                                                            labelCol={{ span: 14 }}
                                                            valuePropName="checked"
                                                        >
                                                            <Switch />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={7}>
                                                        <Form.Item
                                                            label="权限名称"
                                                            tooltip="配置权限名称，应用上架时会生成此按钮的功能权限，可根据功能权限管控显隐，请在用户中心分配给一线坐席使用"
                                                            name={[name, 'authCode']}
                                                            labelCol={{ span: 8 }}
                                                        >
                                                            <Input disabled={listArr?.props[key]} placeholder="请输入按钮权限名称" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={7}>
                                                        <Form.Item
                                                            label="三方脚本"
                                                            tooltip="通过脚本实现第三方系统按钮权限"
                                                            name={[name, 'authScript']}
                                                            labelCol={{ span: 8 }}
                                                        >
                                                            <VariableBind placeholder="自定义权限，执行脚本" />
                                                        </Form.Item>
                                                        <Form.Item name={[name, 'eventName']} hidden>
                                                            <Input />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        ))}
                                        <div style={{ marginTop: 15 }}>
                                            <Button
                                                type="dashed"
                                                block
                                                onClick={() => add({ text: '按钮', type: 'link', eventName: createId('Dynamic') })}
                                                icon={<PlusOutlined />}
                                            >
                                                新增操作按钮
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form.List>
                        );
                }}
            </Form.Item>
        </>
    );
};

// 自定义渲染
const CustomRender = () => {
    return (
        <div style={{ maxHeight: 350, overflowY: 'auto' }}>
            <Row>
                <Col span={24}>
                    <Form.Item
                        label="单元格渲染"
                        name="onCell"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 21 }}
                        tooltip="通过自定义onCell函数，实现数据跨行、跨列展示。"
                    >
                        <VsEditor />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item
                        label="自定义渲染"
                        name="render"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 21 }}
                        tooltip="通过编程的方式实现值渲染，不支持ReactNode渲染。例如：if(text === 1)return '在线'; "
                    >
                        <VsEditor />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

// 合计设置
const SummarySetting = (props: any) => {
    return (
        <>
            <Row>
                <Col span={8}>
                    <Form.Item label="启用合计" name={['summary', 'enabled']} valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="计算范围" name={['summary', 'calculationScope']}>
                        <Select placeholder="请选择">
                            <Select.Option value="currentPage">当前页列数据统计</Select.Option>
                            <Select.Option value="checkedRows">勾选行列数据统计</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="计算类型" name={['summary', 'calculationType']}>
                        <Select placeholder="请选择">
                            <Select.Option value="sum">求和</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label="跨列"
                        name={['summary', 'colSpan']}
                        tooltip="开启后当前列的合计单元格向后合并，若该列合计属性未开启，则合并能力不生效。设置为2时合并两列。"
                    >
                        <InputNumber placeholder="eg: 2" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="颜色" name={['summary', 'color']} tooltip="合计行字体颜色">
                        <MColorPicker />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="对齐方式" name={['summary', 'align']}>
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="left">居左</Radio.Button>
                            <Radio.Button value="center">居中</Radio.Button>
                            <Radio.Button value="right">居右</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
};

export default ColumnSetting;
