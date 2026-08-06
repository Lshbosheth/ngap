import { Input, Modal, Form, Col, Row, Select, Switch, Button, Card, InputNumber, Radio, Tabs, FormInstance, Tooltip, Flex, Upload, UploadProps, UploadFile } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { useImperativeHandle, useState, MutableRefObject, memo, useMemo } from 'react';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { ComponentType } from '../../types';
import VsEditor from './../../../components/VsEditor';
import { createId } from './../../../utils/util';
import VariableBind from './../../../components/VariableBind/VariableBind';
import MColorPicker from '../../../components/ColorPicker';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import request from './../../../utils/request';
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
    const [form] = useForm();
    const { pageStore } = useAppContext();
    const { selectedElement, elementsMap, editTableProps, editEvents } = pageStore(
        useShallow((state: any) => ({
        selectedElement: state.selectedElement,
        elementsMap: state.page.pageData.elementsMap,
        editTableProps: state.editTableProps,
        editEvents: state.editEvents,
        }))
    );

    // 暴露方法
    useImperativeHandle(props.columnRef, () => ({
        open(index: number) {
            const values = elementsMap[selectedElement?.id as string];
            const defaultValues = values.config.props.columns[index];
            const renderFn =
                defaultValues.render ||
                `function render(text, record, index) {
                return text;
            }`;
            const arrPs:any = [];
            for (let j = 0; j < defaultValues?.list?.length; j++) {
                if(values?.config?.props?.authInfo){
                    const ffldsa = values?.config?.props?.authInfo[defaultValues.list[j].authCode]?true:false
                    arrPs.push(ffldsa)
                }
            }
            setlistArr(arrPs)
            form.resetFields();
            form.setFieldsValue({
                align: 'left',
                fixed: false,
                type: 'text',
                empty: '-',
                isShow: 'show',
                ...defaultValues,
                render: renderFn,
                onCell:
                    defaultValues.onCell ||
                    `function onCell(record, index) {
    // 此处可以设置数据跨行、跨列
    return {

    }
}`,
            summary:{
                align: 'center',
                ...defaultValues.summary,
                title: defaultValues?.summary?.title ||
`//pageData为当页表格数据, selectedRows为当前选中行数据
function summary(pageData, selectedRows) {
    return '';
}`
            },
            suffixIcon: {
                enabled: defaultValues.suffixIcon?.enabled || false,
                iconSrc: defaultValues.suffixIcon?.iconSrc || '',
                visibleLogic: defaultValues.suffixIcon?.visibleLogic ||
`function visibleLogic(record) {
    // record为当前行数据
    // 返回true显示图标，返回false隐藏图标
    return true;
}`,
                onClickEvent: defaultValues.suffixIcon?.onClickEvent || '',
                onMouseEnterEvent: defaultValues.suffixIcon?.onMouseEnterEvent || '',
                onMouseLeaveEvent: defaultValues.suffixIcon?.onMouseLeaveEvent || ''
            }
            });
            setIndex(index);
            setTitle(`列设置 - ${defaultValues.title || ''}(${defaultValues?.dataIndex || ''})`);
            setVisible(true);
        },
    }));

    // Tab组件
    const items = useMemo(
        () => [
            {
                key: 'basic',
                label: '基础配置',
                children: <AttrSetting props={props} />,
            },
            {
                key: 'display',
                label: '展示配置',
                forceRender: true,
                children: <DisplaySetting props={listArr} />,
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
            }
        ],
        [props,listArr],
    );

    // 提交
    const handleOk = () => {
        form.validateFields().then(() => {
            const values = form.getFieldsValue();
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
            let events: any = element.events?.filter((item: any) => item.value.indexOf('Dynamic') == -1 && item.value.indexOf('Icon') == -1);
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
            // 如果后缀图标点击事件存在，先删除
            const oldSuffixIconClickEvent = element.config.props.columns[index].suffixIcon?.onClickEvent;
            if (oldSuffixIconClickEvent) {
                events = events.filter((item: any) => item.value !== oldSuffixIconClickEvent);
            }
            // 处理后缀图标的点击事件
            if (values.suffixIcon?.enabled && values.suffixIcon?.onClickEvent) {
                events.push({
                    name: `列${values.title}图标点击事件`,
                    value: values.suffixIcon.onClickEvent,
                });
            }
            // 如果后缀图标鼠标移入事件存在，先删除
            const oldSuffixIconMouseEnterEvent = element.config.props.columns[index].suffixIcon?.onMouseEnterEvent;
            if (oldSuffixIconMouseEnterEvent) {
                events = events.filter((item: any) => item.value !== oldSuffixIconMouseEnterEvent);
            }
            // 处理后缀图标的鼠标移入事件
            if (values.suffixIcon?.enabled && values.suffixIcon?.onMouseEnterEvent) {
                events.push({
                    name: `列${values.title}图标鼠标移入事件`,
                    value: values.suffixIcon.onMouseEnterEvent,
                });
            }

            // 如果后缀图标鼠标移出事件存在，先删除
            const oldSuffixIconMouseLeaveEvent = element.config.props.columns[index].suffixIcon?.onMouseLeaveEvent;
            if (oldSuffixIconMouseLeaveEvent) {
                events = events.filter((item: any) => item.value !== oldSuffixIconMouseLeaveEvent);
            }
            // 处理后缀图标的鼠标移出事件
            if (values.suffixIcon?.enabled && values.suffixIcon?.onMouseLeaveEvent) {
                events.push({
                    name: `列${values.title}图标鼠标移出事件`,
                    value: values.suffixIcon.onMouseLeaveEvent,
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
        <Modal title={title} open={visible} onOk={handleOk} onCancel={handleCancel} width={900} destroyOnClose>
            <Form form={form} labelCol={{ span: 6 }}>
                <Tabs items={items} />
            </Form>
        </Modal>
    );
});

// 属性设置
const AttrSetting = (props: any) => {
    return (
        <>
            <Row>
                <Col span={12}>
                    <Form.Item label="列头" name="title" rules={[{ required: true, message: '请输入列名' }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item shouldUpdate label="字段" name="dataIndex" rules={[{ required: true, message: '请选择字段名称' }]}>
                        <Select
                            placeholder="请选择字段"
                            options={props.props.options}
                            onChange={(option) => {
                                // 当选中一个选项时，更新对应的 dataIndex
                                props.props.form.setFieldValue(['columns', 'dataIndex'], option?.value);
                            }}
                            // 从表单中读取 dataIndex 字段
                            value={props.props.form.getFieldValue('dataIndex')}
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
                        <InputNumber placeholder="eg: 100" />
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
                    <Form.Item label="是否隐藏" name="isShow">
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="show">显示</Radio.Button>
                            <Radio.Button value="hide">隐藏</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
};

// 展示设置
const DisplaySetting = (listArr:any) => {
    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 8 },
    };
    return (
        <>
            <Form.Item label="显示格式" name="type" {...layout}>
                <Select>
                    <Select.Option value="text">单行文本</Select.Option>
                    <Select.Option value="multiline">
                        <Flex justify="space-between">
                            <span>多行文本</span>
                            <span>
                                <Tooltip
                                    title="需要返回数组格式：[{label: '名称',value: 'Jack'}]"
                                    getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement!}
                                    placement="right"
                                    overlayStyle={{
                                        maxWidth: '245px', // 自定义最大宽度
                                        whiteSpace: 'normal', // 允许自动换行（覆盖默认 nowrap）
                                        wordBreak: 'break-word', // 长单词/链接自动断行
                                    }}
                                >
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </span>
                        </Flex>
                    </Select.Option>
                    <Select.Option value="status">
                        <Flex justify="space-between">
                            <span>状态</span>
                            <span>
                                <Tooltip
                                    title="需要返回数组格式：[{status: 'success',text: '提交完成'}]"
                                    getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement!}
                                    placement="right"
                                    overlayStyle={{
                                        maxWidth: '245px', // 自定义最大宽度
                                        whiteSpace: 'normal', // 允许自动换行（覆盖默认 nowrap）
                                        wordBreak: 'break-word', // 长单词/链接自动断行
                                    }}
                                >
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </span>
                        </Flex>
                    </Select.Option>
                    <Select.Option value="image">
                        <Flex justify="space-between">
                            <span>图片</span>
                            <span>
                                <Tooltip
                                    title="支持单张和多张预览，多张图片格式：['xxx.png','xxx.jpg']"
                                    getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement!}
                                    placement="right"
                                    overlayStyle={{
                                        maxWidth: '245px', // 自定义最大宽度
                                        whiteSpace: 'normal', // 允许自动换行（覆盖默认 nowrap）
                                        wordBreak: 'break-word', // 长单词/链接自动断行
                                    }}
                                >
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </span>
                        </Flex>
                    </Select.Option>
                    <Select.Option value="date1">日期-不含时分秒</Select.Option>
                    <Select.Option value="date2">日期-包含时分秒</Select.Option>
                    <Select.Option value="money">金额千分位</Select.Option>
                    <Select.Option value="number">数字千分位</Select.Option>
                    <Select.Option value="tag">
                        <Flex justify="space-between">
                            <span>标签</span>
                            <span>
                                <Tooltip
                                    title="支持颜色配置，返回格式：[{label:'名称',color:'green'}]"
                                    getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement!}
                                    placement="right"
                                    overlayStyle={{
                                        maxWidth: '245px', // 自定义最大宽度
                                        whiteSpace: 'normal', // 允许自动换行（覆盖默认 nowrap）
                                        wordBreak: 'break-word', // 长单词/链接自动断行
                                    }}
                                >
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </span>
                        </Flex>
                    </Select.Option>
                    <Select.Option value="action">操作</Select.Option>
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
            <Form.Item shouldUpdate noStyle>
                {(form: FormInstance) => {
                    const type = form.getFieldValue('type');
                    if (type === 'image')
                        return (
                            <Form.Item name="imageConfig">
                                <Form.Item label="宽度" name={['imageConfig', 'width']} {...layout}>
                                    <Input placeholder="string | number" />
                                </Form.Item>
                                <Form.Item label="高度" name={['imageConfig', 'height']} {...layout}>
                                    <Input placeholder="string | number" />
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

            {/* 后缀图标配置 */}
            <Row>
                <Col span={24}>
                    <Form.Item
                        label="启用后缀图标"
                        name={['suffixIcon', 'enabled']}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 21 }}
                        tooltip="开启后，会在文本后面追加一个图标"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    <Form.Item shouldUpdate noStyle>
                        {(innerForm: FormInstance) => {
                            const enabled = innerForm.getFieldValue(['suffixIcon', 'enabled']);
                            if (enabled) {
                                return (
                                    <>
                                        <Form.Item
                                            label="图标配置"
                                            name={['suffixIcon', 'iconSrc']}
                                            labelCol={{ span: 4 }}
                                            wrapperCol={{ span: 21 }}
                                            tooltip="上传图标文件，支持图片格式"
                                        >
                                            <Upload
                                                action="/csf/call/importOssByFile"
                                                accept="image/*"
                                                maxCount={1}
                                                showUploadList={true}
                                                fileList={
                                                    (() => {
                                                        const iconSrc = innerForm.getFieldValue(['suffixIcon', 'iconSrc']);
                                                        if (!iconSrc) return [];

                                                        // 处理不同类型的iconSrc
                                                        let url = '';
                                                        let fileName = '已上传图标';

                                                        if (typeof iconSrc === 'string') {
                                                            url = iconSrc;
                                                            fileName = url.split('/').pop() || '已上传图标';
                                                        } else if (iconSrc?.response?.data?.url) {
                                                            url = iconSrc.response.data.url;
                                                            fileName = url.split('/').pop() || iconSrc.name || '已上传图标';
                                                        } else if (iconSrc?.url) {
                                                            url = iconSrc.url;
                                                            fileName = url.split('/').pop() || iconSrc.name || '已上传图标';
                                                        }

                                                        if (!url) return [];

                                                        return [{
                                                            uid: iconSrc?.uid || '-1',
                                                            name: fileName,
                                                            status: 'done' as const,
                                                            url: url,
                                                            thumbUrl: url,
                                                            response: { data: { url: url } }
                                                        }];
                                                    })()
                                                }
                                                customRequest={(options:any) => {
                                                    const { file, onSuccess } = options;
                                                    request
                                                        .upload('/csf/call/importOssByFile', 'fileupload', file, { type: 'image' })
                                                        .then((res) => {
                                                            onSuccess({ data: { url: res.bean.url } });
                                                            innerForm.setFieldValue(['suffixIcon', 'iconSrc'], String(res.bean.url));
                                                            message.success('图标上传成功');
                                                        })
                                                        .catch((err) => {
                                                            console.error('上传失败:', err);
                                                        });
                                                }}
                                                onRemove={async (file) => {
                                                    // 获取当前图标URL
                                                    const currentIconSrc = innerForm.getFieldValue(['suffixIcon', 'iconSrc']);

                                                    // 如果有图标URL，先调用删除接口
                                                    if (currentIconSrc && typeof currentIconSrc === 'string') {
                                                        try {
                                                            await request.post('/csf/call/deleteOssByFile', {
                                                                params: {
                                                                    url: currentIconSrc
                                                                }
                                                            });
                                                            message.success('图标删除成功');

                                                            // 删除成功后清除表单值
                                                            innerForm.setFieldValue(['suffixIcon', 'iconSrc'], '');
                                                            return true;
                                                        } catch (error) {
                                                            console.error('删除 OSS 文件失败:', error);
                                                            return false; // 返回 false 阻止删除
                                                        }
                                                    }

                                                    // 如果没有图标URL，直接清除表单值
                                                    innerForm.setFieldValue(['suffixIcon', 'iconSrc'], '');
                                                    return true;
                                                }}
                                                beforeUpload={(file: any) => {
                                                    if (!file.size) {
                                                        message.error('文件大小必须大于0KB');
                                                        return Upload.LIST_IGNORE;
                                                    }
                                                    const maxSize = 4 * 1024 * 1024; // 10MB
                                                    if (file.size > maxSize) {
                                                        message.error('文件大小不能超过4MB');
                                                        return Upload.LIST_IGNORE;
                                                    }
                                                }}
                                            >
                                                <Button icon={<PlusOutlined />}>上传图标</Button>
                                            </Upload>
                                        </Form.Item>
                                        <Form.Item
                                            label="显隐逻辑"
                                            name={['suffixIcon', 'visibleLogic']}
                                            labelCol={{ span: 4 }}
                                            wrapperCol={{ span: 21 }}
                                            tooltip="通过函数方式控制图标显隐，返回true显示，false隐藏"
                                        >
                                            <VsEditor />
                                        </Form.Item>
                                        <Form.Item
                                            label="点击事件"
                                            name={['suffixIcon', 'onClickEvent']}
                                            labelCol={{ span: 4 }}
                                            wrapperCol={{ span: 21 }}
                                            tooltip="鼠标点击单元格后缀图标执行的事件流，输入事件名称可在事件区域配置点击事件，注意事件名称需唯一"
                                        >
                                            <Input placeholder="点击事件名称" />
                                        </Form.Item>
                                        <Form.Item
                                            label="鼠标移入事件"
                                            name={['suffixIcon', 'onMouseEnterEvent']}
                                            labelCol={{ span: 4 }}
                                            wrapperCol={{ span: 21 }}
                                            tooltip="鼠标移入单元格后缀图标执行的事件流，输入事件名称可在事件区域配置移入事件，注意事件名称需唯一"
                                        >
                                            <Input placeholder="鼠标移入事件名称" />
                                        </Form.Item>
                                        <Form.Item
                                            label="鼠标移出事件"
                                            name={['suffixIcon', 'onMouseLeaveEvent']}
                                            labelCol={{ span: 4 }}
                                            wrapperCol={{ span: 21 }}
                                            tooltip="鼠标移出单元格后缀图标执行的事件流，输入事件名称可在事件区域配置移出事件，注意事件名称需唯一"
                                        >
                                            <Input placeholder="鼠标移出事件名称" />
                                        </Form.Item>
                                    </>
                                );
                            }
                            return null;
                        }}
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
                <Col span={24}>
                    <Form.Item
                        label="显示名称"
                        name={["summary", "title"]}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 21 }}
                        tooltip="通过编程的方式实现最终显示名称，不支持ReactNode渲染。例如：if(text === 1)return '在线'; "
                    >
                        <VsEditor />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item label="跨列" name={["summary", "colSpan"]} tooltip='合计行跨列，设置为0时，不显示合计行，假设该行需要合并两列，设置为2'>
                        <InputNumber placeholder="eg: 2" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="颜色" name={["summary", "color"]} tooltip='合计行字体颜色'>
                        <MColorPicker/>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="对齐方式" name={["summary", "align"]}>
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
