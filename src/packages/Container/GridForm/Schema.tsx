import { FormInstance } from "antd";
import ActionSetting from "@/components/BulkAction/ActionSetting";
import MColorPicker from "@/components/ColorPicker";

/**
 * 组件配置和属性值
 */

export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: "Title",
            label: "操作栏"
        },
        {
            type: "function",
            render(form: FormInstance) {
                return <ActionSetting key="ActionSetting" form={form} />;
            }
        },
        {
            type: "Title",
            label: "按钮配置"
        },
        {
            type: "Input",
            label: "查询文本",
            name: ["extraConfig", "submitText"]
        },
        {
            type: "Input",
            label: "重置文本",
            name: ["extraConfig", "resetText"]
        },
        {
            type: "Title",
            label: "基础配置",
            key: "basic"
        },
        {
            type: "Input",
            label: "字段",
            name: "name",
            props: {
                placeholder: "表单字段（默认可空）"
            }
        },
        {
            type: "Switch",
            label: "显示冒号",
            name: "colon"
        },
        {
            type: "Select",
            label: "标签对齐",
            name: "labelAlign",
            props: {
                options: [
                    { label: "左对齐", value: "left" },
                    { label: "右对齐", value: "right" }
                ]
            }
        },
        // {
        //     type: "Switch",
        //     label: "禁用",
        //     name: ["disabled"]
        // },
        {
            type: "Select",
            label: "表单尺寸",
            name: "size",
            props: {
                options: [
                    { label: "小号", value: "small" },
                    { label: "中号", value: "middle" },
                    { label: "大号", value: "large" }
                ]
            }
        },
        {
            type: "InputNumber",
            label: "每行几列",
            name: ["extraConfig", "lineCount"],
            tooltip:'网络表单每行显示的表单个数。',
            props: {
                placeholder: "请输入每行几列"
            }
        },
        {
            type: "InputNumber",
            label: "保留行数",
            name: ["extraConfig", "leftLine"],
            tooltip:'网络表单收起后，默认显示的行数。',
            props: {
                placeholder: "请输入保留行数"
            }
        },
        {
            type: "Switch",
            label: "默认收起",
            name: ["extraConfig", "initFold"]
        },
        {
            type: "Title",
            label: "主题配置",
            key: "theme"
        },
        {
            type: "ColorPicker",
            label: "标签颜色",
            name: ["extraConfig", "labelStyle", "color"],
        },
        {
            type: "InputNumber",
            label: "标签字体",
            name: ["extraConfig", "labelStyle", "labelFontSize"],
            props: {
                placeholder: "请输入标签字体大小",
                suffix:'px'
            }
        },
        {
            type: "InputNumber",
            label: "表单项垂直间距",
            name: ["extraConfig", "verGap"],
            props: {
                placeholder: "请输入表单项垂直间距",
                suffix:'px'
            }
        },
        {
            type: "InputNumber",
            label: "表单项行内间距",
            name: ["extraConfig", "hozGap"],
            props: {
                placeholder: "请输入表单项行内间距",
                suffix:'px'
            }
        }
    ],
    config: {
        props: {
            colon: true,
            labelAlign: "right",
            labelCol: { span: 6 },
            wrapperCol: { span: 18 },
            size:'middle',
            gridLayout: { w: 16, h: 2, isDraggable: true, isResizable: true },
            extraConfig: {
                lineCount: 4,
                leftLine: 1,
                initFold: false,
                verGap: 0,
                hozGap: 0,
                submitText: "查询",
                resetText: "重置",
                labelStyle: {labelFontSize:13}
            }
        },
        // 组件样式
        style: {
            padding: "20px 10px",
            backgroundColor: "#fff"
        },
        events: [],
        api: {}
    },
    // 组件事件
    events: [
        {
            value: "onSearch",
            name: "查询事件"
        },
        {
            value: "onReset",
            name: "重置事件"
        },
        {
            value: "onChange",
            name: "表单变化事件"
        }
    ],
    methods: [
        {
            name: "reset",
            title: "表单重置"
        },
        {
            name: "init",
            title: "表单赋值"
        },
        {
            name: "getFormData",
            title: "获取表单数据"
        }
    ]
};
