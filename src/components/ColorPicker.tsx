import React from 'react';
import { Col, ColorPicker, Divider, Row, Space, theme } from 'antd';
import type { ColorPickerProps } from 'antd';
import type { Color } from 'antd/es/color-picker';

interface MColorPickerProps {
    value?: string;
    onChange?: (color: string) => void;
    style?: React.CSSProperties;
    showText?: boolean;
    allowClear?: boolean;
}

const MColorPicker: React.FC<MColorPickerProps> = (props) => {
    const { value, onChange, style, showText, allowClear } = props;
    const customPanelRender: ColorPickerProps['panelRender'] = (_, { components: { Picker, Presets } }) => (
        <Row justify="space-between" wrap={false}>
            <Col span={12}>
                <Presets />
            </Col>
            <Divider type="vertical" style={{ height: 'auto' }} />
            <Col flex="auto">
                <Picker />
            </Col>
        </Row>
    );
    const presets = [
        {
            label: '常用',
            colors: ['#333333', '#FFFFFF', '#0085D0', '#F65A56'],
            defaultOpen: true,
        },
        {
            label: '字体',
            colors: ['#000000', '#333333', '#666666', '#999999', '#BBBBBB', '#FFFFFF'],
            defaultOpen: true,
        },
        {
            label: '线条',
            colors: ['#EAEDF2', '#D5DCE6', '#C5CDD8'],
            defaultOpen: true,
        },
        {
            label: '填充',
            colors: ['#DAE1E6', '#F9F9F9'],
            defaultOpen: true,
        },
        {
            label: '彩色',
            colors: ['#0085D0', '#F65A56', '#F38900', '#90C31F'],
            defaultOpen: true,
        },
        {
            label: '不常用色',
            colors: ['#E9F4FA', '#BAE4F2', '#C0E2FB'],
            defaultOpen: true,
        },
    ];

    const handleChange = (color: Color) => {
        onChange?.(color.toHexString());
    };

    const handleClear = () => {
        onChange?.('');
    };

    return (
        <ColorPicker
            style={style}
            value={value}
            format="hex"
            showText={showText ?? true}
            allowClear={allowClear ?? true}
            onChange={handleChange}
            onClear={handleClear}
            styles={{ popupOverlayInner: { width: 450 } }}
            presets={presets}
            panelRender={customPanelRender}
        />
    );
};

export default MColorPicker;
