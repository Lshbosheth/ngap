import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Select, Input, Modal, TreeSelect } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { debounce } from 'lodash';
import type { RadioChangeEvent } from 'antd';
import { DeleteOutlined, BranchesOutlined, DownOutlined } from '@ant-design/icons';
import type { OutParamItem, BranchConfigItem, ConfigData } from './types.ts';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import ConditionDialog from '../ConditionDialog';
import CondtionalInterface from '../CondtionalInterface';
import request from '@/utils/request';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import VariableBind from '../../../../../../components/VariableBind/VariableBind.tsx';
import VsEditor from '../../../../../../components/VsEditor';

import './index.less';
import { isDraft, produce } from 'immer';
import { cloneDeep } from 'lodash-es';

type Props = {
  	index: number;
  	branchType: string;
  	outParamsList: OutParamItem[];
  	branchModalData?: any;
  	defaultConfig: BranchConfigItem;
  	onConfigChange: (index: number, config: BranchConfigItem) => void;
  	onDelete: (index: number) => void;
  	nodeId?: string | number;
  }
  // 分支配置项组件
  const BranchConfigItem = React.memo<Props>(({
  	index, branchType, outParamsList, defaultConfig, onConfigChange, onDelete, branchModalData, nodeId
  }) => {
	interface NewListItem {
		value: string;
		name: string;
	}
	
	const [config, setConfig] = useState<BranchConfigItem>({
		optionsName: defaultConfig.optionsName || '', //分支名称
		rule: defaultConfig.rule || '&', //默认全部
		operationRes: defaultConfig.operationRes || '', //展示结果
		status: defaultConfig.status || '1', //分支状态 默认正常
		conditionList: defaultConfig.conditionList || [], //条件关系
	});
	
	// 监听 defaultConfig 变化，同步更新 config
	useEffect(() => {
		setConfig({
			optionsName: defaultConfig.optionsName || '',
			rule: defaultConfig.rule || '&',
			operationRes: defaultConfig.operationRes || '',
			status: defaultConfig.status || '1',
			conditionList: defaultConfig.conditionList || [],
		});
	}, [defaultConfig]);
	
	const relationData = [
		{ name: '==', value: '==' },
		{ name: '!=', value: '!=' },
		{ name: '>', value: 'greater' },
		{ name: '<', value: '<' },
		{ name: '>=', value: 'equalOrGreater' },
		{ name: '<=', value: '<=' },
		{ name: '包含', value: 'contains' },
		{ name: '不包含', value: 'notContains' },
	];
	
	// 控制弹窗显示状态
	const [createDirectlyModalVisible, setCreateDirectlyModalVisible] = useState(false);
	
	const [formAtomList, setformAtomList] = useState<any[]>([]);
	
	useEffect(() => {
		//点击页面元素节点 获取元素的form表单元素
		const FilterType = ['Select', 'Radio']
		const newList: NewListItem[] = [];
		for (let key in branchModalData?.componentData?.elementsMap) {
			if (FilterType.includes(branchModalData?.componentData?.elementsMap?.[key]?.type)) {
				newList.push({
					value: key,
					name: branchModalData.componentData.elementsMap[key].id,
				})
			}
		}
		setformAtomList(newList)
	}, [branchModalData.componentData.elementsMap]);
	
	// 打开弹窗
	const handlCreateDirectlyModal = () => {
		if (!branchType) {
			message.error('请选择分支类型');
			return;
		}
		//人工
		if (branchType === 'MT' && formAtomList.length == 0) {
			message.error('该业务组件无组件元素');
			return;
		} else if (branchType === 'AT' && outParamsList.length == 0) {
			//自动
			message.error('该接口无出参内容');
			return;
		}
		setCreateDirectlyModalVisible(true);
	};
	
	// 关闭弹窗  获取绑定页面元素操作结果的数据
	const handleCloseCreateDirectlyModal = (option: any) => {
		setCreateDirectlyModalVisible(false);
		setConfig({ ...config, ...option });
		// 配置变更时通知父组件
		onConfigChange(index, { ...config, ...option });
	};
	
	// 处理选项名称变更
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setConfig({ ...config, optionsName: e.target.value });
		// 配置变更时通知父组件
		onConfigChange(index, { ...config, optionsName: e.target.value });
	};
	
	//点击分支 关系
	const handleContact = () => {
		handlCreateDirectlyModal();
	};
	
	//根据value翻译name
	const translate = (aaValue: string | undefined, paramsList: any[]) => {
		if (!aaValue) return '未选择'; // 未选中时的兜底
		const matchItem = paramsList.find((item) => item.value === aaValue);
		return matchItem ? matchItem.name : '未知'; // 匹配不到时的兜底
	};
	
	return (
		<div>
			<span>分支 {index + 1}*</span>
			<Input
				value={defaultConfig.optionsName}
				onChange={handleNameChange}
				placeholder="请输入"
				suffix={<BranchesOutlined onClick={handleContact} />}
				style={{ padding: 4, margin: 15, width: '60%' }}
			/>
			<DeleteOutlined onClick={() => onDelete(index)} className="DeleteOutlined" />
			<div className="labelTaxt">{defaultConfig.rule == "&" ? "满足以下全部条件时：" : "满足以下任一条件时："}</div>
			<div className="labelTaxt">
				{defaultConfig.conditionList && defaultConfig.conditionList.length === 0 ? (
					<div></div>
				) : (
					defaultConfig.conditionList &&
					defaultConfig.conditionList.map((item) => {
						// 拼接展示文本：未选中时提示“未选择”，选中时展示「名称 + 是的 + 选中值」
						return (
							<div key={item.id} style={{ marginBottom: 6 }}>
								{branchType === 'AT' ? translate(item.filedKey, outParamsList) : item.atomId}
								{translate(item.relation, relationData)}
								{item.value}
							</div>
						);
					})
				)}
			</div>
			<div className="labelTaxt">流程将继续按照当前分支执行。</div>
			{/* 弹窗组件 */}
			<Modal
				// className={styles.addTempModal}
				className="custom-modal-wrap"
				mask={false}
				closable={false} // 隐藏默认关闭按钮
				open={createDirectlyModalVisible}
				maskClosable={false} // 设置为false，点击遮罩不关闭
				footer={null} // 移除默认底部按钮
				width={500}
				destroyOnClose // 关闭时销毁子元素
			>
				<ConditionDialog
					editData={defaultConfig}
					closeDiaolg={handleCloseCreateDirectlyModal}
					branchType={branchType}
					formAtomList={formAtomList}
					outParamsList={outParamsList}
				/>
			</Modal>
		</div>
	);
}, (prevProps, nextProps) => {
	return JSON.stringify(prevProps) == JSON.stringify(nextProps)
})

interface SearchFormProps {
	handleCloseBrachConfig: () => void;
	branchModalData: any;
	deleteBranch: (nodeId: string) => void;
	deleteOriginalLine: (nodeId: string) => void;
}
// 主组件
const ConditionalBranchConfig = React.memo<SearchFormProps>(({
	handleCloseBrachConfig, branchModalData, deleteBranch, deleteOriginalLine
}) => {
	const [targetNodeId, setTargetNodeId] = useState(branchModalData.nodeId)
	const { pageStore } = useAppContext();
	const setBranchComponentsData = pageStore(useShallow((state: any) => state.setBranchComponentsData));
	const branchComponentsData = pageStore(useShallow((state: any) => state.page?.branchComponentsData));
	const [branchName, setBranchName] = useState(branchComponentsData?.[targetNodeId]?.branchName);
	// 核心状态管理
	const [configData, setConfigData] = useState<ConfigData>(branchName ?? {
		branchType: 'MT',
		interfaceId: '',
		optionsList: [],
	});
	const [optionOutParamsList, setOptionOutParamsList] = useState<any[]>([]);
	const branchConfigList = useRef<Array<React.ReactElement>>([]);
	// 获取用户信息
	const userInfo = crossApiUserInfo((state) => state.userInfo);

	useEffect(() => {
		//点击页面元素节点 分支根据节点进行展示
		setTargetNodeId(branchModalData.nodeId);
		let _branchName = branchComponentsData?.[branchModalData.nodeId]?.branchName;
		if(JSON.stringify(_branchName) != JSON.stringify(branchName)){
			setBranchName(_branchName)
			const targetData = _branchName ?? {
				branchType: 'MT',
				interfaceId: '',
				optionsList: [],
			};
			setConfigData(targetData);
		}
	}, [branchModalData.nodeId]);
	
	const getFullSnapshotData = useCallback(() => {
		const state = pageStore.getState();
		const nodeMap = state._lastUndoSnapshot?.nodeMap || state.page?.componentsData;
		const lineArr = state._lastUndoSnapshot?.lineArr || [];
		const snapshotData = {
			nodeMap: cloneDeep(nodeMap),
			lineArr: lineArr.map((line: any) => ({
				lineId: line.lineId,
				startNodeId: line.startNodeId,
				endNodeId: line.endNodeId,
				startNodeOptionIndex: line.startNodeOptionIndex,
			})),
			branchData: cloneDeep(state.page?.branchComponentsData),
			componentList: cloneDeep(state.page?.componentList),
			processData: cloneDeep(state.processData?.nodeData),
		};
		return snapshotData;
	}, []);

	// 分支类型变更处理
	const handleBranchTypeChange = useCallback(
		(e: RadioChangeEvent) => {
			const newBranchType = e.target.value;
			const oldBranchType = configData.branchType;
			const newConfigData = {
				...configData,
				branchType: newBranchType,
			};
			setConfigData(newConfigData);
			// 同步更新store中的branchComponentsData
			const newData = {
				[targetNodeId]: {
					"branchName": newConfigData
				}
			};
			setBranchComponentsData(newData);
			pageStore.getState().pushProcessHistory({
				type: 'UPDATE_BRANCH_TYPE',
				nodeId: targetNodeId,
				data: getFullSnapshotData(),
				description: `更新分支类型: ${oldBranchType} -> ${newBranchType}`,
			});
		},
		[configData, targetNodeId, setBranchComponentsData, getFullSnapshotData],
	);
	
	const [modalVisible, setModalVisible] = useState(false); // 弹窗显隐
	const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined); // Select选中值
	
	// 1. Select点击事件：打开弹窗
	const handleSelectClick = () => {
		setModalVisible(true);
	};
	
	// 3. 弹窗取消按钮
	const handleModalCancel = () => {
		setModalVisible(false);
	};
	
	useEffect(() => {
		if (branchModalData?.componentData?.branchName?.interfaceId) {
			handGetInterfaaceValue({
				value: branchModalData?.componentData?.branchName?.interfaceId,
				title: branchModalData?.componentData?.branchName?.interfaceName
			})
		}
	}, [])
	
	//获取接口弹窗的数据
	const handGetInterfaaceValue = (options: any) => {
		console.log('接口弹窗', options);
		const oldInterfaceId = configData.interfaceId;
		setSelectedValue(options.value);
		const newConfigData = {
			...configData,
			interfaceId: options.value,
			interfaceName: options.title,
		};
		setConfigData(newConfigData);
		// 同步更新store中的branchComponentsData
		const newData = {
			[targetNodeId]: {
				"branchName": newConfigData
			}
		};
		setBranchComponentsData(newData);

		pageStore.getState().pushProcessHistory({
			type: 'UPDATE_BRANCH_INTERFACE',
			nodeId: targetNodeId,
			data: getFullSnapshotData(),
			description: `更新分支接口: ${oldInterfaceId || '无'} -> ${options.title || options.value}`,
		});
	
		//获取接口返回值数据
		const params = {
			provId: userInfo.provinceId,
			interfaceCode: options.value,
			interfaceId: options.value,
		};
		request.post('/csf/appInterface/abilityArrangeDetails', { params: params }).then((result) => {
			if (result.returnCode == '0') {
				const outParameter = result.beans;
				for (let i = 0; i < outParameter.length; i++) {
					outParameter[i].fieldKey = outParameter[i].value;
					outParameter[i].fullParent = outParameter[i].value;
					outParameter[i].fieldName = outParameter[i].name;
				}
	
				setOptionOutParamsList(outParameter);
			}
		});
	
		handleModalCancel();
	};
	
	// 新增分支项
	const handleAddBranch = useCallback(() => {
		deleteOriginalLine(targetNodeId);
		const newIndex = configData.optionsList.length;
		const newConfigData = produce(configData, draft => {
			draft.optionsList.push({});
		});
		setConfigData(newConfigData);
		// 同步更新store中的branchComponentsData
		const newData = {
			[targetNodeId]: {
				"branchName": newConfigData
			}
		};
		setBranchComponentsData(newData);
		pageStore.getState().pushProcessHistory({
			type: 'ADD_BRANCH',
			nodeId: targetNodeId,
			data: getFullSnapshotData(),
			description: `新增分支: 分支${newIndex + 1}`,
		});
	}, [targetNodeId, configData, setBranchComponentsData, getFullSnapshotData]);

	// 删除分支项
	const handleDeleteBranch = useCallback(
		(index: number) => {
			const deletedBranch = configData.optionsList[index];
			deleteBranch(targetNodeId);
			const newConfigData = produce(configData, draft => {
				draft.optionsList.splice(index, 1);
			});
			setConfigData(newConfigData);
			branchConfigList.current.splice(index, 1);
			// 同步更新store中的branchComponentsData
			const newData = {
				[targetNodeId]: {
					"branchName": newConfigData
				}
			};
			setBranchComponentsData(newData);
			pageStore.getState().pushProcessHistory({
				type: 'DELETE_BRANCH',
				nodeId: targetNodeId,
				data: getFullSnapshotData(),
				description: `删除分支: ${deletedBranch?.optionsName || `分支${index + 1}`}`,
			});
		},
		[targetNodeId, configData, setBranchComponentsData, getFullSnapshotData],
	);
	
	//关闭弹窗
	const handleCloseBranch = () => {
		handleCloseBrachConfig();
	};
	
	// 分支配置变更回调
	const handleBranchConfigChange = useCallback(
		(index: number, branchConfig: BranchConfigItem) => {
			const oldConfig = configData.optionsList[index];
			const newConfigData = produce(configData, draft => {
				draft.optionsList[index] = branchConfig;
			});
			setConfigData(newConfigData);
			// 记录条件变更历史
			if (targetNodeId) {
				const oldConditionList = oldConfig?.conditionList || [];
				const newConditionList = branchConfig?.conditionList || [];
				const addedConditions = newConditionList.filter((c: any) => !oldConditionList.some((oc: any) => oc.id === c.id));
				const deletedConditions = oldConditionList.filter((c: any) => !newConditionList.some((nc: any) => nc.id === c.id));
				const modifiedConditions = newConditionList.filter((c: any) => {
					const oldCond = oldConditionList.find((oc: any) => oc.id === c.id);
					if (!oldCond) return false;
					return JSON.stringify(c) !== JSON.stringify(oldCond);
				});
				if (addedConditions.length > 0 || deletedConditions.length > 0 || modifiedConditions.length > 0) {
					// 同步更新store中的branchComponentsData
					const newData = {
						[targetNodeId]: {
							"branchName": newConfigData
						}
					};
					setBranchComponentsData(newData);
					pageStore.getState().pushProcessHistory({
						type: 'UPDATE_BRANCH_CONDITION',
						nodeId: targetNodeId,
						data: getFullSnapshotData(),
						description: `分支${index + 1}修改条件`,
					});
				}
			}
		},
		[configData, targetNodeId, setBranchComponentsData, getFullSnapshotData]
	);
	// 在主组件中添加防抖的更新函数
	const debouncedUpdateStore = useRef(
		debounce((_targetNodeId: string | number, data: any) => {
			const newData = {
				[_targetNodeId]: {
					"branchName": {
						...data,
					}
				}
			}
			if(JSON.stringify(newData[_targetNodeId]) != JSON.stringify(branchComponentsData?.[_targetNodeId])){
				setBranchComponentsData(newData);
			}
		}, 300)
	);
	useEffect(() => {
		debouncedUpdateStore.current(targetNodeId, configData);
		return () => {
			debouncedUpdateStore.current.cancel();
		};
	}, [targetNodeId, JSON.stringify(configData)]);
	/**
     * 把变量转换为树形结构
     * 对象需要递归展开
     * @param items
     * @returns
     */
    const transformToList = useCallback((items: Array<any>) => {
        return items.map((item) => {
            const { name, type, defaultValue } = item;
            const node: any = { name, value: defaultValue, elements: [] };
            if (type === 'array') {
                node.type = 'Variable';
                node.id = item.name;
                node.name = `Array<${item.name}>${item.remark ? '(' + item.remark + ')' : ''}`;
            } else if (type === 'object') {
                node.id = item.name;
                node.name = `${item.name}${item.remark ? '(' + item.remark + ')' : ''}`;
                node.type = 'Variable';
                node.elements = transformToList(
                    Object.entries(defaultValue).map(([key, value]) => {
                        return {
                            type: Array.isArray(value) ? 'array' : typeof value,
                            id: item.name + '.' + key,
                            name: item.name + '.' + key,
                            defaultValue: value,
                        };
                    }),
                );
            } else {
                node.type = 'Variable';
                node.id = item.name;
                node.name = `${item.name}${item.remark ? '(' + item.remark + ')' : ''}`;
            }
            return node;
        });
    }, [])
	let treeData: any = transformToList(branchModalData?.componentData?.variables || {});
	useEffect(() => {
		treeData = transformToList(branchModalData?.componentData?.variables || {});
	}, [JSON.stringify(branchModalData.componentData.variables)])
	const handleSelect = useCallback((value: any, variable: any) => {
		setConfigData((prev) => ({
			...prev,
			interfaceId: value,
			interfaceName: value.value
		}))
	}, [])
	return (
		<div className="conditionalBranchConfig">
			<div className='brachTitle'>
				<span className='brachTitleCont'>条件分支属性设置</span>
				<img className="closeConditionalBtn" src={new URL(`../../imgs/openPageBtn.png`, import.meta.url).href} onClick={handleCloseBranch} />
			</div>
			<div className="branch-config">
				<div className="atom-config-title">属性设置</div>
				<div className="input-block">
					<div className="input-label">分支类型*</div>
					<div className="input-div branchType">
						<Radio.Group
							value={configData.branchType}
							onChange={handleBranchTypeChange}
							style={{ marginRight: 16 }}
						>
							<Radio value="MT">人工</Radio>
							<Radio value="AT">自动</Radio>
							<Radio value="VA">变量</Radio>
						</Radio.Group>
					</div>
				</div>
				{/* 接口配置区块（自动分支时显示） */}
				{configData.branchType === 'AT' && (
					<div className="interfaceConfigBlock">
						<span>判断接口</span>
						<Select
							placeholder="请选择接口"
							style={{ width: '60%', margin: 15 }}
							value={configData.interfaceName}
							onClick={handleSelectClick}
						/>
						<Modal
							className="interface-modal-wrap"
							title="选择接口"
							mask={false}
							open={modalVisible}
							onCancel={handleModalCancel}
							maskClosable={false} // 设置为false，点击遮罩不关闭
							footer={null} // 移除默认底部按钮
							width={300}
							height={500}
							destroyOnClose // 关闭时销毁子元素
						>
							<CondtionalInterface onGetValue={handGetInterfaaceValue} selectedValue={selectedValue} />
						</Modal>
					</div>
				)}
				{configData.branchType === 'VA' && (
					<div className="interfaceConfigBlock" style={{height: "51px", "marginTop": "10px"}}>
						<span>判断变量</span>
						{/* <TreeSelect
							style={{width: "calc(100% - 80px)", "marginLeft": "10px"}}
							allowClear
							value={configData.interfaceId}
							placeholder="请选择变量"
							fieldNames={{ label: "name", value: "id", children: "elements" }}
							treeData={treeData}
							onSelect={handleSelect} /> */}
						<div className='selectVariable'>
							<VariableBind readOnly placeholder="" dataType="variable" dataSource={branchModalData?.componentData?.variables} onChange={handleSelect} value={configData.interfaceId} />
						</div>
					</div>
				)}
				<div className={"branch-cont " + ((configData.branchType === 'AT' || configData.branchType === 'VA') ? "branch-cont-at" : "")}>
					{(configData.optionsList || []).map((item, index) => (
						<BranchConfigItem
							key={`branch-${index}`}
							index={index}
							branchType={configData.branchType}
							branchModalData={branchModalData}
							outParamsList={optionOutParamsList}
							defaultConfig={item}
							onConfigChange={handleBranchConfigChange}
							onDelete={handleDeleteBranch}
							nodeId={targetNodeId}
						/>
					))}
				</div>
				<div className="add-branch">
					<div className="add-branch-btn" onClick={handleAddBranch}>+添加分支</div>
				</div>
			</div>
		</div>
	);
}, (prevProps, nextProps) => {
	return JSON.stringify(prevProps) == JSON.stringify(nextProps)
})

// 导出组件及方法
export default ConditionalBranchConfig;
