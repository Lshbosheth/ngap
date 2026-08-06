import { FormInstance } from "antd";
import TimelineSetting from "@/packages/components/timeline-node-config/TimelineSetting";

/**
 * 组件配置和属性值
 */
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: "Title",
            label: "基础配置",
            key: "basic"
        },
        {
            type: "Select",
            label: "位置",
            name: "mode",
            props: {
                options: [
                    { value: "left", label: "左" },
                    { value: "right", label: "右" },
                    { value: "alternate", label: "交替" }
                ]
            }
        },
        {
            type: "Select",
            label: "节点排序",
            name: "reverse",
            props: {
                options: [
                    { value: true, label: "倒序" },
                    { value: false, label: "正序" }
                ]
            }
        },
        {
            type: "Title",
            label: "节点配置",
            key: "nodeSet"
        },
        {
            type: "function",
            name: "dataSource",
            render: (form: FormInstance) => {
                return <TimelineSetting key={'dataSourceF'} name={'dataSource'} form={form} />;
            }
        }
    ],
    config: {
        // 组件默认属性值
        props: {
            mode: "left",
            reverse: false,
            dataSource: [
                {
                    color: "#0B91DC",
                    label: "2015-09-01 09:12:10",
                    children: "创建服务"
                },
                {
                    color: "#F65A56",
                    label: "2025-09-01 09:12:11",
                    children: "处理问题"
                },
                {
                    color: "#BBBBBB",
                    label: "2015-09-02 00:00:00",
                    children: "问题已解决"
                }
            ]
        },
        style: {},
        events: [
            // {
            //     value: 'onChange',
            //     name: '事件改变',
            // },
        ],
        source: ""
    },
    // 组件事件
    events: [
        // {
        //     value: 'onClick',
        //     name: '点击事件',
        // },
    ],
};
