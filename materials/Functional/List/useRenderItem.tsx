import React from 'react';
import { Avatar, Button, List, Tag } from 'antd';
import { ConfigType } from '@materials/types';
import { IConfig } from './List';
import * as icons from '@ant-design/icons';
import { formatDate, formatNumber } from '@materials/utils/util';
import { handleActionFlow } from '@materials/utils/action';

interface ItemData {
    [key: string]: any;
}

interface RenderItemProps {
    item: ItemData;
    config: ConfigType<IConfig>;
}

type IconName = keyof typeof icons;

const MemoizedListItem = (props: RenderItemProps) => {
    const { item, config } = props;
    const authMoInfos = config.props?.authMoInfo || {};
    const handleContent = (item: ItemData) => {
        const content = item[config.props.content?.name];
        const type = config.props.content.type;
        if (!content || !type || type === 'text') {
            return content;
        }
        if (type === 'money') return formatNumber(content, 'currency');
        if (type === 'number') return formatNumber(content);
        if (type === 'date1') return formatDate(content, 'YYYY-MM-DD');
        if (type === 'date2') return formatDate(content);
        if (type === 'tag') {
            if (Array.isArray(content)) {
                return content.map((tag, index) => <Tag key={index}>{tag}</Tag>);
            } else if (typeof content === 'string' || typeof content === 'number') {
                return <Tag>{content}</Tag>;
            }
            return content?.toString();
        }
    };
    const handleActions = () => {
        const handleOperate = (eventName: string, record: any = {}) => {
            const btnEvent = config.events.find((event: any) => event.eventName === eventName);
            handleActionFlow(btnEvent?.actions, record);
        };
        return (
            config.props.bulkActionList?.map((btn: any) => {
                const btnIcon = btn.icon ? React.createElement(icons[btn.icon as IconName] as React.ElementType) : null;
                let flage = true;
                if (btn.authCode) {
                    flage = authMoInfos[btn.authCode] === '1';
                }
                if (!flage) return []; //没有权限
                return (
                    <Button type={btn.type} danger={btn.danger} icon={btnIcon} onClick={() => handleOperate(btn.eventName, item)} key={btn.eventName}>
                        {btn.text}
                    </Button>
                );
            }) || []
        );
    };
    const renderAvatarOrIcon = () => {
        if (config.props.avatar && item[config.props.avatar]) {
            return <Avatar src={item[config.props.avatar]} />;
        }

        if (config?.props?.useIcon && config?.props?.icon) {
            const itemIcon: IconName = item[config.props?.icon];
            const IconComponent = itemIcon ? icons[itemIcon] : null;
            return IconComponent ? React.createElement(IconComponent as React.ElementType) : null;
        }

        return null;
    };
    const renderTitle = () => {
        const style = { color: config.props.title.color || config.style.color };
        return config.props.title?.name ? <span style={style}>{item[config.props.title.name]}</span> : null;
    };
    const renderDesc = () => {
        const style = { color: config.props.desc.color || config.style.color };
        return config.props.desc.name ? <span style={style}>{item[config.props.desc.name]}</span> : null;
    };
    const renderContent = () => {
        const style = { color: config.props.content.color || config.style.color };

        return config.props.content?.name ? <div style={style}>{handleContent(item)}</div> : null;
    };
    return (
        <List.Item actions={handleActions()}>
            <List.Item.Meta avatar={renderAvatarOrIcon()} title={renderTitle()} description={renderDesc()} />
            {renderContent()}
        </List.Item>
    );
};

export const useRenderItem = (config: RenderItemProps['config']) => {
    return (item: ItemData) => <MemoizedListItem item={item} config={config} />;
};
