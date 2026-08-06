import React, { useState } from 'react';
import TextHighlighter from '../bottomTools/TextHighlighter';
import { Popover } from 'antd';
import { CommponentBeansItem } from './types';
import collapsibleListStyle from './index.module.less';
import './componentDataTips.less';

interface CollapsibleListProps {
    items: CommponentBeansItem[];
    maxVisible?: number;
    keywords?: string;
    checkComponent: (data: CommponentBeansItem) => void;
}

const CollapsibleList: React.FC<CollapsibleListProps> = ({ items = [], maxVisible = 5, keywords = '', checkComponent }) => {
    const [showAll, setShowAll] = useState(false);
    const displayedItems = showAll ? items : items.slice(0, maxVisible);
    // 高亮关键字样式
    const highlightStyle = {
        color: 'red',
        textDecorationColor: 'red',
    };

    // 加载气泡卡片内容
    const randerContent = (item: CommponentBeansItem) => {
        return (
            <div className="componentDataTipCont">
                {item.componentPicture ? (
                    <img className="componentDataTipImg" src={item.componentPicture} />
                ) : (
                    <div className="componentDataNoImg">暂无预览效果</div>
                )}
            </div>
        );
    };

    // 选中业务组件
    const selectComponent = (data: CommponentBeansItem) => {
        checkComponent(data);
    };

    return (
        <>
            {displayedItems.map((item) => (
                <div className={collapsibleListStyle.componentNode} key={item.id}>
                    <Popover content={randerContent(item)} title={item.componentName} overlayClassName="componentDataTips">
                        <div
                            className={collapsibleListStyle.componentNameStr}
                            title={item.componentName}
                            onClick={() => {
                                selectComponent(item);
                            }}
                        >
                            <TextHighlighter text={item.componentName} keywords={keywords} highlightStyle={highlightStyle} />
                        </div>
                    </Popover>
                </div>
            ))}
            {!showAll && items.length > maxVisible && (
                <div className={collapsibleListStyle.componentMore} onClick={() => setShowAll(true)}>{`更多>>`}</div>
            )}
            {showAll &&
                Array.from({ length: items.length % 3 === 1 ? 1 : items.length % 3 === 2 ? 0 : 2 }).map((_, index) => (
                    <div key={`placeholder-${index}`} className={collapsibleListStyle.componentBlank}></div>
                ))}
            {showAll && <div className={collapsibleListStyle.componentMore} onClick={() => setShowAll(false)}>{`收起>>`}</div>}
        </>
    );
};

export default CollapsibleList;
