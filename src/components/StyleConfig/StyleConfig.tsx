import { memo, useEffect, useState, useMemo } from 'react';
import { Select, Form, Input, Slider, Radio, Tooltip, Flex, InputNumber } from 'antd';
import { useDebounceFn } from 'ahooks';
import { CaretDownOutlined, AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined } from '@ant-design/icons';
import { parseStyle } from './../../utils/util';
import MColorPicker from '../ColorPicker';
import BackgroundImage from './BackgroundImage';
import BackgroundSize from './BackgroundSize';
import FlexStyle from './FlexStyle';
import TitleStyle from './TitleStyle';
import Shadow from './Shadow';
import VsEditor from '../VsEditor';
import InputPx from './InputPx';
import DirectionInput from './DirectionInput';
import styles from './index.module.less';
import { styled } from 'styled-components';
import { useAppContext } from './../../utils/AppProvider';
// 修复contextmenu被裁剪显示不完整问题
const StyleCodeEditor = styled.div`
    .suggest-widget {
        width: 100% !important;
        left: 0 !important;
        max-width: 500px !important;
    }
`;

// 盒模型间距
interface IBoxSpacing {
    top: number | null;
    right: number | null;
    bottom: number | null;
    left: number | null
}

/**
 * 通用样式-配置组件
 */
const StyleConfig = () => {
    const [isRender, setRender] = useState(false);
    const [marginValues, setMarginValues] = useState<IBoxSpacing>({ top: null, right: null, bottom: null, left: null });
    const [paddingValues, setPaddingValues] = useState<IBoxSpacing>({ top: null, right: null, bottom: null, left: null });
    const { pageStore } = useAppContext();
    const state = pageStore();
    const selectedElement = state.selectedElement;
    const selectedElementType = selectedElement ? state.page.pageData.elementsMap[selectedElement.id]?.type : null;
    const [form] = Form.useForm();

    useEffect(() => {
        form.resetFields();
        // 填充页面样式
        if (!state.selectedElement) {
            form.setFieldValue('scopeCss', state?.page?.pageData?.config?.scopeCss || '/* 请在此处添加样式*/\n.ngapview{\n\n}');
            form.setFieldValue('scopeStyle', state?.page?.pageData?.config?.scopeStyle);
            const scopeStyle = state?.page?.pageData?.config?.scopeStyle;
            setMarginValues(parseShorthand(scopeStyle?.margin));
            setPaddingValues(parseShorthand(scopeStyle?.padding));
        } else {
            // 填充组件样式
            const config = state?.page?.pageData?.elementsMap?.[state.selectedElement.id]?.config || {};
            form.setFieldValue('scopeCss', config.scopeCss || '/* 请在此处添加样式*/\n.ngapview{\n\n}');
            form.setFieldValue('scopeStyle', config.scopeStyle || config.style);
            const scopeStyle = config.scopeStyle || config.style;
            setMarginValues(parseShorthand(scopeStyle?.margin));
            setPaddingValues(parseShorthand(scopeStyle?.padding));
            // 无实际作用，主要用于触发组件更新
            setRender(!isRender);
        }
    }, [state.selectedElement]);

    useEffect(() => {
        if (state.selectedElement && "Popover" === state.selectedElement.type) {
            // 避免卡顿 只增加针对Popover存在基础配置中size更新时变动样式表单
            const config = state.page.pageData.elementsMap[state.selectedElement.id]?.config || {};
            const style = config.scopeStyle || config.style || {};
            const currentWidth = form.getFieldValue(['scopeStyle', 'width']);
            const currentHeight = form.getFieldValue(['scopeStyle', 'height']);
            if (style.width !== currentWidth) {
                form.setFieldValue(['scopeStyle', 'width'], style.width);
            }
            if (style.height !== currentHeight) {
                form.setFieldValue(['scopeStyle', 'height'], style.height);
            }
        }
    }, [state.selectedElement,state.page.pageData.elementsMap]);

    // 采用防抖，防止表单频繁更新
    const { run } = useDebounceFn(
        () => {
            handleValueChange(form.getFieldsValue());
        },
        { wait: 500 },
    );

    // 接受UI表单值
    const handleValueChange = (values: any) => {
        // 解析样式
        const cssObject = parseStyle(values.scopeCss);
        // 更新页面信息
        if (!state.selectedElement) {
            state.savePageInfo({
                type: 'style',
                scopeCss: values.scopeCss,
                scopeStyle: values.scopeStyle,
                // 合并后样式
                style: {
                    ...values.scopeStyle,
                    ...cssObject,
                },
            });
        } else {
            state.editElement({
                id: state.selectedElement.id,
                type: 'style',
                scopeCss: values.scopeCss,
                scopeStyle: values.scopeStyle,
                // 合并后样式
                style: {
                    ...values.scopeStyle,
                    ...cssObject,
                },
            });
        }
    };
    const formLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 17 },
    };

    // 同步 DirectionInput 的状态与表单值
    const handleFormValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.scopeStyle) {
            if (changedValues.scopeStyle.margin !== undefined) {
                setMarginValues(parseShorthand(allValues.scopeStyle?.margin));
            }
            if (changedValues.scopeStyle.padding !== undefined) {
                setPaddingValues(parseShorthand(allValues.scopeStyle?.padding));
            }
        }
        run();
    };

    const parseShorthand = (value: string | undefined): IBoxSpacing => {
        if (!value || typeof value !== 'string') {
            return { top: null, right: null, bottom: null, left: null };
        }
        const parts = value.trim().split(/\s+/).filter(Boolean);
        const nums = parts.map(p => {
            const num = parseFloat(p);
            return isNaN(num) ? 0 : num;
        });
        if (nums.length === 1) {
            return { top: nums[0], right: nums[0], bottom: nums[0], left: nums[0] };
        }
        if (nums.length === 2) {
            return { top: nums[0], right: nums[1], bottom: nums[0], left: nums[1] };
        }
        if (nums.length === 3) {
            return { top: nums[0], right: nums[1], bottom: nums[2], left: nums[1] };
        }
        return { top: nums[0], right: nums[1], bottom: nums[2], left: nums[3] };
    };

    const formatShorthand = (values: IBoxSpacing): string => {
        const vals = [values.top, values.right, values.bottom, values.left].map(v => (v != null && v !== 0 ? `${v}px` : null)).filter(v => v !== null) as string[];
        if (vals.length === 0) return '0px';
        const nums = [values.top ?? 0, values.right ?? 0, values.bottom ?? 0, values.left ?? 0];
        if (nums[0] === nums[1] && nums[0] === nums[2] && nums[0] === nums[3]) return `${nums[0]}px`;
        if (nums[0] === nums[2] && nums[1] === nums[3]) {
            if (nums[0] === nums[1]) return `${nums[0]}px`;
            return `${nums[0]}px ${nums[1]}px`;
        }
        if (nums[1] === nums[3]) {
            return `${nums[0]}px ${nums[1]}px ${nums[2]}px`;
        }
        return `${nums[0]}px ${nums[1]}px ${nums[2]}px ${nums[3]}px`;
    };

    const handleDirectionChange = (type: 'margin' | 'padding', field: string, value: number | null) => {
        // const formValues = form.getFieldsValue();
        // const currentScopeStyle = formValues.scopeStyle || {};
        const currentDirValues = type === 'margin' ? marginValues : paddingValues;
        const updatedDirValues = { ...currentDirValues, [field]: value };
        const shorthand = formatShorthand(updatedDirValues);
        form.setFieldValue(['scopeStyle', type], shorthand);
        if (type === 'margin') {
            setMarginValues(updatedDirValues);
        } else {
            setPaddingValues(updatedDirValues);
        }
    };

    return (
        <Form className={styles.ui} {...formLayout} form={form} layout="horizontal" labelAlign="right" onValuesChange={handleFormValuesChange}>
            <TitleStyle>基础</TitleStyle>
            <Form.Item name={['scopeStyle', 'width']} label={'宽度'}>
                <InputPx />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'height']} label={'高度'}>
                <InputPx />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'margin']}>
                <DirectionInput
                    type="margin"
                    values={marginValues}
                    onChange={(field, value) => handleDirectionChange('margin', field, value)}
                    title="外边距(px)"
                    description="与其它元素的间距"
                    name="marginValues"
                />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'padding']} >
                 <DirectionInput
                    values={paddingValues}
                    type="padding"
                    onChange={(field, value) => handleDirectionChange('padding', field, value)}
                    title="内边距(px)"
                    description="影响自身占位大小"
                    name="paddingValues"
                />
            </Form.Item>
            {/* <MarginInput form={form} /> */}
            {/* <PaddingInput form={form} /> */}
            <Form.Item key={'opacity'} name={['scopeStyle', 'opacity']} label={'透明'}>
                <Slider min={0} max={1} step={0.1} defaultValue={1} />
            </Form.Item>
            <TitleStyle>布局</TitleStyle>
            <FlexStyle form={form} />
            <TitleStyle>文字</TitleStyle>
            <Form.Item name={['scopeStyle', 'fontSize']} label={'字号'}>
                <InputPx placeholder="eg: 14" />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'lineHeight']} label={'行高'}>
                <InputPx placeholder="eg: 30" />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'fontWeight']} label={'字重'}>
                <Select
                    key="fontWeight"
                    placeholder="eg: 400"
                    options={[
                        {
                            value: 100,
                            label: '100 Thin',
                        },
                        {
                            value: 200,
                            label: '200 Extra Light',
                        },
                        {
                            value: 300,
                            label: '300 Light',
                        },

                        {
                            value: 400,
                            label: '400 Normal',
                        },
                        {
                            value: 500,
                            label: '500 Medium',
                        },
                        {
                            value: 600,
                            label: '600 Semi Bold',
                        },
                        {
                            value: 700,
                            label: '700 Bold',
                        },
                        {
                            value: 800,
                            label: '800 Extra Bold',
                        },
                        {
                            value: 900,
                            label: '900 Black Bold',
                        },
                    ]}
                    suffixIcon={<CaretDownOutlined />}
                />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'color']} label={'颜色'}>
                <MColorPicker showText allowClear />
            </Form.Item>
            {selectedElementType !== 'Divider' && (
                <Form.Item name={['scopeStyle', 'textAlign']} label={'对齐'}>
                    <Radio.Group buttonStyle="solid" optionType="button">
                        <Tooltip title="左对齐">
                            <Radio value="left">
                                <AlignLeftOutlined />
                            </Radio>
                        </Tooltip>
                        <Tooltip title="居中对齐">
                            <Radio value="center">
                                <AlignCenterOutlined />
                            </Radio>
                        </Tooltip>
                        <Tooltip title="右对齐">
                            <Radio value="right">
                                <AlignRightOutlined />
                            </Radio>
                        </Tooltip>
                    </Radio.Group>
                </Form.Item>
            )}
            <TitleStyle>背景</TitleStyle>
            <Form.Item name={['scopeStyle', 'backgroundColor']} label={'颜色'}>
                <MColorPicker />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'backgroundImage']} label={'图片'} tooltip="支持渐变色。图片使用时，直接输入远程地址：http(s)://xxx.png">
                <BackgroundImage />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'backgroundSize']} label={'尺寸'} tooltip="默认的时候，可以手动输入尺寸">
                <BackgroundSize />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'backgroundRepeat']} label={'平铺'}>
                <Select
                    options={[
                        {
                            label: '不平铺',
                            value: 'no-repeat',
                        },
                        {
                            label: '平铺',
                            value: 'repeat',
                        },
                        {
                            label: '水平平铺',
                            value: 'repeat-x',
                        },
                        {
                            label: '垂直平铺',
                            value: 'repeat-y',
                        },
                    ]}
                    suffixIcon={<CaretDownOutlined />}
                ></Select>
            </Form.Item>
            <Form.Item name={['scopeStyle', 'backgroundPosition']} label={'位置'}>
                <Select
                    options={[
                        {
                            label: '上',
                            value: 'top',
                        },
                        {
                            label: '下',
                            value: 'bottom',
                        },
                        {
                            label: '左',
                            value: 'left',
                        },
                        {
                            label: '右',
                            value: 'right',
                        },
                        {
                            label: '居中',
                            value: 'center',
                        },
                    ]}
                    suffixIcon={<CaretDownOutlined />}
                ></Select>
            </Form.Item>
            <TitleStyle>定位</TitleStyle>
            <Form.Item key={'position'} name={['scopeStyle', 'position']} label={'定位'}>
                <Select
                    placeholder={'请选择'}
                    options={[
                        {
                            label: '静态定位',
                            value: 'static',
                        },
                        {
                            label: '相对定位',
                            value: 'relative',
                        },
                        {
                            label: '绝对定位',
                            value: 'absolute',
                        },
                        {
                            label: '固定定位',
                            value: 'fixed',
                        },
                        {
                            label: '粘性定位',
                            value: 'sticky',
                        },
                    ]}
                    suffixIcon={<CaretDownOutlined />}
                />
            </Form.Item>
            <Form.Item key={'zIndex'} name={['scopeStyle', 'zIndex']} label={'层级'}>
                <InputNumber placeholder="层级" />
            </Form.Item>
            {!['', undefined, 'static'].includes(form.getFieldValue(['scopeStyle', 'position'])) && (
                <Form.Item label="位置">
                    <Flex gap={3}>
                        <Form.Item name={['scopeStyle', 'top']} noStyle>
                            <InputPx placeholder="T: 10" />
                        </Form.Item>
                        <Form.Item name={['scopeStyle', 'right']} noStyle>
                            <InputPx placeholder="R: 10" />
                        </Form.Item>
                    </Flex>
                    <Flex gap={3} style={{ marginTop: 10 }}>
                        <Form.Item name={['scopeStyle', 'bottom']} noStyle>
                            <InputPx placeholder="B: 10" />
                        </Form.Item>
                        <Form.Item name={['scopeStyle', 'left']} noStyle>
                            <InputPx placeholder="L: 10" />
                        </Form.Item>
                    </Flex>
                </Form.Item>
            )}
            <Form.Item key={'overflow'} name={['scopeStyle', 'overflow']} label="溢出">
                <Select
                    placeholder={'请选择'}
                    options={[
                        {
                            label: '默认',
                            value: 'auto',
                        },
                        {
                            label: '可见',
                            value: 'visible',
                        },
                        {
                            label: '超出隐藏',
                            value: 'hidden',
                        },
                        {
                            label: '超出滚动',
                            value: 'scroll',
                        },
                    ]}
                    suffixIcon={<CaretDownOutlined />}
                />
            </Form.Item>
            <TitleStyle>边框</TitleStyle>
            <Form.Item name={['scopeStyle', 'borderRadius']} label={'圆角'}>
                <InputPx placeholder="eg：5" />
            </Form.Item>
            {/*<Form.Item name={['scopeStyle', 'border']} label={'边框'}>*/}
            {/*    <Input placeholder="eg：1px solid #fff" />*/}
            {/*</Form.Item>*/}
            <Form.Item name={['scopeStyle', 'borderColor']} label={'颜色'}>
                <MColorPicker />
            </Form.Item>
            <Form.Item name={['scopeStyle', 'borderWidth']} label={'宽度'}>
                <InputPx placeholder="eg：1" />
            </Form.Item>
            <Form.Item key={'borderStyle'} name={['scopeStyle', 'borderStyle']} label="线型">
                <Select
                    placeholder={'请选择'}
                    options={[
                        {
                            label: '无边框',
                            value: 'none',
                        },
                        {
                            label: '实线',
                            value: 'solid',
                        },
                        {
                            label: '虚线',
                            value: 'dashed',
                        },
                        {
                            label: '点线',
                            value: 'dotted',
                        },
                        {
                            label: '双实线',
                            value: 'double',
                        },
                    ]}
                    suffixIcon={<CaretDownOutlined />}
                />
            </Form.Item>
            <Form.Item label="阴影" name={['scopeStyle', 'boxShadow']}>
                <Shadow />
            </Form.Item>
            <TitleStyle>自定义样式</TitleStyle>
            <StyleCodeEditor>
                <Form.Item name="scopeCss" noStyle>
                    <VsEditor language="css" />
                </Form.Item>
            </StyleCodeEditor>
        </Form>
    );
};

export default memo(StyleConfig);
