import "./index.less";
import { Col, Popover, Row } from "antd";
import React, { useEffect, useState } from "react";
import { ArrowsAltOutlined, CheckOutlined } from "@ant-design/icons";
import { numberToChinese } from "@/packages/utils/util";

interface ColorPickerProps {
    value?: string,
    onChange?: (v: string) => void,
    index?: number,
    dataSource: any[]
}

const ColorPicker = ({ value, onChange, index, dataSource }: ColorPickerProps) => {

    const [open, setOpen] = useState(false);

    const [checkColor, setCheckColor] = useState<any>(value);

    useEffect(() => {
        setOpen(false);
        onChange?.(checkColor);
    }, [checkColor]);

    const getNodeIndex = () => {
        return index ? numberToChinese(index + 1) : "";
    };

    const ColorList = () => {
        return <div className={"color-list-wrap"}>
            <div className={"color-list-title"}>节点{getNodeIndex()}颜色选择</div>
            <div className={"color-list-sub-title"}>下方标注为推荐使用场景</div>

            <Row gutter={[10, 10]}>
                {dataSource.map((item: any) =>
                    <Col className={"color-list-col"} span={12}>
                        <div className={"color-list-round"} onClick={() => {
                            setCheckColor(item.value);
                        }} style={{ backgroundColor: item.value }}>
                            {checkColor === item.value && <CheckOutlined />}
                        </div>
                        <div>{item.title}</div>
                    </Col>)}
            </Row>
        </div>;
    };

    return <div className={"color-picker-wrap"}>
        <div className={"color-picker-color"} style={{ background: checkColor }} />
        <div>{checkColor}</div>
        <Popover content={<ColorList />}
                 trigger="click"
                 placement="top"
                 open={open}
                 onOpenChange={setOpen}>
            <div className={"popup-icon"}><ArrowsAltOutlined /></div>
        </Popover>
    </div>;
};

export default ColorPicker;
