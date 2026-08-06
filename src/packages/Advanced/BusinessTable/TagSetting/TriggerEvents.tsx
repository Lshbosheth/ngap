/**
 * 触发事件列表组件
 * 渲染多个触发事件项，支持事件修改和删除
 */
import React from 'react';
import styles from './TagSetting.module.less';
import { TriggerEventItem } from './TriggerEventItem';
import type { EventItem } from './TriggerEventItem';

interface TriggerEventsProps {
    /** 事件列表 */
    events: EventItem[];
    /** 事件列表变化回调 */
    onChange?: (events: EventItem[]) => void;
    /** 是否只读模式 */
    readOnly?: boolean;
    /** 列字段选项 */
    options?: { label: string; value: string }[];
    /** 当前列字段 */
    currentColumn?: string;
}

/**
 * 触发事件列表组件
 * 遍历渲染所有事件项，每项显示序号标题（触发结果1、触发结果2...）
 * 事件项的删除操作由外层通过 onChange 回调实现
 */
const TriggerEvents: React.FC<TriggerEventsProps> = ({ events, onChange, readOnly, options, currentColumn }) => (
    <div className={styles.eventArea}>
        {events.map((event, index) => (
            <TriggerEventItem
                key={event.id}
                title={`触发结果${index + 1}`}
                event={event}
                onChange={(updated) => {
                    if (onChange) {
                        const updatedEvents = [...events];
                        updatedEvents[index] = updated;
                        onChange(updatedEvents);
                    }
                }}
                onRemove={() => {
                    if (onChange) {
                        onChange(events.filter((_, i) => i !== index));
                    }
                }}
                readOnly={readOnly}
                options={options}
                currentColumn={currentColumn}
            />
        ))}
    </div>
);

export { TriggerEvents };
