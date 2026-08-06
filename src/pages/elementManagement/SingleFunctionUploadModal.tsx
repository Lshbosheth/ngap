import React, { useMemo, useState } from 'react';
import { Alert, Button, Input, Modal, Space, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { message } from '@/utils/AntdGlobal';
import PreviewElementModal from './previewElementModal';

const DEFAULT_COMPONENT = `const CustomerInfoCard = ({ config }, ref) => {
    const { Card, Tag, Button } = antd;
    const [count, setCount] = React.useState(0);
    React.useImperativeHandle(ref, () => ({
        show: () => console.log('show'),
        hide: () => console.log('hide')
    }));
    return (
        <Card title={config?.props?.title || '自定义函数组件'} style={config?.style}>
            <p>{config?.props?.description || '这是通过单个 TSX 文件上传的组件。'}</p>
            <Space>
                <Tag color="blue">点击次数：{count}</Tag>
                <Button type="primary" onClick={() => setCount(value => value + 1)}>测试交互</Button>
            </Space>
        </Card>
    );
};

export default React.forwardRef(CustomerInfoCard);`;

const DEFAULT_SCHEMA = `export default {
    attrs: [
        { type: 'Title', label: '基础配置', key: 'basic' },
        { type: 'Input', label: '标题', name: ['title'] },
        { type: 'Input', label: '描述', name: ['description'] }
    ],
    config: {
        props: {
            title: '自定义函数组件',
            description: '平台已自动生成默认属性配置。'
        },
        style: { width: '100%' },
        api: {},
        events: []
    },
    events: [],
    methods: [
        { name: 'show', title: '显示' },
        { name: 'hide', title: '隐藏' }
    ]
};`;

interface Props {
    open: boolean;
    onCancel: () => void;
}

const SingleFunctionUploadModal: React.FC<Props> = ({ open, onCancel }) => {
    const [source, setSource] = useState(DEFAULT_COMPONENT);
    const [fileName, setFileName] = useState('CustomerInfoCard.tsx');
    const [preview, setPreview] = useState(false);
    const validation = useMemo(() => {
        if (!/export\s+default/.test(source)) return '组件必须包含默认导出 export default。';
        if (!/(=>|function\s+\w+|forwardRef)/.test(source)) return '未识别到 React 函数组件。';
        if (/^\s*import\s/m.test(source)) return '本地模拟暂不解析 import；请直接使用全局 React、antd 和 antdIcons。';
        return '';
    }, [source]);

    const readFile = async (file: File) => {
        if (!/\.(tsx|jsx|ts|js)$/i.test(file.name)) {
            message.error('请选择 TSX、JSX、TS 或 JS 文件');
            return Upload.LIST_IGNORE;
        }
        setFileName(file.name);
        setSource(await file.text());
        return false;
    };

    return <>
        <Modal
            title="上传 React 函数组件"
            open={open}
            onCancel={onCancel}
            width="72%"
            footer={[
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button key="preview" type="primary" disabled={Boolean(validation)} onClick={() => setPreview(true)}>编译并预览</Button>,
            ]}
            destroyOnClose={false}
        >
            <Alert
                type="info"
                showIcon
                message="保持原元素预览链路：单文件源码经 Babel 编译后，仍由现有画布和 NgapRender 注册、渲染。属性 Schema 先由平台生成默认值。"
                style={{ marginBottom: 12 }}
            />
            <Upload.Dragger accept=".tsx,.jsx,.ts,.js" maxCount={1} showUploadList={false} beforeUpload={readFile}>
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">点击或拖入一个 React 函数组件文件</p>
                <p className="ant-upload-hint">当前文件：{fileName}；本地模拟支持全局 React、antd、antdIcons。</p>
            </Upload.Dragger>
            <Input.TextArea value={source} onChange={(event) => setSource(event.target.value)} rows={18} spellCheck={false} style={{ marginTop: 12, fontFamily: 'Consolas, monospace' }} />
            {validation && <Alert type="warning" showIcon message={validation} style={{ marginTop: 10 }} />}
        </Modal>
        <PreviewElementModal
            visible={preview}
            codeData={{ tsxCode: source, jsCode: DEFAULT_SCHEMA, lessCode: '' }}
            onCancel1={() => setPreview(false)}
        />
    </>;
};

export default SingleFunctionUploadModal;

