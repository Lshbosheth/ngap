import TextSetting from './../../components/TextSetting';
import ShowNumberSetting from './ShowNumberSetting';

/**
 * 组件配置和属性值
 */
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'basic',
        },
        {
            type: 'Select',
            label: '对齐方式',
            name: 'align',
            props: {
                options: [
                    { value: 'start', label: 'start' },
                    { value: 'center', label: 'center' },
                    { value: 'end', label: 'end' },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '当前页数',
            name: 'current',
        },
        {
            type: 'InputNumber',
            label: '默认当前页数',
            name: 'defaultCurrent',
        },
        {
            type: 'InputNumber',
            label: '默认每页条数',
            name: 'defaultPageSize',
        },
        {
            type: 'Switch', // boolean
            label: '禁用',
            name: 'disabled',
        },
        {
            type: 'Switch', // boolean
            label: '单页隐藏',
            name: 'hideOnSinglePage',
        },
        {
            type: 'InputNumber',
            label: '每页条数',
            name: 'pageSize',
        },
        {
            type: 'Switch', // boolean
            label: '显示较少页面',
            name: 'showLessItems',
        },
        {
            type: 'Switch', // boolean
            label: '跳转至某页',
            name: 'showQuickJumper',
        },
        {
            type: 'Switch',
            label: '页数切换器',
            name: 'showSizeChanger',
        },
        {
            type: 'function', // number[]
            label: '切换器数据源',
            name: 'pageSizeOptions',
            render() {
                return <ShowNumberSetting label="切换器数据" name="pageSizeOptions" key="pageSizeOptions" />;
            },
        },
        {
            type: 'Switch', // boolean
            label: '页码提示',
            name: 'showTitle',
        },
        {
            type: 'Switch',
            label: '简单分页',
            name: 'simple',
        },
        {
            type: 'Select',
            label: '组件尺寸',
            name: 'size',
            props: {
                options: [
                    { value: 'default', label: '默认' },
                    { value: 'small', label: '小' },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '数据总数',
            name: 'total',
        },
        {
            type: 'function',
            label: '用于显示数据总量和当前数据顺序',
            key: 'render',
            render: () => {
                return <TextSetting key="render" label="自定义" name="showTotal" />;
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            defaultCurrent: 1,
            defaultPageSize: 10,
            hideOnSinglePage: false,
            pageSizeOptions: [{ label: 10 }, { label: 20 }, { label: 50 }, { label: 100 }],
            showLessItems: false,
            showQuickJumper: false,
            showTitle: true,
            showSizeChanger: true,
            size: 'small',
            total: 118,
            showTotal: `function showTotal(total){
                return '共' + total + '条数据';
            }`,
        },
        style: {},
        events: [],
        api: {},
        source: '',
    },
    // 组件事件
    events: [
        {
            name: 'onChange事件',
            value: 'onChange',
        },
        {
            name: 'onShowSizeChange事件',
            value: 'onShowSizeChange',
        },
    ],
};
