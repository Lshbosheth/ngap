/**
 * 远程组件规范要求：
 *
 * 1. 使用 ES Module 导出
 * 2. 默认导出组件函数
 * 3. 可以使用 window.React、window.antd 等全局变量
 * 4. 支持 forwardRef 暴露方法
 *
 */

const MyComponent = ({ id, type, config, onClick }: any, ref: any) => {
    const { useState, useImperativeHandle } = React; // 从全局 React 获取组件
    const { Image } = antd; // 从全局 antd 获取组件
    const [visible, setVisible] = useState(true);
    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
        };
    });
    const handleClick = () => {
        onClick?.();
    };
    return visible && <Image style={config.style} {...config.props} data-id={id} data-type={type} className="customize_image" onClick={handleClick} />;
};
export default React.forwardRef(MyComponent);
