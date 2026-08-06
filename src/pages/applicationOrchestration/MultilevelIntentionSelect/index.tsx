import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Modal, Input, Tree, Button, message, Spin } from 'antd';
import request from '@/utils/request';
import styles from './index.module.less';

export interface TreeNode {
	id: string;
	pId: string;
	name: string;
	value?: string;
	isLeaf?: boolean;
	isParent?: boolean;
	children?: TreeNode[];
}

export interface MultilevelIntentionSelectDialogProps {
	visible: boolean;
	onClose: () => void;
	onSelect: (node: TreeNode | null) => void;
	provinceId: string;
	defaultSelectedId?: string;
}

const buildTree = (beans: any[]): { tree: TreeNode[]; nodeMap: Map<string, TreeNode>; allKeys: string[] } => {
	const result: TreeNode[] = [];
	const nodeMap = new Map<string, TreeNode>();

	beans.forEach((item) => {
		nodeMap.set(item.id, {
			id: item.id,
			pId: item.pId,
			name: item.name,
			value: item.value,
			// isLeaf: item.isLeaf === '1',   //  不能要，会影响tree组件的展示；leaf为1但其实还有子节点
			isParent: item.isLeaf === '0',
		});
	});

	const getChildren = (pId: string): TreeNode[] => {
		const children: TreeNode[] = [];
		beans.forEach((item) => {
			if (item.pId === pId) {
				const node = nodeMap.get(item.id);
				if (node) {
					node.children = getChildren(node.id);
					children.push(node);
				}
			}
		});
		return children;
	};

	beans.forEach((item) => {
		if (item.pId === '0' || item.pId === null) {
			const node = nodeMap.get(item.id);
			if (node) {
				node.children = getChildren(node.id);
				result.push(node);
			}
		} else if (item.pId && !nodeMap.has(item.pId)) {
			const node = nodeMap.get(item.id);
			if (node) {
				node.children = getChildren(node.id);
				result.push(node);
			}
		}
	});

	return { tree: result, nodeMap, allKeys: Array.from(nodeMap.keys()) };
};

const getAllKeys = (data: TreeNode[]): string[] => {
	const keys: string[] = [];
	const stack = [...data];
	while (stack.length > 0) {
		const node = stack.pop()!;
		keys.push(node.id);
		if (node.children?.length) {
			stack.push(...node.children);
		}
	}
	return keys;
};

const filterNodes = (nodes: TreeNode[], keyword: string): TreeNode[] => {
	const result: TreeNode[] = [];

	nodes.forEach((node) => {
		const matchName = node.name.toLowerCase().includes(keyword.toLowerCase());
		const childMatches = node.children ? filterNodes(node.children, keyword) : [];

		if (matchName || childMatches.length > 0) {
			result.push({
				...node,
				children: childMatches.length > 0 ? childMatches : node.children,
			});
		}
	});

	return result;
};

const MultilevelIntentionSelectDialog: React.FC<MultilevelIntentionSelectDialogProps> = ({
	visible,
	onClose,
	onSelect,
	provinceId,
	defaultSelectedId,
}) => {
	const [treeData, setTreeData] = useState<TreeNode[]>([]);
	const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
	const [searchText, setSearchText] = useState('');
	const [filteredData, setFilteredData] = useState<TreeNode[]>([]);
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
	const treeDataRef = useRef<TreeNode[]>([]);

	useEffect(() => {
		if (visible) {
			setLoading(true);
			const fetchTreeData = async () => {
				try {
					const res = await request.post('/app/queryToolBelongTypeSelectList', {
						params: {
							provId: provinceId,
							belongType: '3',
						},
					});

					const { tree, nodeMap, allKeys } = buildTree(res.beans || []);
					treeDataRef.current = tree;
					setTreeData(tree);
					setExpandedKeys(allKeys);

					if (defaultSelectedId) {
						const targetNode = nodeMap.get(defaultSelectedId);
						if (targetNode && !targetNode.isParent) {
							setSelectedNode(targetNode);
						}
					}
				} catch (error) {
					message.error('获取意图列表失败');
				} finally {
					setLoading(false);
				}
			};
			fetchTreeData();
		}
	}, [visible, provinceId]);

	const handleTreeSelect = useCallback((selectedKeys: React.Key[], info: any) => {
		if (info.node.isParent) {
			message.error('请选择3级及以后的意图！');
			setTimeout(() => setSelectedNode(null), 100);
			return;
		}
		setSelectedNode(selectedKeys.length > 0 ? info.node : null);
	}, []);

	const handleSearch = useCallback((value: string) => {
		setSearchText(value);

		if (searchTimerRef.current) {
			clearTimeout(searchTimerRef.current);
		}

		searchTimerRef.current = setTimeout(() => {
			if (!value.trim()) {
				setFilteredData([]);
				setExpandedKeys(getAllKeys(treeDataRef.current));
				return;
			}

			const filtered = filterNodes(treeDataRef.current, value);
			setFilteredData(filtered);
			setExpandedKeys(getAllKeys(filtered));
		}, 300);
	}, []);

	const handleOk = useCallback(() => {
		onSelect(selectedNode);
		handleClose();
	}, [selectedNode, onSelect]);

	const handleClose = useCallback(() => {
		setSelectedNode(null);
		setSearchText('');
		setFilteredData([]);
		onClose();
	}, [onClose]);

	const handleExpand = useCallback((keys: React.Key[]) => {
		setExpandedKeys(keys as string[]);
	}, []);

	const displayData = useMemo(
		() => (filteredData.length > 0 ? filteredData : treeData),
		[filteredData, treeData]
	);

	return (
		<Modal
			title="意图选择"
			open={visible}
			onCancel={handleClose}
			width={450}
			className={styles.intentionSelectDialog}
			footer={[
				<Button key="ok" type="primary" onClick={handleOk}>
					确定
				</Button>,
				<Button key="cancel" onClick={handleClose}>
					取消
				</Button>,
			]}
			destroyOnClose
			maskClosable={false}
		>
			<div className={styles.intentionSelectContent}>
				<div className={styles.inputSearchBoxes}>
					<Input.Search
						placeholder="输入关键字"
						value={searchText}
						onChange={(e) => handleSearch(e.target.value)}
						className={styles.searchInput}
						allowClear
					/>
				</div>
				<div className={styles.treeContainer}>
					{loading ? (
						<div style={{ textAlign: 'center', padding: 40 }}>
							<Spin size="large" />
						</div>
					) : (
						<Tree
							showIcon={false}
							showLine={false}
							selectedKeys={selectedNode ? [selectedNode.id] : []}
							expandedKeys={expandedKeys}
							onSelect={handleTreeSelect}
							treeData={displayData}
							blockNode
							fieldNames={{ title: 'name', key: 'id', children: 'children' }}
							onExpand={handleExpand}
						/>
					)}
				</div>
			</div>
		</Modal>
	);
};

export default MultilevelIntentionSelectDialog;
