import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { useState, useEffect } from 'react';
import { Col, Space } from 'antd';
import { useAppContext } from './../../../utils/AppProvider';
import styles from './index.module.less';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    text: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const SpanCol = ({ span, columnnum, pId, index, elements }: any) => {
    const [eles, setEles] = useState([]);
    const { pageStore, mode } = useAppContext();
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const _state = useAppContext();
    // 拖拽接收
    const [{ isOver }, drop] = useDrop({
        accept: 'MENU_ITEM',
        async drop(item: IDragTargetItem, monitor) {
            if (monitor.didDrop()) return;
            // 生成默认配置
            const { config, events, methods = [] }: any = (await getComponent(item.type + 'Config'))?.default || {};
            addChildElements({
                type: item.type,
                name: item.name,
                parentId: pId,
                param: `${index}`,
                id: item.id,
                componentId: (item as { componentId?: string }).componentId,
                userInfo,
                apiList,
                _state,
                config,
                events,
                methods,
            });
        },
        // TODO: 拖拽组件时，容器呈现背景色（后期需要判断组件是否可以拖入）
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });
    useEffect(() => {
        getElements();
    }, [elements]);
    const getElements = () => {
        const elesArr = elements.filter((ele: any) => ele.param == index);
        setEles(elesArr);
    };
    return (
        <Col className={`listItem `} style={{ width: columnnum == 5 ? '20%' : 'auto' }} span={columnnum == 5 ? null : span} ref={drop}>
            <Space direction="vertical" className={`spaceItem ${mode == 'edit' ? (isOver ? styles.boxHover : styles.box) : ''}`}>
                {eles.length ? (
                    <NgapRender elements={eles} />
                ) : (
                    <div className="slots" style={{ height: 40, lineHeight: '40px' }}>
                        拖拽元素到这里
                    </div>
                )}
            </Space>
        </Col>
    );
};
export default SpanCol;
