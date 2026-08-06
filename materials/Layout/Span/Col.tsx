import NgapRender from './../../NgapRender/NgapRender';
import { useState, useEffect } from 'react';
import { Col, Space } from 'antd';
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
const SpanCol = ({ span, columnnum, index, elements }: any) => {
    const [eles, setEles] = useState([]);

    useEffect(() => {
        getElements();
    }, [elements]);
    const getElements = () => {
        const elesArr = elements.filter((ele: any) => ele.param == index);
        setEles(elesArr);
    };
    return (
        <Col className={`listItem `} style={{ width: columnnum == 5 ? '20%' : 'auto' }} span={columnnum == 5 ? null : span}>
            <Space direction="vertical" className={`spaceItem`}>
                {eles.length ? (
                    <NgapRender elements={eles} />
                ) : null}
            </Space>
        </Col>
    );
};
export default SpanCol;
