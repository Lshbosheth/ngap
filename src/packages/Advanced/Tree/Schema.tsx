import FunctionSetting from './FunctionSetting';
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
            type: 'Switch',
            label: '复选框',
            name: 'checkable',
        },
        {
            type: 'Switch',
            label: '受控',
            name: 'checkStrictly',
            tooltip: 'checkable 状态下节点选择完全受控（父子节点选中状态不再关联）',
        },
        {
            type: 'Variable',
            label: '复选框默认值',
            name: ['defaultCheckedKeys'],
            tooltip: '默认选中复选框的树节点,示例：["parent"]',
        },
        {
            type: 'Switch',
            label: '默认展开全部',
            name: 'defaultExpandAll',
            tooltip: '默认展开所有树节点',
        },
        {
            type: 'Variable',
            label: '默认展开节点',
            name: ['defaultExpandedKeys'],
            tooltip: '默认展开指定的树节点,示例：["parent"]',
        },
        // {
        //     type: 'Switch',
        //     label: '默认展开父节点',
        //     name: 'defaultExpandParent',
        // },
        {
            type: 'Switch',
            label: '禁用',
            name: 'disabled',
        },
        {
            type: 'Variable',
            label: '默认选中',
            name: ['defaultSelectedKeys'],
            tooltip: '默认选中的树节点,示例：["parent"]',
        },
        // {
        //     type: 'InputNumber',
        //     label: '虚拟滚动高度',
        //     name: 'height',
        // },
        // {
        //     type: 'Switch',
        //     label: '点选多个',
        //     name: 'multiple',
        // },
        {
            type: 'Switch',
            label: '是否可选中',
            name: 'selectable',
        },
        {
            type: 'Switch',
            label: '显示图标',
            name: 'showIcon',
        },
        {
            type: 'Switch',
            label: '显示连线',
            name: 'showLine',
        },
        {
            type: 'Switch',
            label: '节点末尾图片',
            name: 'showEndIcon',
        },
        {
            type: 'Switch',
            label: '异步加载',
            name: 'async',
        },
        {
            type: 'Input',
            label: '异步加载参数',
            name: 'asyncKey',
            tooltip: '请求子节点数据时，自动提交父节点值的key，默认为数据映射中的节点值',
        },
        {
            type: 'Input',
            label: '叶子节点字段',
            name: 'leafKey',
            tooltip: '是否是子节点标识，只有异步加载选中时有效',
        },
        // {
        //     type: 'Variable',
        //     label: '自动展开父节点',
        //     name: ['autoExpandParent'],
        // },
        // {
        //     type: 'Switch',
        //     label: '节点占据一行',
        //     name: 'blockNode',
        // },
        // {
        //     type: 'Switch',
        //     label: '拖拽',
        //     name: 'draggable',
        // },
        // {
        //     type: 'Icons',
        //     label: '加载图标',
        //     name: 'switcherLoadingIcon',
        //     tooltip: '自定义树节点的加载图标',
        // },
        // {
        //     type: 'Switch',
        //     label: '虚拟滚动',
        //     name: 'virtual',
        //     tooltip: '设置 false 时关闭虚拟滚动',
        // },
        {
            type: 'Title',
            label: '数据映射',
            key: 'fieldNamesTitle',
        },
        {
            type: 'Select',
            label: '节点名称',
            name: ['fieldNames', 'title'],
            apiOpt: true,
        },
        {
            type: 'Select',
            label: '节点值',
            name: ['fieldNames', 'key'],
            apiOpt: true,
        },
        {
            type: 'Input',
            label: '子节点标识',
            name: ['fieldNames', 'children'],
        },
        {
            type: 'Select',
            label: '节点末尾图片',
            name: ['fieldNames', 'imgUrl'],
            apiOpt: true,
        },
        {
            type: 'function',
            label: '方法',
            render: () => {
                return <FunctionSetting key="filterTreeNode" />;
            },
        },
        // {
        //     type: 'function',
        //     label: '筛选',
        //     key: 'filterTreeNode',
        //     tooltip: "按需筛选树节点（高亮），返回 true",
        //     render: () => {
        //         return <TextSetting key="filterTreeNode" label="筛选" name="filterTreeNode" />;
        //     }
        // },
        // {
        //     type: 'function',
        //     label: '拖拽放置',
        //     key: 'allowDrop',
        //     tooltip: "是否允许拖拽时放置在该节点",
        //     render: () => {
        //         return <TextSetting key="allowDrop" label="拖拽放置" name="allowDrop" />;
        //     }
        // },
        // {
        //     type: 'function',
        //     label: '异步加载数据',
        //     key: 'loadData',
        //     render: () => {
        //         return <TextSetting key="loadData" label="异步加载数据" name="loadData" />;
        //     }
        // }
    ],
    config: {
        // 组件默认属性值
        props: {
            // autoExpandParent: false,
            blockNode: false,
            checkable: false,
            checkStrictly: false,
            defaultExpandAll: false,
            // defaultExpandParent: true,
            disabled: false,
            draggable: false,
            fieldNames: {
                title: 'title',
                key: 'key1',
                children: 'children',
                imgUrl: "imgUrl"
            },
            multiple: false,
            selectable: true,
            showIcon: true,
            showLine: false,
            virtual: true,
            async: false,
            leafKey: ""
        },
        // 组件样式
        style: {},
        // 事件
        events: [],
        api: {
            sourceType: 'json',
            source: {
                title: ['parent', 'parent1'],
                key1: ['parent', 'parent1'],
                name: ['parent-name', 'parent1'],
                imgUrl: [
                    [
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAB+klEQVQ4T62TMWgTURzGv/97VyQotkqrg7oIdXFtQeig1cm51AoNos01IApeqG3SyevUO2vIOYiYu+hSRS3OblaHDlJXFwtOddAWTEVR6b37yyVcTZNLGkpvfe//u+//ve8j7NFH9RzTNLU/nSdGQDzKzP1E1MXMZSJaZvCzRPnLc9M0/fq5baDpfPFUIMULAN9BKErmxZWlzvXegY1uRTQIRhrAIaGCkdmJ9Kda2BZo8v6TXsn+O4a4Yxspt9nGWac0TghmFGln525dW4nuVUDhOr+7ji8T44GV0b2dbMsVPJ0JNxLl1f5ozQoom3eTkDRmG/r5ekjO8dgy9AYvs473Boof2xPj8+FM5ULOcV8DwrOM1Kt2QTmnNASwbhn6xS1QtuCuKd8/fW/y+rd2QbfnHh6RWsdHO6P3/Ac5nv956eC+hYVLKg4UMK7czaTmAeLofHj4pTw58OOvbehajSJvTfmbsYqm8u4ZIanAYAhIY9YYex8Oxipq5VFVAdNUoZQUwAUro1+t+locAkSdR46bBOJfrXmeYl5tVzkCbiY2Vvu25Sj8azXZ6i0jMG0j3TTZYRhBmFEkzzUkO5Jf2zUCP/I3/cUDv76u/9x/tFvr0AYBkWbw4ZZdi2DVNY9dJmAUoL6wpJUSgz8w8LSt9u/UsVbnDR3aLewf1HXyE+2sFIYAAAAASUVORK5CYII=',
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBGMjIwNTgwQUY1MTExRTdCQkFDOTMyMTZGQjRFQzc0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjBGMjIwNTgxQUY1MTExRTdCQkFDOTMyMTZGQjRFQzc0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MEYyMjA1N0VBRjUxMTFFN0JCQUM5MzIxNkZCNEVDNzQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MEYyMjA1N0ZBRjUxMTFFN0JCQUM5MzIxNkZCNEVDNzQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4fxdecAAAAa0lEQVR42mL8//8/AyWApXrCXIoMYMIh/p9IMbgBh6EK/mPRhEvsMNgLUEEbIGbEYgE+sf/4vECsYXAX4PQjwVggZAMegNcLFEUjcsjjYmP1AjavMBLy4uB0AVnReISMdHAU2QBbcl0AEGAAOcogUWhZ/DcAAAAASUVORK5CYII=",
                        ""
                    ],
                    ""
                ],
                children: [
                    [
                        {
                            title: '0-0',
                            key1: '0-0',
                            name: '0-0-name',
                            imgUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBGMjIwNTgwQUY1MTExRTdCQkFDOTMyMTZGQjRFQzc0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjBGMjIwNTgxQUY1MTExRTdCQkFDOTMyMTZGQjRFQzc0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MEYyMjA1N0VBRjUxMTFFN0JCQUM5MzIxNkZCNEVDNzQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MEYyMjA1N0ZBRjUxMTFFN0JCQUM5MzIxNkZCNEVDNzQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4fxdecAAAAa0lEQVR42mL8//8/AyWApXrCXIoMYMIh/p9IMbgBh6EK/mPRhEvsMNgLUEEbIGbEYgE+sf/4vECsYXAX4PQjwVggZAMegNcLFEUjcsjjYmP1AjavMBLy4uB0AVnReISMdHAU2QBbcl0AEGAAOcogUWhZ/DcAAAAASUVORK5CYII=",
                            children: [
                                {
                                    title: '0-0-0',
                                    key1: '0-0-0',
                                    children: [
                                        { title: '0-0-0-0', key1: '0-0-0-0' },
                                        { title: '0-0-0-1', key1: '0-0-0-1',
                                        imgUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAB+klEQVQ4T62TMWgTURzGv/97VyQotkqrg7oIdXFtQeig1cm51AoNos01IApeqG3SyevUO2vIOYiYu+hSRS3OblaHDlJXFwtOddAWTEVR6b37yyVcTZNLGkpvfe//u+//ve8j7NFH9RzTNLU/nSdGQDzKzP1E1MXMZSJaZvCzRPnLc9M0/fq5baDpfPFUIMULAN9BKErmxZWlzvXegY1uRTQIRhrAIaGCkdmJ9Kda2BZo8v6TXsn+O4a4Yxspt9nGWac0TghmFGln525dW4nuVUDhOr+7ji8T44GV0b2dbMsVPJ0JNxLl1f5ozQoom3eTkDRmG/r5ekjO8dgy9AYvs473Boof2xPj8+FM5ULOcV8DwrOM1Kt2QTmnNASwbhn6xS1QtuCuKd8/fW/y+rd2QbfnHh6RWsdHO6P3/Ac5nv956eC+hYVLKg4UMK7czaTmAeLofHj4pTw58OOvbehajSJvTfmbsYqm8u4ZIanAYAhIY9YYex8Oxipq5VFVAdNUoZQUwAUro1+t+locAkSdR46bBOJfrXmeYl5tVzkCbiY2Vvu25Sj8azXZ6i0jMG0j3TTZYRhBmFEkzzUkO5Jf2zUCP/I3/cUDv76u/9x/tFvr0AYBkWbw4ZZdi2DVNY9dJmAUoL6wpJUSgz8w8LSt9u/UsVbnDR3aLewf1HXyE+2sFIYAAAAASUVORK5CYII=' },
                                        { title: '0-0-0-2', key1: '0-0-0-2',
                                        imgUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBGMjIwNTgwQUY1MTExRTdCQkFDOTMyMTZGQjRFQzc0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjBGMjIwNTgxQUY1MTExRTdCQkFDOTMyMTZGQjRFQzc0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MEYyMjA1N0VBRjUxMTFFN0JCQUM5MzIxNkZCNEVDNzQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MEYyMjA1N0ZBRjUxMTFFN0JCQUM5MzIxNkZCNEVDNzQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4fxdecAAAAa0lEQVR42mL8//8/AyWApXrCXIoMYMIh/p9IMbgBh6EK/mPRhEvsMNgLUEEbIGbEYgE+sf/4vECsYXAX4PQjwVggZAMegNcLFEUjcsjjYmP1AjavMBLy4uB0AVnReISMdHAU2QBbcl0AEGAAOcogUWhZ/DcAAAAASUVORK5CYII=",
                                     },
                                    ],
                                },
                                {
                                    title: '0-0-1',
                                    key1: '0-0-1',
                                    children: [
                                        { title: '0-0-1-0', key1: '0-0-1-0' },
                                        { title: '0-0-1-1', key1: '0-0-1-1' },
                                        { title: '0-0-1-2', key1: '0-0-1-2' },
                                    ],
                                },
                                {
                                    title: '0-0-2',
                                    key1: '0-0-2',
                                },
                            ],
                        },
                        {
                            title: '0-1',
                            key1: '0-1',
                            children: [
                                { title: '0-1-0-0', key1: '0-1-0-0' },
                                { title: '0-1-0-1', key1: '0-1-0-1' },
                                { title: '0-1-0-2', key1: '0-1-0-2' },
                            ],
                        },
                        {
                            title: '0-2',
                            key1: '0-2',
                        },
                    ],
                ],
            },
        },
        source: '',
    },
    // 组件事件
    events: [
        {
            value: 'onCheck',
            name: 'onCheck事件',
        },
        {
            value: 'onExpand',
            name: 'onExpand事件',
        },
        {
            value: 'onLoad',
            name: 'onLoad事件',
        },
        {
            value: 'onRightClick',
            name: 'onRightClick事件',
        },
        {
            value: 'onSelect',
            name: 'onSelect事件',
        },
        // {
        //     value: 'onloadData',
        //     name: 'loadData异步加载数据',
        // },
        // {
        //     value: 'onDragEnd',
        //     name: 'onDragEnd事件',
        // },
        // {
        //     value: 'onDragEnter',
        //     name: 'onDragEnter事件',
        // },
        // {
        //     value: 'onDragLeave',
        //     name: 'onDragLeave事件',
        // },
        // {
        //     value: 'onDragOver',
        //     name: 'onDragOver事件',
        // },
        // {
        //     value: 'onDragStart',
        //     name: 'onDragStart事件',
        // },
        {
            value: 'onDrop',
            name: 'onDropt事件',
        },
    ],
    methods: [
        {
            name: 'update',
            title: '更新数据',
        },
        {
            name: 'getCheckedKeys',
            title: '获取勾选节点的keys',
        },
        {
            name: 'setCheckedKeys',
            title: '设置勾选节点，入参key[]',
        },
        {
            name: 'getSelectedKeys',
            title: '获取选中节点的keys',
        },
        {
            name: 'setSelectedKeys',
            title: '设置选中节点，入参key[]',
        },
        {
            name: 'getExpandedKeys',
            title: '获取展开节点的keys',
        },
        {
            name: 'setExpandedKeys',
            title: '设置展开节点，入参key[]',
        },
    ],
};
