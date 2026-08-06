import React, { useState, useEffect, useRef } from 'react';
import * as antd from 'antd';
import ReactDOM from 'react-dom/client';
import { Modal } from 'antd';
import * as Babel from '@babel/standalone';
import less from 'less';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import CanvasEditingComponent from '@/pages/canvasEditingComponent/index';

interface AddElementModalProps {
    visible: boolean; // 弹窗是否展示
    codeData: any; // 源文件源码
    onCancel1: () => void; // 取消
}

const AddElementModal: React.FC<AddElementModalProps> = ({ visible, codeData, onCancel1 }) => {
    const userInfo: any = crossApiUserInfo((state: any) => state.userInfo);
    const containerRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<ReactDOM.Root | null>(null);
    const [typeZDY, setTypeZDY] = useState('');
    const [css, setCss] = useState(''); // 编译后的css
    const [jsData, setJsData] = useState({
        attrs: [],
        config: {
            // 组件默认属性值
            props: {},
            // 组件样式
            style: {},
            api: {},
        },
        // 组件事件
        events: [],
        methods: [],
    }); // 编译后的js

    useEffect(() => {
        if (visible) {
            if (codeData.jsCode) {
                onPreviewJs(codeData.jsCode);
            }
            // setTimeout(() => {
            if (codeData.lessCode) {
                onPreviewLess(codeData.lessCode);
            }
            // }, 200)
        }
    }, [visible, codeData]);

    // 编译挂载js代码
    const onPreviewJs = async (code: string) => {
        // 待编译的 Js 代码
        let jsCode = `
            export default {
                // 组件属性配置JSON
                attrs: [],
                config: {
                    // 组件默认属性值
                    props: {
                        content: 'hello',
                    },
                    // 组件样式
                    style: {},
                    api: {},
                },
                // 组件事件
                events: [],
                methods: [],
            };
        `;
        jsCode = code;
        try {
            // 1. 编译 TS -> JS
            const result = Babel.transform(jsCode, {
                presets: [
                    ['typescript', { isTSX: true, allExtensions: true }], // 支持 TSX
                    'react', // 转换 JSX
                    ['env', { modules: false }], // 不转换模块，保留 export
                ],
                filename: 'dynamic.tsx',
            });

            const compiledCode: any = result.code;

            // 2. 创建 Blob URL 并作为 ES 模块动态导入
            const blob = new Blob([compiledCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);

            // 3. 导入模块，获取默认导出的组件
            const module = await import(url);
            const jsData = module.default;

            window.MyComponentJsData = jsData; // 预览自定义元素配置

            setJsData(jsData);
            // 加载组件
            if (codeData.tsxCode) {
                onPreviewTsx(codeData.tsxCode, jsData);
            }
            // 清理 Blob URL
            URL.revokeObjectURL(url);
        } catch (error: any) {
            if (codeData.tsxCode) {
                onPreviewTsx(codeData.tsxCode, jsData);
            }
            console.error('js文件编译失败,请按照远程组件规范要求开发！', error);
        }
    };

    // 编译挂载tsx代码
    const onPreviewTsx = async (code: string, jsData: any) => {
        // 待编译的 TSX 代码（无 import，使用全局 React）
        let tsxCode = `
            const MyComponent = ({ config, onChange }, ref) => {
                const { Button } = antd; // 从全局 antd 获取 Button 组件
                const [count, setCount] = React.useState(0);
                // 暴露给父组件的 ref 方法
                React.useImperativeHandle(ref, () => ({
                    show: () => console.log('show', config.props.content),
                    hide: () => console.log('hide')
                }));
                const handleClick = () => {
                    setCount(prevCount => prevCount + 1);
                };
                return (
                    <div>
                        <div className="textColor">
                            {config?.props?.content}
                        </div>
                        <p>计数：{count}</p>
                        <Button type="primary" onClick={handleClick}>
                            点击我+1
                        </Button>
                    </div>
                );
            };
            export default React.forwardRef(MyComponent);
        `;
        tsxCode = code;
        try {
            // 1. 编译 TSX -> JS（保留 ES 模块语法 modules: false）
            const result = Babel.transform(tsxCode, {
                presets: [
                    ['typescript', { isTSX: true, allExtensions: true }], // 支持 TSX
                    'react', // 转换 JSX
                    ['env', { modules: false }], // 不转换模块，保留 export
                ],
                filename: 'dynamic.tsx',
            });

            const compiledCode: any = result.code;

            // 2. 创建 Blob URL 并作为 ES 模块动态导入
            const blob = new Blob([compiledCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);

            // 3. 导入模块，获取默认导出的组件
            const module = await import(url);
            const Component = module.default;

            window.MyComponent = Component; // 预览自定义元素
            // setTimeout(() => {
            setTypeZDY('ZDY');
            // }, 200)

            // 4. 创建 ref 以便调用组件暴露的方法
            const componentRef = React.createRef();

            // 5. 准备 props
            const props = {
                config: jsData.config,
                onChange: (value: any) => console.log('onChange', value),
            };

            // 6. 渲染组件,传递 ref（复用 root）
            const containerRefContent: any = containerRef.current;
            if (!rootRef.current) {
                rootRef.current = ReactDOM.createRoot(containerRefContent);
            }
            rootRef.current.render(React.createElement(Component, { ...props, ref: componentRef }));

            // 7. 测试 ref 方法（延迟执行以等待渲染完成）
            // setTimeout(() => {
            //     if (componentRef.current) {
            //         componentRef.current.show(); // 应打印 "show Hello from dynamic component!"
            //         componentRef.current.hide(); // 应打印 "hide"
            //     }
            // }, 1000);

            // 清理 Blob URL
            URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('tsx文件编译失败,请按照远程组件规范要求开发！', error);
            const containerRefContent: any = containerRef.current;
            if (!rootRef.current) {
                rootRef.current = ReactDOM.createRoot(containerRefContent);
            }
            rootRef.current.render(<div>加载失败: {error}</div>);
        }
    };

    // 编译挂载Less代码
    const onPreviewLess = async (code: string) => {
        let lessCode = `
            .textColor {
                color: red;
            }
        `;
        lessCode = code;
        try {
            // 编译 Less
            less.render(lessCode, { compress: true })
                .then((output) => {
                    setCss(output.css);
                })
                .catch((error) => {
                    console.error('less文件编译失败,请按照远程组件规范要求开发！', error);
                });
        } catch (error) {
            console.error('less文件编译失败,请按照远程组件规范要求开发！', error);
        }
    };

    // 将编译后的 CSS 插入到 <style> 标签
    useEffect(() => {
        if (!css) return;
        const style = document.createElement('style');
        style.id = 'dynamic-less-style'; // 便于后续清理
        style.innerHTML = css;
        document.head.appendChild(style);
    }, [css]);

    const closeSecond = () => {
        onCancel1();
        // 清除配置
        setJsData({
            attrs: [],
            config: {
                // 组件默认属性值
                props: {},
                // 组件样式
                style: {},
                api: {},
            },
            // 组件事件
            events: [],
            methods: [],
        });

        // 清理 root（组件卸载时）
        if (rootRef.current) {
            rootRef.current.unmount();
            rootRef.current = null;
        }

        // 组件卸载时移除样式
        setCss('');
        const existingStyle = document.getElementById('dynamic-less-style');
        if (existingStyle) existingStyle.remove();
    };

    return (
        <Modal
            title="元素预览"
            open={visible}
            footer={null}
            onCancel={closeSecond}
            mask={true} // 显示遮罩
            maskClosable={false} // 禁止点击遮罩关闭
            destroyOnClose
            width="70%"
            style={{
                minWidth: '500px',
            }}
            styles={{
                body: {
                    height: 500,
                    overflow: 'hidden',
                },
            }}
        >
            <div style={{ height: '100%', position: 'relative', border: '1px solid #EAEAEC' }}>
                <div ref={containerRef} />
                <CanvasEditingComponent
                    config={{
                        provId: userInfo.provinceId,
                        serviceTypeId: userInfo.serviceTypeId,
                        staffId: userInfo.staffId,
                        componentName: '', // 模板名称
                        componentDesc: '', // 业务组件描述
                        belongModule: '', //归属模块
                        businessId: '', // 业务分类
                        serviceLink: '', // 服务环节
                        componentCategory: '', //模板类别
                        componentLevel: '', //适用范围
                        dataType: '1',
                        id: '',
                        componentPicture: '', //组件缩略图
                        typeZDY: typeZDY,
                    }}
                    id={''}
                    backComponentPage={() => { }}
                    confiEventbusTem={() => { }}
                />
            </div>
        </Modal>
    );
};
export default AddElementModal;
