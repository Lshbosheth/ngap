import * as icons from "@ant-design/icons";
import React, { useEffect, useMemo, useState } from "react";
import { Input, Popover } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import "./index.less";

interface IconSelectProps {
    value?: string,
    onChange?: (val: string | undefined) => void,
    placeholder: string
}

const IconSelect = ({ value, onChange, placeholder }:IconSelectProps) => {
    // 获取所有的antd图标，动态渲染到下拉框中
    // 过滤纯图标key，过滤工具函数
    const allIconKeys = Object.keys(icons).filter(
        (k) => !["default", "createFromIconfontCN", "getTwoToneColor", "setTwoToneColor", "IconProvider"].includes(k)
    );

    const iconsList:any = icons;
    const [open, setOpen] = useState(false);
    const [searchWord, setSearchWord] = useState("");
    const [mValue, setValue] = useState<any>(value);

    // 搜索过滤图标列表
    const iconKeys = useMemo(() => {
        if (!searchWord.trim()) return allIconKeys;
        return allIconKeys.filter(key => key.toLowerCase().includes(searchWord.toLowerCase()));
    }, [allIconKeys, searchWord]);

    // 选中图标回调
    const handleSelectIcon = (key: string) => {
        onChange?.(key);
        setOpen(false);
        setSearchWord("");
        setValue(key);
    };

    useEffect(() => {
        if (!open) {
            setSearchWord("");
        }
    }, [open]);

    // 渲染弹窗内图标网格
    const IconGrid = () => (
        <div style={{ flex: 1, overflowY: "auto" }}>
            <div className={"pop-grid"}>
                {iconKeys.map((key) => (
                    <div
                        key={key}
                        onClick={() => handleSelectIcon(key)}
                        className={"icon-item"}
                        style={{ background: mValue === key ? "#e6f7ff" : "#fff" }}
                    >
                        {React.createElement(iconsList[key] as any, { style: { fontSize: 18 } })}
                    </div>
                ))}
            </div>
            {iconKeys.length === 0 && (
                <div className={"icon-none"}>无匹配图标</div>
            )}
        </div>
    );

    // 生成输入框前缀图标（createElement 方式）
    const renderInputPrefix = () => {
        if (!mValue || !iconsList[mValue]) return null;
        return React.createElement(iconsList[mValue], { style: { fontSize: 16 } });
    };

    const onClear = (e: any) => {
        e.stopPropagation();
        handleSelectIcon("");
    };

    return <Popover
        content={<IconGrid />}
        trigger="click"
        placement="bottom"
        open={open}
        onOpenChange={setOpen}
    >
        <div style={{ position: "relative" }}>
            {!searchWord && <div className={"icon-value"} style={{
                opacity: open ? 0.5 : 1
            }}>{renderInputPrefix()}</div>}
            <Input
                placeholder={mValue ? "" : placeholder}
                allowClear
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
            />
            {mValue && <div className={"icon-clear"} onClick={onClear}><CloseCircleOutlined /></div>}
        </div>

    </Popover>;
};
export default IconSelect;
