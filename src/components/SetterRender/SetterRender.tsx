import React, { memo, useState, useEffect } from 'react';
import { Form, Input, InputNumber, Radio, Select, Switch, Slider, FormInstance, Tooltip, Upload, Popover, Button, TreeSelect } from 'antd';
import { message } from '@/utils/AntdGlobal';
import * as icons from '@ant-design/icons';
import { QuestionCircleOutlined, CaretDownOutlined, UploadOutlined } from '@ant-design/icons';
import { SchemaType } from './../../packages/types';
import MColorPicker from '../ColorPicker';
import VariableBindInput from '../VariableBind/VariableBind';
import InputSelect from '../InputSelect/InputSelect';
import InputPx from '../StyleConfig/InputPx';
import styles from './index.module.less';
import BasicConfig from '@/packages/Container/Cycle/BasicConfig';
import { apiListInfo } from '@/stores/apiListStore';
import IconSelect from "@/packages/components/icon-select/IconSelect";

// 如果没有设置label，则独占一行
const formLayoutFull = {
    labelCol: { span: 0 },
    wrapperCol: { span: 24 },
};

interface IAttrs {
    attrs: SchemaType[];
    form: FormInstance;
    config: any;
}

interface UploadItemProps {
    item: SchemaType;
    form: FormInstance;
}

const UploadItem = ({ item, form }: UploadItemProps) => {
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        if (!item.name) {
            setFileList([]);
            return;
        }
        const uploadValue = form.getFieldValue(item.name);
        console.log(uploadValue)
        const fileName = uploadValue && uploadValue.split('/').pop().split('?')[0] || 'file';
        if (typeof uploadValue === 'string' && uploadValue) {
            setFileList([{
                uid: '-1',
                name: fileName,
                status: 'done' as const,
                url: uploadValue,
            }]);
        } else if (Array.isArray(uploadValue) && uploadValue.length > 0) {
            setFileList(uploadValue);
        } else {
            setFileList([]);
        }
    }, [form, item.name]);

    return (
        <Form.Item name={item.name} label={item.label} tooltip={item.tooltip}>
            <Upload
                {...item.props}
                customRequest={(options) => {
                    if (item.props?.customRequest) {
                        item.props.customRequest(options, form);
                    }
                }}
                onRemove={() => {
                    if (item.props?.onRemove) {
                        return item.props.onRemove({}, form);
                    }
                    form.setFieldValue(item.name, undefined);
                    setFileList([]);
                    return true;
                }}
                onChange={(info) => {
                    setFileList(info.fileList);
                    if (info.fileList.length === 0) {
                        form.setFieldValue(item.name, undefined);
                    } else if (info.fileList.length > 0 && info.fileList[0].url) {
                        form.setFieldValue(item.name, info.fileList[0].url);
                    }
                    if (item.props?.onChange) {
                        item.props.onChange(info, form);
                    }
                }}
                fileList={fileList}
                beforeUpload={(file: any) => {
                    if (!file.size) {
                        message.error('文件大小必须大于0KB');
                        return Upload.LIST_IGNORE;
                    }
                    const maxSize = 4 * 1024 * 1024;
                    if (file.size > maxSize) {
                        message.error('文件大小不能超过4MB');
                        return Upload.LIST_IGNORE;
                    }
                }}
            >
                <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
        </Form.Item>
    );
};

const typeComponentMap: Record<string, (item: SchemaType, ctx: { form: FormInstance; config: any; apiList: any }) => React.ReactNode> = {
    Input: (item, { config }) => {
        let component = <Input {...item.props} />;
        if (item.label == '权限名称' && config?.props?.authInfo && config?.props?.authCode && config?.props?.authInfo[config?.props?.authCode]) {
            component = <Input {...item.props} disabled />;
        }
        if (item.label == '分类字段') {
            component = <Input {...item.props} disabled />;
        }
        return component;
    },
    InputPx: (item) => <InputPx {...item.props} />,
    TextArea: (item) => <Input.TextArea rows={3} cols={8} {...item.props} />,
    InputSelect: (item) => <InputSelect {...item.props} />,
    Switch: (item) => <Switch {...item.props} />,
    Select: (item) => <Select {...item.props} suffixIcon={<CaretDownOutlined />} />,
    TreeSelect: (item, { apiList }) => {
        if (item.props.isApiList) {
            return <TreeSelect {...item.props} treeData={apiList} />;
        }
        return <TreeSelect {...item.props} />;
    },
    Radio: (item) => <Radio.Group {...item.props} suffixIcon={<CaretDownOutlined />} />,
    InputNumber: (item) => <InputNumber {...item.props} style={{ width: '100%' }} />,
    RadioGroup: (item) => <Radio.Group {...item.props} />,
    ColorPicker: (item) => <MColorPicker {...item.props} format="hex" />,
    Slider: (item) => <Slider {...item.props} />,
    Variable: (item) => <VariableBindInput {...item.props} />,
    Icons: () => {
        return (
            <IconSelect placeholder={'请选择按钮图标'}/>
        );
    },
};

const SetterRender = memo(({ attrs, form, config }: IAttrs) => {
    const apiList = apiListInfo((state: any) => state.apiList);
    const ctx = { form, config, apiList };

    const renderTitle = (item: SchemaType, key: string) => {
        if (item.popover) {
            return (
                <Popover title={item.popover?.title} content={item.popover.content} placement={item.popover.placement || 'left'} key={key}>
                    <h2 className={styles.title}>
                        <span style={{ marginRight: 10 }}>{item.label}</span>
                        <QuestionCircleOutlined />
                    </h2>
                </Popover>
            );
        }
        if (item.key == 'uniqueField') {
            return (
                <h2 className={styles.title} key={key}>
                    <span style={{ marginRight: 10 }}>{item.label}</span>
                    <BasicConfig></BasicConfig>
                </h2>
            );
        }
        return (
            <h2 className={styles.title} key={key}>
                <span style={{ marginRight: 10 }}>{item.label}</span>
                {item.tooltip ? <Tooltip title={item.tooltip}>{<QuestionCircleOutlined />}</Tooltip> : null}
                {item.link ? (
                    <a href={item.link.url} target="_blank" style={{ fontSize: 12 }}>
                        {item.link.label}
                    </a>
                ) : null}
            </h2>
        );
    };

    const renderFormItem = (item: SchemaType, key: string) => {
        const componentFn = typeComponentMap[item.type];
        if (item.type === 'function') {
            if (['TableSetting', 'DescItemSetting', 'LinkSetting', 'StatisticsConfig'].includes(item.key || '')) {
                return item.render?.({ form, config });
            }
            return item.render?.(form);
        }
        if (item.type === 'Upload') {
            return <UploadItem key={key} item={item} form={form} />;
        }
        if (!componentFn) return null;
        const component = componentFn(item, ctx);
        return (
            <Form.Item
                key={key}
                name={item.name}
                label={item.label}
                tooltip={item.tooltip}
                hidden={item.hidden}
                valuePropName={item.type === 'Switch' ? 'checked' : undefined}
                {...(item.label ? null : formLayoutFull)}
            >
                {component}
            </Form.Item>
        );
    };


    const nodes = attrs.reduce<React.ReactNode[]>((acc, item, index) => {
        if (!item) return acc;

        if (item.condition && !item.condition(config?.props)) {
            return acc;
        }
        const key = item.key || item.name?.toString() || item.label?.toString() + index.toString();
        if (item.type === 'Title') {
            acc.push(renderTitle(item, key));
        } else {
            const node = renderFormItem(item, key);
            if (node) acc.push(node);
        }
        return acc;
    }, []);

    return (
        <>
            {nodes}
            <h2 className={styles.title} key="visibleTitle">
                <span style={{ marginRight: 10 }}>组件显隐</span>
            </h2>
            <Form.Item key="showOrHide" name="showOrHide" label="显示条件" tooltip="通过脚本控制组件的显示和隐藏">
                <VariableBindInput />
            </Form.Item>
            <Form.Item key="elementAlias" name="elementAlias" label="组件别名" tooltip="自定义别名，方便在大纲和事件流中显示和查找">
                <Input></Input>
            </Form.Item>
        </>
    );
});

export default SetterRender;
