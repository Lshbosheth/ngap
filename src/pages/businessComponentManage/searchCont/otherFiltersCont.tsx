import React, { Component } from 'react';
import { Select, Input, TreeSelect } from 'antd';
import { OtherFormData } from '../businessComponentMangeTypes';
import { publictData } from '../../../utils/appMenuData';
import request from '../../../utils/request';
import '../index.less';

interface IProps {
    onQuery: (data: OtherFormData) => void;
    onReset: (data: OtherFormData) => void;
    provinceId?: string;
}
interface IStates {
    otherFormData: OtherFormData;
    treeData: TreeNode[];
    loadingKeys: string[];
    expandedKeys: string[]; // 展开的节点keys
}

// 创建部门树形节点结构
interface TreeNode {
    value: string;
    label: string;
    children?: TreeNode[];
    isLeaf?: boolean;
}
export default class OtherFiltersCont extends Component<IProps, IStates> {
    state: IStates = {
        otherFormData: {
            componentName: '',
            componentDesc: '',
            belongModule: '',
            serviceLink: '',
            componentLevel: '',
            createStaffName: '', // 创建人姓名
            createOrgaId: '', // 创建部门
        },
        treeData: [], // 创建部门树形数据
        loadingKeys: [], // 创建部门加载中的key
        expandedKeys: [], // 展开的节点keys
    };
    debounceOrgaSearch: (value: string) => void;
    constructor(props: IProps) {
        super(props);
        this.handleQueryClick = this.handleQueryClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.debounceOrgaSearch = this.debounce(this.onOrgaSearch, 300);
    }

    // 创建部门搜索防抖
    debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout | null = null;
        return (value: string) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => func(value), wait);
        };
    };

    // 输入框修改
    componentNameChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        this.changeStateFn(name, value);
    };
    componentDescChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        this.changeStateFn(name, value);
    };

    // 归属模块切换
    belongModuleChange = (value: string | number | string[] | number[]) => {
        this.changeStateFn('belongModule', value);
    };

    // 服务环节切换
    serviceLinkChange = (value: string | number | string[] | number[]) => {
        this.changeStateFn('serviceLink', value);
    };

    // 适用范围切换
    componentLevelChange = (value: string | number | string[] | number[]) => {
        this.changeStateFn('componentLevel', value);
    };

    // 创建人姓名修改
    staffNameChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        this.changeStateFn(name, value);
    };

    // 创建部门切换
    orgaIdChange = (value: string) => {
        this.changeStateFn('createOrgaId', value);
    };

    // 创建部门懒加载 - 点击展开箭头时调用接口获取子部门
    loadOrgaData = async (node: any) => {
        const { provinceId } = this.props;
        this.setState({ loadingKeys: [node.value] });
        try {
            const result = await request.post('/csf/call/getDeptByDeptId', { params: { provId: provinceId, orgaId: node.value } });
            const children = (result.beans || []).map((item: any) => ({
                value: item.value,
                label: item.name,
                isLeaf: item.isParent !== 'true',
            }));
            this.setState((prevState) => {
                const updateTreeData = (nodes: TreeNode[]): TreeNode[] => {
                    return nodes.map((n) => {
                        if (n.value === node.value) {
                            return { ...n, children };
                        }
                        if (n.children) {
                            return { ...n, children: updateTreeData(n.children) };
                        }
                        return n;
                    });
                };
                return {
                    treeData: updateTreeData(prevState.treeData),
                    loadingKeys: [],
                };
            });
        } catch (error) {
            console.error('加载组织失败', error);
            this.setState({ loadingKeys: [] });
        }
    };

    // 创建部门搜索 - 根据输入内容搜索部门
    onOrgaSearch = async (value: string) => {
        if (!value) {
            this.fetchOrgaTree();
            return;
        }
        const { provinceId } = this.props;
        this.setState({ loadingKeys: ['search'] });
        try {
            const result = await request.post('/csf/call/getDeptByDeptId', { params: { provId: provinceId, orgaId: provinceId, param: value } });
            const convertToTreeData = (nodes: any[]): TreeNode[] => {
                return nodes.map((node) => ({
                    value: node.value,
                    label: node.name,
                    isLeaf: false, // 搜索结果默认可展开
                    children: node.children ? convertToTreeData(node.children) : [],
                }));
            };
            const searchResults = convertToTreeData(result.beans || []);
            // 搜索结果自动展开所有节点
            const allKeys = this.getAllNodeKeys(searchResults);
            this.setState({
                treeData: searchResults,
                loadingKeys: [],
                expandedKeys: allKeys,
            });
        } catch (error) {
            console.error('搜索组织失败', error);
            this.setState({ loadingKeys: [] });
        }
    };

    // 递归获取所有节点key
    getAllNodeKeys = (nodes: TreeNode[]): string[] => {
        const keys: string[] = [];
        const traverse = (nodeList: TreeNode[]) => {
            nodeList.forEach((node) => {
                keys.push(node.value);
                if (node.children && node.children.length > 0) {
                    traverse(node.children);
                }
            });
        };
        traverse(nodes);
        return keys;
    };

    componentDidMount() {
        this.fetchOrgaTree();
    }

    fetchOrgaTree = async () => {
        const { provinceId } = this.props;
        const provinceName = provinceId ? publictData.provId2provName[provinceId] : '';
        const rootLabel = provinceName ? `${provinceName}分公司` : '公司';
        const treeData: TreeNode[] = [
            {
                value: provinceId || '',
                label: rootLabel,
                isLeaf: false,
            },
        ];
        this.setState({ treeData, expandedKeys: [] });
    };

    // 表单数据修改
    changeStateFn = (key: string, value: string | number | string[] | number[]) => {
        this.setState(
            (prevState: { otherFormData: OtherFormData }) => ({
                otherFormData: {
                    ...prevState.otherFormData,
                    [key]: value,
                },
            }),
            () => {
                // this.props.onQuery(this.state.otherFormData);
            },
        );
    };

    // 查询事件
    handleQueryClick = () => {
        this.props.onQuery(this.state.otherFormData);
    };

    // 重置事件 - 清空创建人姓名和创建部门
    handleResetClick = () => {
        this.setState(
            {
                otherFormData: {
                    componentName: '',
                    componentDesc: '',
                    belongModule: '',
                    serviceLink: '',
                    componentLevel: '',
                    createStaffName: '',
                    createOrgaId: '',
                },
                expandedKeys: [],
            },
            () => {
                // this.props.onQuery();
                this.props.onReset(this.state.otherFormData);
            },
        );
    };

    public render() {
        const { otherFormData, treeData, loadingKeys, expandedKeys } = this.state;
        const { appBelongModuleArr, appServiceLinkArr, appPlatLevelArr } = publictData;
        return (
            <div className="otherFiltersCont searchItem">
                <div className="searchTitle"> 其他筛选：</div>
                <div className="searchContent otherSearchModule">
                    <div className="configItem">
                        <label>业务组件名称:</label>
                        <div className="inputItem ">
                            <Input
                                name="componentName"
                                value={otherFormData.componentName}
                                placeholder="请输入"
                                onChange={this.componentNameChange}
                            />
                        </div>
                    </div>
                    <div className="configItem">
                        <label>业务组件描述:</label>
                        <div className="inputItem ">
                            <Input
                                name="componentDesc"
                                value={otherFormData.componentDesc}
                                placeholder="请输入"
                                onChange={this.componentDescChange}
                            />
                        </div>
                    </div>
                    {/* <div className="configItem">
                        <label>归属模块:</label>
                        <div className="inputItem belongModule">
                            <Select
                                placeholder="请选择"
                                value={otherFormData.belongModule}
                                options={appBelongModuleArr}
                                onChange={this.belongModuleChange}
                            ></Select>
                        </div>
                    </div> */}
                    {/* <div className="configItem serviceLinkSelectCont">
                        <label>服务环节:</label>
                        <div className="inputItem serviceLinkSelect">
                            <Select
                                value={otherFormData.serviceLink}
                                placeholder="请选择"
                                options={[
                                    {
                                        label: '请选择',
                                        value: '',
                                        id: '',
                                    },
                                ].concat(appServiceLinkArr)}
                                onChange={this.serviceLinkChange}
                            ></Select>
                        </div>
                    </div> */}
                    <div className="configItem">
                        <label>适用范围:</label>
                        <div className="inputItem componentLevelSelect">
                            <Select
                                value={otherFormData.componentLevel}
                                placeholder="请选择"
                                className={otherFormData.componentLevel?"":"selectColor"}
                                options={[
                                    {
                                        label: '请选择',
                                        value: '',
                                        id: '',
                                    },
                                ].concat(appPlatLevelArr)}
                                onChange={this.componentLevelChange}
                            ></Select>
                        </div>
                    </div>
                    {
                        this.props.provinceId !== '0000' ? (<>
                            <div className="configItem">
                                <label>创建人姓名:</label>
                                <div className="inputItem">
                                    <Input
                                        name="createStaffName"
                                        value={otherFormData.createStaffName}
                                        placeholder="请输入"
                                        onChange={this.staffNameChange}
                                    />
                                </div>
                            </div>
                            <div className="configItem">
                                <label>创建部门:</label>
                                <div className="inputItem">
                                    {/*
                                        TreeSelect 属性说明：
                                        - loadData: 懒加载子部门，点击展开箭头时触发
                                        - onSearch + debounceOrgaSearch: 防抖搜索，输入内容后300ms调用接口搜索
                                        - showSearch: 显示搜索框
                                        - treeNodeFilterProp: 搜索匹配字段
                                        - treeExpandedKeys + onTreeExpand: 控制节点展开状态，搜索时自动展开
                                    */}
                                    <TreeSelect
                                        value={otherFormData.createOrgaId}
                                        placeholder="请选择"
                                        treeData={treeData}
                                        onChange={this.orgaIdChange}
                                        loadData={this.loadOrgaData}
                                        onSearch={this.debounceOrgaSearch}
                                        showSearch
                                        allowClear
                                        loading={loadingKeys.includes('search')}
                                        treeNodeFilterProp="label"
                                        treeExpandedKeys={expandedKeys}
                                        onTreeExpand={(keys: any) => this.setState({ expandedKeys: keys })}
                                    />
                                </div>
                            </div>

                        </>) : (<>
                            <div className="configItem"></div>
                            <div className="configItem"></div>
                        </>)
                    }

                    <div style={{width: '27.4%'}} className="configItem configBtn">
                        <div className="searchReset" onClick={this.handleResetClick}>
                            重置
                        </div>
                        <div className="searchQuery" onClick={this.handleQueryClick}>
                            查询
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
