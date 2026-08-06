/**
 * 触发事件项组件
 * 用于配置单个触发事件，支持设置填充色、文字色、图标显示���选项禁用等
 */
import React, { useState } from 'react';
import { Row, Col, Switch, Upload, Button, Select, ColorPicker, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import styles from './TagSetting.module.less';

const { Option } = Select;

/**
 * 动作类型枚举
 * 1 - 设置行填充颜色：显示颜色选择
 * 2 - 设置行文字颜色：显示颜色和列选择
 * 3 - 显示图标：显示位置、图标上传、气泡弹窗、图标大小
 * 4 - 设置选项禁用：无额外配置
 */
export enum ActionType {
    /** 设置行填充色 */
    SetRowBgColor = 1,
    /** 设置行文字色 */
    SetRowTextColor = 2,
    /** 设置图标 */
    ShowIcon = 3,
    /** 设置行禁止勾选 */
    SetOptionDisabled = 4,
}

/**
 * 动作选项配置
 */
const ACTION_OPTIONS = [
    { label: '设置行填充色', value: ActionType.SetRowBgColor },
    { label: '设置行文字色', value: ActionType.SetRowTextColor },
    { label: '设置图标', value: ActionType.ShowIcon },
    { label: '设置行禁止勾选', value: ActionType.SetOptionDisabled },
];

/**
 * 事件项接口
 */
export interface EventItem {
    id: string;
    action: ActionType;
    color?: string;
    columns?: string[];
    position?: string;
    iconUrl?: string;
    iconName?: string;
    showTooltip?: boolean;
    tooltipContent?: string;
    iconSize?: string;
}

const BG_COLOR_OPTIONS = [
    { label: '红色', value: '#fee6e6', color: '#fee6e6' },
    { label: '绿色', value: '#eef6de', color: '#eef6de' },
    { label: '橙色', value: 'orange', color: 'orange' },
];

const TEXT_COLOR_OPTIONS = [
    { label: '红色', value: '#f65a56', color: '#f65a56' },
    { label: '绿色', value: '#009966', color: '#009966' },
    { label: '蓝色', value: '#0085d0', color: '#0085d0' },
    { label: '默认', value: '#333333', color: '#333333' },
];

const COLOR_OPTIONS_MAP: Record<number, typeof BG_COLOR_OPTIONS> = {
    [ActionType.SetRowBgColor]: BG_COLOR_OPTIONS,
    [ActionType.SetRowTextColor]: TEXT_COLOR_OPTIONS,
};

interface TriggerEventItemProps {
    /** 事件标题 */
    title: string;
    /** 事件配置 */
    event: EventItem;
    /** 事件变化回调 */
    onChange?: (event: EventItem) => void;
    /** 删除事件回调 */
    onRemove?: () => void;
    /** 是否只读模式 */
    readOnly?: boolean;
    /** 列字段选项 */
    options?: { label: string; value: string }[];
    /** 当前列字段 */
    currentColumn?: string;
}

/**
 * 触发事件项组件
 * 根据选择的动作类型动态显示对应配置项
 */
const TriggerEventItem: React.FC<TriggerEventItemProps> = ({ title, event, onChange, onRemove, readOnly, options, currentColumn }) => {
    const [customColor, setCustomColor] = useState<string>(event.color || '#fee6e6');
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    const showColor = event.action === ActionType.SetRowBgColor || event.action === ActionType.SetRowTextColor;
    const showColumn = event.action === ActionType.SetRowTextColor;
    const showPosition = event.action === ActionType.ShowIcon;
    const showUpload = event.action === ActionType.ShowIcon;
    const showTooltip = event.action === ActionType.ShowIcon;
    const showSize = event.action === ActionType.ShowIcon;
    const isCustomColor = event.action === ActionType.SetRowBgColor
        ? !BG_COLOR_OPTIONS.some((opt) => opt.value === event.color)
        : !TEXT_COLOR_OPTIONS.some((opt) => opt.value === event.color);

    const colorOptions = COLOR_OPTIONS_MAP[event.action] || [];

    const getColorLabel = (colorValue?: string) => {
        if (!colorValue) return '';
        const preset = colorOptions.find((opt) => opt.value === colorValue);
        if (preset) return preset.label;
        return colorValue;
    };

    return (
        <div className={styles.eventItem}>
            <div className={styles.eventHeader}>
                <span>{title}</span>
                {!readOnly && (
                    <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className={styles.deleteBtn}
                        onClick={onRemove}
                    />
                )}
            </div>
            <Row gutter={10}>
                <Col span={24} className={styles.configItem}>
                    <div className={styles.flexRow}>
                        <span className={styles.eventLabel}>动作：</span>
                        <Select
                            value={event.action}
                            className={styles.eventSelect}
                            onChange={(val) => {
                                // 切换动作时，重置相关配置
                                let updatedEvent = { ...event, action: val };
                                // 如果切换到颜色相关的动作，重置颜色为对应的默认值
                                if (val === ActionType.SetRowBgColor) {
                                    updatedEvent.color = BG_COLOR_OPTIONS[0].value;
                                } else if (val === ActionType.SetRowTextColor) {
                                    updatedEvent.color = TEXT_COLOR_OPTIONS[0].value;
                                } else if (val === ActionType.ShowIcon) {
                                    updatedEvent.iconSize = 'default';
                                }
                                onChange?.(updatedEvent);
                            }}
                            disabled={readOnly}
                        >
                            {ACTION_OPTIONS.map((opt) => (
                                <Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </Col>
                {showColor && (
                    <Col span={24} className={styles.configItem}>
                        <div className={styles.flexRow}>
                            <span className={styles.eventLabel}>颜色：</span>
                            <Select
                                value={showColorPicker ? 'custom' : event.color}
                                className={styles.colorSelect}
                                onChange={(val) => {
                                    if (val === 'custom') {
                                        setShowColorPicker(true);
                                        onChange?.({ ...event, color: customColor });
                                    } else {
                                        setShowColorPicker(false);
                                        onChange?.({ ...event, color: val });
                                    }
                                }}
                                disabled={readOnly}
                            >
                                {colorOptions.map((opt) => (
                                    <Option key={opt.value} value={opt.value}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: opt.color, border: '1px solid #d9d9d9' }} />
                                            {opt.label}
                                        </span>
                                    </Option>
                                ))}
                                <Option value="custom">自定义</Option>
                            </Select>
                            {showColorPicker && (
                                <ColorPicker
                                    value={customColor}
                                    onChange={(color) => {
                                        const hexColor = color.toHexString();
                                        setCustomColor(hexColor);
                                        onChange?.({ ...event, color: hexColor });
                                    }}
                                    disabled={readOnly}
                                    size="small"
                                    style={{ marginLeft: 8 }}
                                />
                            )}
                        </div>
                    </Col>
                )}
                {showColumn && (
                    <Col span={24} className={styles.configItem}>
                        <div className={styles.flexRow}>
                            <span className={styles.eventLabel}>选择列：</span>
                            <Select
                                mode="multiple"
                                value={event.columns?.length ? event.columns : (currentColumn ? [currentColumn] : [])}
                                className={styles.columnSelect}
                                onChange={(val) => onChange?.({ ...event, columns: val })}
                                disabled={readOnly}
                                placeholder="请选择列"
                            >
                                {options?.map((opt) => (
                                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                )}
                {showPosition && (
                    <Col span={24} className={styles.configItem}>
                        <div className={styles.flexRow}>
                            <span className={styles.eventLabel}>显示位置：</span>
                            <Select
                                value={event.position || 'prefix'}
                                className={styles.positionSelect}
                                onChange={(val) => onChange?.({ ...event, position: val })}
                                disabled={readOnly}
                            >
                                <Option value="prefix">前缀</Option>
                                <Option value="suffix">后缀</Option>
                            </Select>
                        </div>
                    </Col>
                )}
                {(showUpload || showTooltip) && (
                    <>
                        {/* 图标上传和图标名称各占一半 */}
                        {showUpload && (
                            <Col span={24} className={styles.configItem}>
                                <Row gutter={10} align="middle">
                                    <Col span={12}>
                                        <div className={styles.flexRow}>
                                            <span className={styles.eventLabel}><span style={{ color: '#ff4d4f' }}>*</span> 图标上传：</span>
                                            {!event.iconUrl ? (
                                                <Upload
                                                    action="/csf/call/importOssByFile"
                                                    accept="image/*"
                                                    maxCount={1}
                                                    showUploadList={false}
                                                    customRequest={(options: any) => {
                                                        const { file, onSuccess } = options;
                                                        request
                                                            .upload('/csf/call/importOssByFile', 'fileupload', file, { type: 'image' })
                                                            .then((res) => {
                                                                onSuccess({ data: { url: res.bean.url } });
                                                                onChange?.({ ...event, iconUrl: String(res.bean.url) });
                                                                message.success('图标上传成功');
                                                            })
                                                            .catch((err) => {
                                                                console.error('上传失败:', err);
                                                            });
                                                    }}
                                                    beforeUpload={(file: any) => {
                                                        if (!file.size) {
                                                            message.error('文件大小必须大于0KB');
                                                            return Upload.LIST_IGNORE;
                                                        }
                                                        const maxSize = 4 * 1024 * 1024;
                                                        if (file.size > maxSize) {
                                                            message.error('文件大小不能超过4MB');
                                                            return Upload.LIST_IGNORE;
                                                        }
                                                    }}
                                                >
                                                    <Button size="small" className={styles.iconUploadBtn} disabled={readOnly}>上传图标</Button>
                                                </Upload>
                                            ) : (
                                                <>
                                                    <img src={event.iconUrl} alt="已上传图标" className={styles.iconPreviewImg} />
                                                    {!readOnly && (
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            className={styles.iconDeleteBtn}
                                                            onClick={async () => {
                                                                try {
                                                                    await request.post('/csf/call/deleteOssByFile', {
                                                                        params: {
                                                                            url: event.iconUrl
                                                                        }
                                                                    });
                                                                    message.success('图标删除成功');
                                                                    onChange?.({ ...event, iconUrl: '' });
                                                                } catch (error) {
                                                                    console.error('删除 OSS 文件失败:', error);
                                                                }
                                                            }}
                                                        >
                                                            删除
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.flexRow}>
                                            <span className={styles.eventLabel}><span style={{ color: '#ff4d4f' }}>*</span> 图标名称：</span>
                                            <Input
                                                value={event.iconName || ''}
                                                onChange={(e) => onChange?.({ ...event, iconName: e.target.value })}
                                                placeholder="请输入图标名称"
                                                disabled={readOnly}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        )}
                        {/* 交互事件和内容形式各占一半 */}
                        {showTooltip && (
                            <Col span={24} className={styles.configItem}>
                                <Row gutter={10} align="middle">
                                    <Col span={12}>
                                        <div className={styles.flexRow}>
                                            <span className={styles.eventLabel}>交互事件：</span>
                                            <Select
                                                value={event.showTooltip ? '悬浮气泡' : '无'}
                                                onChange={(val) => onChange?.({ ...event, showTooltip: val === '悬浮气泡', ...(val === '无' ? { tooltipContent: undefined, columns: undefined } : {}) })}
                                                disabled={readOnly}
                                                style={{ width: '100%' }}
                                            >
                                                <Option value="无">无</Option>
                                                <Option value="悬浮气泡">悬浮出气泡</Option>
                                            </Select>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        {event.showTooltip && (
                                            <div className={styles.flexRow}>
                                                <span className={styles.eventLabel}>内容形式：</span>
                                                <Select
                                                    value={event.tooltipContent || 'description'}
                                                    className={styles.tooltipSelect}
                                                    onChange={(val) => onChange?.({ ...event, tooltipContent: val })}
                                                    disabled={readOnly}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Option value="description">描述列表</Option>
                                                    {/* <Option value="table">表格</Option> */}
                                                </Select>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </Col>
                        )}
                    </>
                )}
                {showSize && event.showTooltip && (
                    <Col span={24} className={styles.configItem}>
                        <div className={styles.flexRow}>
                            <span className={styles.eventLabel}>字段选择：</span>
                            <Select
                                mode="multiple"
                                value={event.columns || []}
                                className={styles.sizeSelect}
                                placeholder="请选择"
                                onChange={(val) => onChange?.({ ...event, columns: val })}
                                disabled={readOnly}
                            >
                                {options?.map((opt) => (
                                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                ))}
                            </Select>
                        </div>
                        {(!options || options.length < 1) && (
                            <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px', paddingLeft: '75px' }}>
                                请先配置表格的服务数据，然后选择需要的字段
                            </div>
                        )}
                    </Col>
                )}
                {showSize && (
                    <Col span={24} className={styles.configItem}>
                        <div className={styles.flexRow}>
                            <span className={styles.eventLabel}>图标大小：</span>
                            <Select
                                value={event.iconSize || 'default'}
                                className={styles.sizeSelect}
                                onChange={(val) => onChange?.({ ...event, iconSize: val })}
                                disabled={readOnly}
                            >
                                <Option value="default">默认</Option>
                                <Option value="large">大</Option>
                                <Option value="small">小</Option>
                            </Select>
                        </div>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export { TriggerEventItem };
