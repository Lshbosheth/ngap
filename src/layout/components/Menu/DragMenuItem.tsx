import React, { useState, useCallback } from 'react';
import { cloneDeep } from 'lodash-es';
import { DragSourceMonitor, useDrag } from 'react-dnd';
import { IDragTarget } from '@/packages/types/index';
import { checkComponentType, createId } from '@/utils/util';
import { getComponent } from '@/packages/index';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import styles from './index.module.less';
import dealPageData, { dealPageDataId } from '@/utils/dataToCanvas';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { mergeApis, updateApiConfig } from '../../../utils/dealApiGlobal';
import { handleApi } from '../../../packages/utils/handleApi';
import { crossApiUserInfo } from '../../../stores/crossapiStore';
import { apiListInfo } from '../../../stores/apiListStore';
import { Tooltip } from 'antd';
import FormItemModal from '@/components/FormItemModal';
/**
 * 拖拽目标
 * @param props 拖拽对象属性值
 * @returns 返回可拖拽组件对象
 */
const DragMenuItem = (props: IDragTarget & { onComponentAction?: (componentId: string) => void }) => {
    const { onComponentAction } = props;
    const _state = useAppContext();
    const { pageStore } = _state;
    const {
        baseInfo,
        apiListAddApi,
        apisGlobal,
        updateApiGlobal,
        selectedElement,
        elementsMap,
        setVariableData,
        addElement,
        variables,
        editVariable,
        addChildElements,
        addBussinessElement,
        addVariable,
        apiOutParam,
        addApiOutParam,
        apiOutData,
        editApiOutData,
    } = pageStore(
        useShallow((state: any) => ({
            baseInfo: state.config,
            addElement: state.addElement,
            addChildElements: state.addChildElements,
            selectedElement: state.selectedElement,
            elementsMap: state?.page?.pageData?.elementsMap || {},
            apisGlobal: state?.page?.pageData?.apisGlobal || {},
            variables: state?.page?.pageData?.variables || [],
            apiOutParam: state?.page?.pageData?.apiOutParam || {},
            addApiOutParam: state.addApiOutParam,
            apiOutData: state?.page?.pageData?.apiOutData || {},
            addVariable: state.addVariable,
            editApiOutData: state.editApiOutData,
            setVariableData: state.setVariableData,
            editVariable: state.editVariable,
            updateApiGlobal: state.updateApiGlobal,
            apiListAddApi: state.apiListAddApi,
            addBussinessElement: state.addBussinessElement,
        }))
    );
    const [nodeId, setNodeId] = useState(createId(props.type));
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState<IDragTarget | null>(null);
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: 'MENU_ITEM',
            item: {
                id: nodeId,
                type: props.type,
                name: props.name,
                componentId: props.componentid,
            },
            end: (item, monitor) => {
                // 只有拖进画布成功放置后才记录组件ID
                setNodeId(createId(props.type));
                if (monitor.didDrop() && onComponentAction && props.componentid) {
                    onComponentAction(props.componentid);
                }
            },
            collect: (monitor: DragSourceMonitor) => {
                return {
                    isDragging: monitor.isDragging(),
                };
            },
        }),
        [nodeId],
    );
    // 合并全局变量
    const mergeVariable = (pageData: any) => {
        const variablesNames = variables.map((variable: any) => variable.name);
        (pageData.variables || []).forEach((variable: any) => {
           
            if (variablesNames.indexOf(variable.name) == -1) {
                addVariable(variable);
            } else {
                editVariable(variable);
            }
        });
        for (let key in pageData.variableData) {
            setVariableData({ name: key, value: pageData.variableData[key] });
        }
    };
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    // 合并接口
    const mergeApi = (pageData: any) => {
        // 获取新增api相关的出口参数和api出参
        updateApiConfig({
            api: mergeApis(apisGlobal, pageData, updateApiGlobal), // 合并api配置
            apiOutParam,
            addApiOutParam,
            apiOutData,
            editApiOutData,
            handleApi,
            _state,
            userInfo,
            apiList,
        });
    };

    const handleClick = async (item: IDragTarget) => {
        // 双击时通知父组件记录组件ID
        if (onComponentAction && item.componentid) {
            onComponentAction(item.componentid);
        }

        // 生成默认配置
        if (item.type == 'businessComponent') {
            const nodes = await getBusinessComponent(item.componentid + '');
            const { pageData } = dealPageData(nodes.bean);
           
            dealPageDataId(pageData);
            addBussinessElement(pageData);
            // 合并全局变量
            mergeVariable(pageData);
            // 合并接口
            mergeApi(pageData);
        } else {
            const { config, events, methods = [], elements = [] } = (await getComponent(item.type + 'Config'))?.default || {};
            const newId = createId(item.type);
            addChild(item, config, events, methods, elements, newId);
        }
    };

    // 获取业务组件配置信息
    const getBusinessComponent = (componentid: string) => {
        return request.post('/appComponent/queryAppComponentInfo', {
            params: {
                serviceTypeId: baseInfo.serviceTypeId,
                id: componentid,
            },
        });
    };

    const handleAddToContainer = useCallback(
        async (containerType: string, item: IDragTarget) => {
          let {
            config: formItemConfig,
            events: formItemEvents,
            methods: formItemMethods = [],
            elements: formItemElements = [],
          } = (await getComponent(item.type + 'Config'))?.default || {};
          const formItemId = createId(item.type);
          // getComponent 返回的组件配置对象是冻结的，直接赋值会抛出 TypeError
          // 使用 cloneDeep 深拷贝后再修改，避免污染原始配置
          if(formItemConfig?.props?.formItem?.name){
                formItemConfig = cloneDeep(formItemConfig);
                formItemConfig.props.formItem.name = formItemId;
          }
          const {
            config: containerConfig,
            events: containerEvents,
            methods: containerMethods = [],
          } = (await getComponent(containerType + 'Config'))?.default || {};
          const containerId = createId(containerType);
          const containerName = containerType === 'SearchForm' ? '行内表单' : containerType === 'GridForm' ? '网格表单' : '表单容器';
          const childElement =
            formItemElements.map(async (child: IDragTarget & { id: string }) => {
              const { config, events, methods = [] }: any = (await getComponent(child.type + 'Config'))?.default || {};
              return {
                id: child.id || createId(child.type),
                name: child.name,
                type: child.type,
                parentId: formItemId,
                config,
                events,
                methods,
              };
            }) || [];
          Promise.all(childElement).then((res) => {
            addElement({
              type: containerType,
              name: containerName,
              id: containerId,
              config: containerConfig,
              events: containerEvents,
              methods: containerMethods,
              elements: [
                {
                  id: formItemId,
                  parentId: containerId,
                  type: item.type,
                  name: item.name,
                  config: formItemConfig,
                  events: formItemEvents,
                  methods: formItemMethods,
                  elements: res,
                },
              ],
            });
          });
        },
        [addElement],
    );

    // 将元素组件放到画布中
    const addChild = (item: IDragTarget, config: any, events: any, methods: any, elements: any, newId: string) => {
        if (!checkComponentType(item.type, selectedElement?.id, selectedElement?.type, elementsMap)) {
            setPendingItem({ ...item });
            setModalOpen(true);
            // message.info('请把表单项放在表单容器内1');
            return;
        }
        const childElement =
            elements.map(async (child: IDragTarget & { id: string }) => {
                const { config, events, methods = [] }: any = (await getComponent(child.type + 'Config'))?.default || {};
                return {
                    id: child.id || createId(child.type),
                    name: child.name,
                    type: child.type,
                    parentId: newId,
                    config,
                    events,
                    methods,
                };
            }) || [];
        Promise.all(childElement).then((res) => {
            if (selectedElement) {
                addChildElements({
                    type: item.type,
                    name: item.name,
                    elements: res,
                    parentId: selectedElement.id,
                    id: newId,
                    config,
                    events,
                    methods,
                });
            } else {
                addElement({
                    type: item.type,
                    name: item.name,
                    id: newId,
                    elements: res,
                    config,
                    events,
                    methods,
                });
            }
        });
    };

    const handleModalOk = (containerType: string) => {
        if (pendingItem) {
            handleAddToContainer(containerType, pendingItem);
        }
        setModalOpen(false);
        setPendingItem(null);
    };

    const handleModalCancel = () => {
        setModalOpen(false);
        setPendingItem(null);
    };

    return (
        <>
            <Tooltip
                title={props.description}
                overlayClassName={styles.customLightTooltip}
                overlayStyle={{ maxWidth: 300 }}
            >
                <div
                    className={props.type == 'businessComponent' ? styles.bcItemContainer : styles.itemContainer}
                    ref={drag}
                    onClick={() => handleClick(props)}
                    style={{ cursor: 'pointer' }}
                >
                    {props.type != 'businessComponent' && (
                        <React.Suspense fallback={<span />}>
                            <div className={styles.iconContainer}>
                                {typeof props.icon === 'string' ? <img src={props.icon} alt={props.name} /> : props.icon}
                            </div>
                        </React.Suspense>
                    )}
                    <div className={styles.itemName}>{props.name}</div>
                </div>
            </Tooltip>
            <FormItemModal open={modalOpen} elementName={pendingItem?.name || ''} onOk={handleModalOk} onCancel={handleModalCancel} />
        </>

    );
};

export default DragMenuItem;
