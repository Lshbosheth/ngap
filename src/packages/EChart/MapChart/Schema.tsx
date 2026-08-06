/**
 * 组件配置和属性值
 */
import ColorSet from '../components/ColorSet';
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础属性',
        },
        {
            type: 'Select',
            label: '鼠标操作',
            name: ['geo', 'roam'],
            props: {
                options: [
                    { label: '缩放', value: 'scale' },
                    { label: '移动', value: 'move' },
                    { label: '缩放/移动', value: true },
                    { label: '关闭', value: false },
                ],
            },
        },
        {
            type: 'Select',
            label: '选中模式',
            name: ['geo', 'selectedMode'],
            props: {
                options: [
                    { label: '关闭', value: false },
                    { label: '单选', value: 'single' },
                    { label: '多选', value: 'multiple' },
                ],
            },
        },
        {
            type: 'ColorPicker',
            label: '选中颜色',
            name: ['geo', 'select', 'itemStyle', 'areaColor'],
        },
        {
            type: 'ColorPicker',
            label: '线颜色',
            name: ['geo', 'itemStyle', 'borderColor'],
        },
        // {
        //     type: 'InputNumber',
        //     label: '线宽度',
        //     name: ['geo', 'itemStyle','borderWidth'],
        // },{
        //     type: 'ColorPicker',
        //     label: '区域颜色',
        //     name: ['geo', 'itemStyle','areaColor'],
        // },
        {
            type: 'Title',
            label: '标题设置',
        },
        {
            type: 'Switch',
            label: '是否展示',
            name: ['title', 'show'],
        },
        {
            type: 'Input',
            label: '标题名称',
            name: ['title', 'text'],
        },
        //  {
        //     type: 'Input',
        //     label: '标题链接',
        //     name: ['title', 'link'],
        // },
        // {
        //     type: 'Input',
        //     label: '子标题',
        //     name: ['title', 'subtext'],
        // },{
        //     type: 'Input',
        //     label: '子标题链接',
        //     name: ['title', 'sublink'],
        // },
        // {
        //     type: 'Select',
        //     label: '水平对齐',
        //     name: ['title', 'textAlign'],
        //     props: {
        //         options: [
        //             { label: '自动', value: 'auto' },
        //             { label: '左侧', value: 'left' },
        //             { label: '右侧', value: 'right' },
        //             { label: '居中', value: 'center' },
        //         ],
        //     },
        // },
        // {
        //     type: 'Select',
        //     label: '垂直对齐',
        //     name: ['title', 'textVerticalAlign'],
        //     props: {
        //         options: [
        //             { label: '自动', value: 'auto' },
        //             { label: '顶部', value: 'top' },
        //             { label: '底部', value: 'bottom' },
        //             { label: '居中', value: 'middle' },
        //         ],
        //     },
        // },
        {
            type: 'Title',
            label: '提示框配置',
        },
        ,
        {
            type: 'Switch',
            label: '是否展示',
            name: ['tooltip', 'show'],
        },
        {
            type: 'Input',
            label: '格式化',
            name: ['tooltip', 'formatter'],
        },
        {
            type: 'Title',
            label: '标签配置',
        },
        {
            type: 'Switch',
            label: '是否展示',
            name: ['geo', 'label', 'show'],
        },
        {
            type: 'InputNumber',
            label: '字体大小',
            name: ['geo', 'label', 'fontSize'],
            props: {
                placeholder: '数字类型',
            },
        },
        //  {
        //      type: 'Select',
        //      label: '字重',
        //      name: ['geo','label', 'fontWeight'],
        //      props: {
        //          options: [
        //              {
        //                  value: 'normal',
        //                  label: 'normal',
        //              },
        //              {
        //                  value: 'bold',
        //                  label: 'bold',
        //              },
        //              {
        //                  value: 'lighter',
        //                  label: 'lighter',
        //              },
        //              {
        //                  value: 'bolder',
        //                  label: 'bolder',
        //              },
        //          ],
        //      },
        //  },
        {
            type: 'ColorPicker',
            label: '字体颜色',
            name: ['geo', 'label', 'color'],
        },
        //  {
        //      type: 'Title',
        //      label: '主题配置',
        //  },
        {
            type: 'Select',
            label: '主题',
            name: 'theme',
            props: {
                options: [
                    { label: '默认', value: 'default' },
                    { label: '暗黑', value: 'dark' },
                ],
            },
        },
        //  {
        //      type: 'function',
        //      label: '图形颜色',
        //      name: 'color',
        //      render() {
        //          return <ColorSet key="ColorSet" />;
        //      },
        //  },
    ],
    config: {
        // 组件默认属性值
        props: {
            title: {
                show: true,
                text: '中国',
                link: 'http://artfront.cs.cmos:8080/art/api/index.html#/develop/frame',
                // subtext:'子标题',
                // sublink:"http://nguc.cs.cmos:8080/nguc/ngucportal/login.html",
                textAlign: 'auto',
                textVerticalAlign: 'auto',
            },
            geo: {
                roam: true,
                selectedMode: false,
                select: {
                    disabled: false,
                    itemStyle: {
                        areaColor: '#f5dea4',
                    },
                },
                itemStyle: {
                    areaColor: '#eee',
                    borderColor: '#999',
                    borderWidth: '1',
                },
                label: {
                    show: false,
                    fontSize: 12,
                    fontWeight: 'normal',
                    align: 'right',
                    color: '#666666',
                },
            },
            tooltip: {
                show: true,
                formatter: '{a}<br /><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#389fff;vertical-align:middle;margin-right:6px;"></span>进行中{b} <b>{c}</b>万',
            },
            theme: 'default',
            color: ['#9d5cff', '#FFAB3E', '#FADB1E', '#9ADB19', '#28C084', '#3CA2FF', '#1861EB', '#A24CF5', '#F32AA3', '#F11818'],
        },
        // 组件样式
        style: {
            height: 500,
        },
        api: {
            sourceType: 'json',
            source: [
                { name: '北京市', value: '2184' },
                { name: '天津市', value: '1387' },
                { name: '河北省', value: '7420' },
                { name: '山西省', value: '3481' },
                { name: '内蒙古自治区', value: '2405' },
                { name: '辽宁省', value: '4197' },
                { name: '吉林省', value: '2375' },
                { name: '黑龙江省', value: '3099' },
                { name: '上海市', value: '2487' },
                { name: '江苏省', value: '8515' },
                { name: '浙江省', value: '6577' },
                { name: '安徽省', value: '6113' },
                { name: '福建省', value: '4188' },
                { name: '江西省', value: '4517' },
                { name: '山东省', value: '10163' },
                { name: '河南省', value: '9872' },
                { name: '湖北省', value: '5844' },
                { name: '湖南省', value: '6604' },
                { name: '广东省', value: '12684' },
                { name: '广西壮族自治区', value: '5013' },
                { name: '海南省', value: '1020' },
                { name: '重庆市', value: '3212' },
                { name: '四川省', value: '8368' },
                { name: '贵州省', value: '3856' },
                { name: '云南省', value: '4693' },
                { name: '西藏自治区', value: '364' },
                { name: '陕西省', value: '3953' },
                { name: '甘肃省', value: '2492' },
                { name: '青海省', value: '594' },
                { name: '宁夏回族自治区', value: '725' },
                { name: '新疆维吾尔自治区', value: '2587' },
                { name: '台湾省', value: '2330' },
                { name: '香港特别行政区', value: '741' },
                { name: '澳门特别行政区', value: '68' },
            ],
        },
    },
    // 组件事件
    events: [],
    methods: [
        {
            name: 'update',
            title: '更新数据',
        },
    ],
};
