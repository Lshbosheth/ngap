/**
 * 组件配置和属性值
 */

import IframeParamsSetting from './IframeParamsSetting';
import IFrameSetting from './iFrameSetting';
import IFrameEventsSetting from './IFrameEventsSetting';
import { FormInstance } from 'antd';
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'basic',
        },
        {
            type: 'function',
            label: '跳转链接',
            key: 'iFrameSetting',
            render(form: FormInstance, config: any) {
                return <IFrameSetting key="iFrameSetting" form={form} config={config} />;
            },
        },
        {
            type: 'Input',
            label: '显示标题',
            name: 'title',
        },
        {
            type: 'Switch',
            label: '自适应高度',
            name: 'adaptiveHeight',
        },
        {
            type: 'function',
            label: '链接入参配置',
            name: 'iframeParams',
            render(form: any) {
                return <IframeParamsSetting key="IframeParamsSetting" form={form} />;
            },
        },
        {
            type: 'Title',
            label: '事件配置',
            key: 'events',
        },
        {
            type: 'function',
            label: '事件名称配置',
            name: 'events',
            render(form: FormInstance, config: any) {
                return <IFrameEventsSetting key="IFrameEventsSetting" form={form} />;
            },
        },
        {
            type: 'Title',
            label: '内容裁剪',
            key: 'clip',
        },
        {
            type: 'InputPx',
            label: '顶部裁剪',
            name: ['clip', 'top'],
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            src: 'https://ngap.cs.cmos/',
            title: 'IFrame组件',
            clip: {
                top: '0px',
            },
            iframeParams: [],
            adaptiveHeight: false,
        },
        style: {
            position: 'relative',
            overflow: 'hidden',
            border: '5px solid #0085d0',
            width: '100%',
            height: '600px',
            padding: '5px',
        },
        events: [],
        api: {},
        source: '',
    },
    // 组件事件
    events: [],
    // 组件接口
    api: {},
    methods: [
        {
            name: 'reload',
            title: '重新加载',
        }
    ],
};
