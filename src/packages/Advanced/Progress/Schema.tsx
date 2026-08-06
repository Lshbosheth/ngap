import TextSetting from './../../components/TextSetting';
import StrokeColorSetting from './StrokeColorSetting';
/**
 * 组件配置和属性值
 */
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础设置',
            key: 'basic',
        },
        {
            type: 'Select',
            label: '类型',
            name: ['type'],
            props: {
                options: [
                    { value: 'line', label: 'line' },
                    { value: 'circle', label: 'circle' },
                    { value: 'dashboard', label: 'dashboard' },
                ],
            },
        },
        {
            type: 'Variable',
            label: '百分比',
            name: 'percent',
        },
        {
            type: 'Switch',
            label: '显示进度',
            name: 'showInfo',
            tooltip: '是否显示进度数值或状态图标',
        },
        {
            type: 'InputNumber',
            label: '总步数',
            name: 'steps',
            props: {
                min: 0,
            },
        },
        {
            type: 'Select',
            label: '状态',
            name: 'status',
            tooltip: '配置状态时，【自定义模板内容】需清空',
            props: {
                options: [
                    { value: 'success', label: '成功' },
                    { value: 'exception', label: '异常' },
                    { value: 'normal', label: '普通' },
                    { value: 'active', label: '进行' },
                ],
            },
        },
        {
            type: 'function',
            label: '内容的模板函数',
            key: 'render',
            tooltip: '配置后，【状态】不生效',
            render: () => {
                return <TextSetting key="render" label="内容的模板函数" name="format" />;
            },
        },
        {
            type: 'Title',
            label: '布局',
            key: 'progress-layout',
        },
        {
            type: 'ColorPicker',
            label: '颜色',
            name: 'strokeColor',
            tooltip: '颜色优先级高于渐变色',
        },
        // {
        //     type: 'function',
        //     label: '渐变色',
        //     name: 'color',
        //     tooltip: '设置渐变色时不能设置步数',
        //     render() {
        //         return <StrokeColorSetting label="渐变色" name="gradientColor" key="gradientColor" />;
        //     },
        // },
        // {
        //     type: 'Select',
        //     label: '边缘形状',
        //     name: ['strokeLinecap'],
        //     props: {
        //         options: [
        //             { value: 'round', label: 'round' },
        //             { value: 'butt', label: 'butt' },
        //             { value: 'square', label: 'square' },
        //         ],
        //     },
        // },
        // {
        //     type: 'RadioGroup',
        //     label: '尺寸',
        //     name: ['size'],
        //     props: {
        //         options: [
        //             { value: 'default', label: 'default' },
        //             { value: 'small', label: 'small' },
        //         ],
        //     },
        // },
        {
            type: 'ColorPicker',
            label: '未完成颜色',
            name: 'trailColor',
        },
        {
            type: 'InputNumber',
            label: '线条宽度',
            name: 'strokeWidth',
        },
        {
            type: 'Title',
            label: '成功配置',
            key: 'success-basic',
        },
        {
            type: 'InputNumber',
            label: '百分比',
            name: ['success', 'percent'],
        },
        {
            type: 'ColorPicker',
            label: '颜色',
            name: ['success', 'strokeColor'],
        },
        {
            type: 'Title',
            label: '进度条配置',
            key: 'line',
        },
        {
            type: 'Select',
            label: '数值水平位置',
            name: ['percentPosition', 'align'],
            props: {
                options: [
                    { value: 'start', label: '左侧' },
                    { value: 'center', label: '中间' },
                    { value: 'end', label: '右侧' },
                ],
            },
        },
        {
            type: 'Select',
            label: '数值布局位置',
            name: ['percentPosition', 'type'],
            props: {
                options: [
                    { value: '', label: '默认' },
                    { value: 'outer', label: '外部' },
                    { value: 'inner', label: '内部' },
                ],
            },
        },
        {
            type: 'Title',
            label: '仪表盘配置',
            key: 'dashboard',
        },
        {
            type: 'InputNumber',
            label: '缺口',
            name: 'gapDegree',
        },
        {
            type: 'Select',
            label: '缺口位置',
            name: 'gapPosition',
            props: {
                options: [
                    { value: 'top', label: '顶部' },
                    { value: 'bottom', label: '底部' },
                    { value: 'left', label: '左侧' },
                    { value: 'right', label: '右侧' },
                ],
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            type: 'line',
            showInfo: true,
            strokeLinecap: 'round',
            trailColor: 'rgba(0, 0, 0, 0.06)',
            size: 'default',
            format: `function format(percent){
    return percent + '%';
}`,
            gradientColor: [{}],
            // gapDegree: 75,
            gapPosition: 'bottom',
        },
        // 组件样式
        style: {},
        // 事件
        events: [],
    },
    // 组件事件
    events: [],
    methods: [],
};
