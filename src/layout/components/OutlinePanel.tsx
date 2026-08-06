import { memo, useEffect, useMemo, useState } from 'react';
import { Tree, Row } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import style from './Menu/index.module.less';
import { cloneDeep } from 'lodash-es';
import { getElement } from '@/utils/util';
/**
 * 大纲
 */
const OutlinePanel = memo(() => {
    const { pageStore } = useAppContext();

    const { pageName, elements, selectedEl, setSelectedElement, dragSortElements } = pageStore(
        useShallow((state: any) => ({
            pageName: state?.config?.appName || state?.config?.componentName || '',
            elements: state?.page?.pageData?.elements || [],
            selectedEl: state.selectedElement,
            setSelectedElement: state.setSelectedElement,
            dragSortElements: state.dragSortElements,
        })),
    );
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    // 在treeData的useMemo中添加标题处理逻辑
    const processedTreeData = useMemo(() => {
        const processNode = (node: any): any => {
            const title = node.elementAlias || node.name || node.type || '未命名';
            const processedNode = { ...node, title, key: node.id };

            if (node.elements && node.elements.length > 0) {
                processedNode.elements = node.elements.map(processNode);
            }

            return processedNode;
        };

        return [
            processNode({
                elementAlias: `页面【${pageName}】`,
                type: `页面【${pageName}】`,
                id: 'page',
                elements,
            }),
        ];
    }, [elements, pageName]);

    // 然后使用processedTreeData和修改后的fieldNames
    {
        /* <Tree
  // ... 其他属性
  fieldNames={{ title: 'title', key: 'id', children: 'elements' }}
  treeData={processedTreeData}
  // ... 其他属性
/> */
    }

    // const treeData: any = useMemo(
    //   () => [
    //     {
    //       elementAlias: `页面【${pageName}】`,
    //       type: `页面【${pageName}】`,
    //       id: 'page',
    //       elements,
    //     },
    //   ],
    //   [elements],
    // );

    useEffect(() => {
        if (selectedEl) {
            setSelectedKeys([selectedEl.id]);
        } else {
            setSelectedKeys([]);
        }
    }, [selectedEl]);

    // 组件选择，画布中的组件会同步选中。
    const handleSelect = (selectedKeys: any, { node }: any) => {
        setSelectedKeys(selectedKeys);
        if (selectedKeys.length > 0) {
            if (selectedKeys[0] === 'page') {
                setSelectedElement(undefined);
            } else {
                setSelectedElement({
                    id: node.id,
                    type: node.type,
                });
            }
        } else {
            setSelectedElement(undefined);
        }
    };

    // 拖拽排序
    const onDrop = (info: any) => {
        const { key: dragKey, type: dragType, name, elements: dragChildren } = info.dragNode;
        const { key: dropKey } = info.node;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

        const list: any[] = cloneDeep(elements);

        // 拖拽排序后，删除原组件
        const result = getElement(list, dragKey);
        if (result && result.elements) {
            result.elements.splice(result.index, 1);
        }
        // 拖拽后的新节点
        const dropItem = {
            id: dragKey,
            type: dragType,
            name,
            elements: dragChildren,
        };
        let parentId = null;
        // 移动到组件里面，添加为子组件
        if (!info.dropToGap) {
            if (dropKey == 'page') {
                list.unshift(dropItem);
            } else {
                const { element } = getElement(list, dropKey);
                if (element) {
                    parentId = dropKey;
                    element.elements = element.elements || [];
                    element.elements.unshift({ ...dropItem, parentId: dropKey });
                }
            }
        } else {
            const { index, elements } = getElement(list, dropKey) || { item: {}, index: 0 };
            parentId = elements[index].parentId;
            if (dropPosition === -1) {
                elements?.splice(index, 0, { ...dropItem, parentId });
            } else {
                elements?.splice(index + 1, 0, { ...dropItem, parentId });
            }
        }
        dragSortElements({ id: dragKey, list, parentId });
        setSelectedKeys([]);
    };

    return (
        <Row className={style.outlinePanel}>
            <Tree
                showLine
                defaultExpandAll
                draggable
                switcherIcon={<DownOutlined />}
                fieldNames={{ title: 'title', key: 'id', children: 'elements' }}
                treeData={processedTreeData}
                selectedKeys={selectedKeys}
                onSelect={handleSelect}
                onDrop={onDrop}
                style={{ width: '100%' }}
            />
        </Row>
    );
});

export default OutlinePanel;
