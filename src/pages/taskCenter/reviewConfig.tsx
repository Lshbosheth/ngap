import { forwardRef, useImperativeHandle, useEffect, useState, useRef } from 'react';
import { Button, Input, Drawer, Flex, Radio, Tree, Steps, Select, TreeSelect, App } from 'antd';
import { CheckCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import request from '../../utils/request';
import styles from './index.module.less';
import tipIcon from './assets/tip.png';
import closeIcon from './assets/close.png';
import { crossApiUserInfo } from '../../stores/crossapiStore';
import {appReviewProcessArr, tempReviewProcessArr, compReviewProcessArr, eleReviewProcessArr, treeDataBase, type ReviewProcess, type ReviewProcessChild} from './reviewConfigCon'
const { TextArea } = Input;

let treeDataAll: any[] = [];  //  配置范围树 全量数据
let usedList: any[] = [];    //  配置范围树 已配置的 全量数据
let staffData: any[] = [];    // 当前选中配置树节点 对应的项目成员树  全量数据
let selectedNode: {rangeType?: string, id?: string, staffId?: string} = {};   // 当前选中配置树节点 为了保存配置时传参用

function reviewConfigDrawer(_: any, ref: any){
    const { message } = App.useApp();
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    let isAdmin: string = userInfo.isAdmin || '0';
    
    // 使用 useRef 存储 Map 引用，组件销毁时自动清空
    const nodeMapRef = useRef<Map<any, any>>(new Map());
    
    // 组件卸载时清理 Map
    useEffect(() => {
        return () => {
            nodeMapRef.current.clear();
        };
    }, []);
    const [reviewConfirmLoading, setReviewConfirmLoading] = useState(false);  // 审核人员抽屉显隐
    const [drawerOpen, setDrawerOpen] = useState(false);  // 审核人员抽屉显隐
    const [tipClose, setTipClose] = useState(false);  // 审核人员抽屉最上面的提示显隐
    useImperativeHandle(ref, () => {
        return {
            open() {
                tipClose && setTipClose(false);
                setDrawerOpen(true);
            },
        };
    });
    // 右侧配置重置
    const resetData = ()=>{
        setAppReviewProcess(()=>{
            return JSON.parse(JSON.stringify(appReviewProcessArr))
        })
        setTempReviewProcess(()=>{
            return JSON.parse(JSON.stringify(tempReviewProcessArr))
        })
        setCompReviewProcess(()=>{
            return JSON.parse(JSON.stringify(compReviewProcessArr))
        })
        setEleReviewProcess(()=>{
            return JSON.parse(JSON.stringify(eleReviewProcessArr))
        })
    };
    const [contType, setContType] = useState('app');  // 审核内容类型
    const [treeData, setTreeData] = useState<any[]>([]);  // 配置范围树
    const [expandedKey, setExpandedKey] = useState<any[]>([]);  // 配置范围树展开项
    // 平级数据构建树 有唯一根节点
    const buildTree = (data: any[], usedList?: any[], type?: string)=>{
        // 1. 清空并使用组件内部声明的 Map 用于快速查找节点
        nodeMapRef.current.clear();
        // 2. 初始化所有节点，添加 children 属性
        data.forEach(node => {
            if(usedList){
                nodeMapRef.current.set(node.id, {
                    ...node,
                    children: [],
                    icon: usedList.includes( (type || contType) + '_' + node.rangeType + '_' + node.id ) ? (<CheckCircleFilled style={{ color: '#90C31F'}} />) : '',
                    reviewId: (type || contType) + '_' + node.rangeType + '_' + node.id,
                    selectable: !(node.rangeType === 'all' && isAdmin !== '1'),   // 全网需要isAdmin等于1的才可进行选中
                });
            }else{
                nodeMapRef.current.set(node.id, {
                    ...node,
                    children: [],
                    disabled: !node.rangeType && node.pId === '0'  // 禁用项目成员树的项目 只可选叶子结点
                });
            }
        });
        // 3. 构建树结构
        const tree: any[] = [];
        data.forEach(node => {
            const treeNode = nodeMapRef.current.get(node.id);
            if (node.pId === '0') {
                // 一级节点（根节点）
                tree.push(treeNode);
            } else {
                // 非一级节点，找到父节点并添加
                const parent = nodeMapRef.current.get(node.pId);
                if (parent) {
                    parent.children.push(treeNode);
                }else {
                    tree.push(treeNode); // 多个根节点
                }
            }
        });
        return tree;
    }
    const querytreeData = async () => {  // 配置范围树 全量数据
        try {
            request
                .post('appReview/queryAppReviewTenList', { params: {
                    isAdmin: isAdmin,
                    staffId: userInfo.staffId,     // 非平台管理员查询必传
                }})
                .then((res) => {
                    usedList = res.bean.usedList.map((item:any)=>item.reviewUsed);
                    const treeArr = isAdmin === '1' ? [...treeDataBase, ...res.beans] : res.beans;
                    const treeAll = buildTree(treeArr, usedList);
                    treeDataAll = treeAll;
                    setTreeData(treeAll);
                    setExpandedKey([treeAll[0].id])
                })
                .catch((err) => {});
        } catch (error) {
            console.error('获取配置范围数据失败:', error);
        } finally { }
    };
    const queryStaffList = async (node: any) => {  // 审核项目成员列表
        try {
            const params:{rangeType: string, markId?: string, projectIds?: string} = {
                rangeType: node.rangeType,
                projectIds: '',
            }
            if(node.rangeType !== 'all'){  //非全网类型时传入，以逗号分割
                if(node.rangeType === 'ten'){
                    params.projectIds = node.children.map((item:any)=>item.id).join()
                }else{
                    params.projectIds = node.id
                }
            } 
            request
                .post('appReview/queryAppReviewStaffConfigList', { params })
                .then((res) => {
                    if(res.returnCode === '0'){
                        staffData = res.beans;
                        const optArr = res.beans.length ? buildTree(res.beans) : [];
                        if(contType === 'app'){
                            setAppReviewProcess((preArr: ReviewProcess[])=>{
                                const newArr = [...preArr];
                                for(let i = 0; i < newArr.length; i++){
                                    for(let j = 0; j < newArr[i].child.length; j++){
                                        newArr[i].child[j].options = optArr;
                                    }
                                }
                                return newArr;
                            })
                        }else if(contType === 'temp'){
                            setTempReviewProcess((preArr: ReviewProcess[])=>{
                                const newArr = [...preArr];
                                for(let i = 0; i < newArr.length; i++){
                                    for(let j = 0; j < newArr[i].child.length; j++){
                                        newArr[i].child[j].options = optArr;
                                    }
                                }
                                return newArr;
                            })
                        }else if(contType === 'comp'){
                            setCompReviewProcess((preArr: ReviewProcess[])=>{
                                const newArr = [...preArr];
                                for(let i = 0; i < newArr.length; i++){
                                    for(let j = 0; j < newArr[i].child.length; j++){
                                        newArr[i].child[j].options = optArr;
                                    }
                                }
                                return newArr;
                            })
                        }else{
                            setEleReviewProcess((preArr: ReviewProcess[])=>{
                                const newArr = [...preArr];
                                for(let i = 0; i < newArr.length; i++){
                                    for(let j = 0; j < newArr[i].child.length; j++){
                                        newArr[i].child[j].options = optArr;
                                    }
                                }
                                return newArr;
                            })
                        }
                        node.icon && queryDetail(node)
                    }
                })
                .catch((err) => {});
        } catch (error) {
            console.error('获取审核项目成员列表数据失败:', error);
        } finally {  }
    };
    const queryDetail = async (node: any) => {  // 配置详情
        try {
            const params:{rangeType: string, markId?: string, projectIds?: string} = {
                rangeType: node.rangeType,
                projectIds: '',
                markId: node.id,
            }
            if(node.rangeType !== 'all'){  //非全网类型时传入，以逗号分割
                if(node.rangeType === 'ten'){
                    params.projectIds = node.children.map((item:any)=>item.id).join()
                }else{
                    params.projectIds = node.id
                }
            } 
            request
                .post('appReview/queryAppReviewStaffConfigList', { params })
                .then((res) => {
                    if(res.returnCode === '0'){
                        const filterRes = res.beans.filter((ri:any)=>ri.contType === contType);
                        if(contType === 'app'){
                            setAppReviewProcess((preArr: ReviewProcess[])=>{
                                const newArr = [...preArr];
                                for(let i = 0; i < newArr.length; i++){
                                    for(let j = 0; j < newArr[i].child.length; j++){
                                        const newStaff = filterRes.filter((si:any)=>si.reviewState === newArr[i].child[j].reviewState);
                                        const arrL = newStaff[0].reviewStaffId.split(',').map((a:any, ai:number)=>{
                                            if(newStaff[0].staffWay === '1'){
                                                return staffData.find(s=>s.staffId === a) ? staffData.find(s=>s.staffId === a)?.id : a;     //模板、组件、元素需同步  但还未同步
                                            }else{
                                                return newStaff[0].reviewStaffNm?.split(',')[ai] + '(' + a + ')';
                                            }
                                        })
                                        newArr[i].child[j] = {...newArr[i].child[j], ...newStaff[0], reviewStaffIds: arrL};
                                    }
                                }
                                return newArr;
                            })
                        }else if(contType === 'temp'){
                            setTempReviewProcess((preArr: ReviewProcess[])=>{
                                const newArr = [...preArr];
                                for(let i = 0; i < newArr.length; i++){
                                    for(let j = 0; j < newArr[i].child.length; j++){
                                        const newStaff = filterRes.filter((si:any)=>si.reviewState === newArr[i].child[j].reviewState);
                                        const arrL = newStaff[0].reviewStaffId.split(',').map((a:any, ai:number)=>{
                                            if(newStaff[0].staffWay === '1'){
                                                return staffData.find(s=>s.staffId === a)?.id
                                            }else{
                                                return newStaff[0].reviewStaffNm.split(',')[ai] + '(' + a + ')';
                                            }
                                        })
                                        newArr[i].child[j] = {...newArr[i].child[j], ...newStaff[0], reviewStaffIds: arrL};
                                    }
                                }
                                return newArr;
                            })
                        }else if(contType === 'comp'){
                            setCompReviewProcess((preArr: ReviewProcess[])=>{
                                const newArr = [...preArr];
                                for(let i = 0; i < newArr.length; i++){
                                    for(let j = 0; j < newArr[i].child.length; j++){
                                        const newStaff = filterRes.filter((si:any)=>si.reviewState === newArr[i].child[j].reviewState);
                                        const arrL = newStaff[0].reviewStaffId.split(',').map((a:any, ai:number)=>{
                                            if(newStaff[0].staffWay === '1'){
                                                return staffData.find(s=>s.staffId === a)?.id
                                            }else{
                                                return newStaff[0].reviewStaffNm.split(',')[ai] + '(' + a + ')';
                                            }
                                        })
                                        newArr[i].child[j] = {...newArr[i].child[j], ...newStaff[0], reviewStaffIds: arrL};
                                    }
                                }
                                return newArr;
                            })
                        }else{
                            setEleReviewProcess((preArr: ReviewProcess[])=>{
                                const newArr = [...preArr];
                                for(let i = 0; i < newArr.length; i++){
                                    for(let j = 0; j < newArr[i].child.length; j++){
                                        const newStaff = filterRes.filter((si:any)=>si.reviewState === newArr[i].child[j].reviewState);
                                        const arrL = newStaff[0].reviewStaffId.split(',').map((a:any, ai:number)=>{
                                            if(newStaff[0].staffWay === '1'){
                                                return staffData.find(s=>s.staffId === a)?.id
                                            }else{
                                                return newStaff[0].reviewStaffNm.split(',')[ai] + '(' + a + ')';
                                            }
                                        })
                                        newArr[i].child[j] = {...newArr[i].child[j], ...newStaff[0], reviewStaffIds: arrL};
                                    }
                                }
                                return newArr;
                            })
                        }
                    }
                })
                .catch((err) => {});
        } catch (error) {
            console.error('获取审核项目成员列表数据失败:', error);
        } finally { }
    };
    useEffect(() => {
        if(drawerOpen){
            // setContType('app');     // 审核内容选中 重置
            setSelectedKeys([]);  // 清空配置树选中
            querytreeData();  // 每次打开抽屉时 查配置范围树
            resetData();   // 右侧配置重置
        }else{
            selectedNode = {};
            setContType('app');     // 审核内容选中 重置
        }
    }, [drawerOpen]);
    
    const contTypeChange = (e: any) => { // 审核内容类型切换
        setContType(e.target.value);
        setSelectedKeys([]);  // 清空树选中
        resetData();   // 右侧配置重置
        if(e.target.value === 'comp' || e.target.value === 'temp'){ // 组件、模板   只有全网配置
            const treeAll = buildTree([{...treeDataAll[0], children: []}], usedList, e.target.value);  // 重新构建树，更新封装的reviewId 和 icon
            setTreeData(treeAll);
        }else if(e.target.value === 'ele'){ //  元素，只有全网加租户，没有项目这一层
            const childArr = treeDataAll[0].children.map((item:any)=>{
                return {...item,children: []}
            })
            const treeAll = buildTree([{...treeDataAll[0], children: childArr}], usedList, e.target.value);  // 重新构建树，更新封装的reviewId 和 icon
            setTreeData(treeAll);
        }else{ // 应用  全量数据（全网、租户、项目）
            setTreeData(treeDataAll);
        }
    };
    const [selectedKeys, setSelectedKeys] = useState([]);  // 配置范围树选中项
    // 配置范围 树节点选中
    const treeSelect = (selectedKeys: any, e:{selected: boolean, selectedNodes: any, node: any, event: any})=>{
        setSelectedKeys(selectedKeys);
        selectedNode = e.node;
        if(e.selected){
            resetData();  //  切换选中树 右侧配置重置
            queryStaffList(e.node);
        }
    };

    const [appReviewProcess, setAppReviewProcess] = useState(() => {
        // 使用深拷贝确保完全独立
        return JSON.parse(JSON.stringify(appReviewProcessArr));
        // 或使用 structuredClone (现代浏览器) return structuredClone(CONSTANT_DATA);
    });
    const [tempReviewProcess, setTempReviewProcess] = useState(() => {
        return JSON.parse(JSON.stringify(tempReviewProcessArr));
    });
    const [compReviewProcess, setCompReviewProcess] = useState(() => {
        return JSON.parse(JSON.stringify(compReviewProcessArr));
    });
    const [eleReviewProcess, setEleReviewProcess] = useState(() => {
        return JSON.parse(JSON.stringify(eleReviewProcessArr));
    });
    // 审核人员配置jsx
    const renderStepsItems = (data: any)=>{
        return data.map((dItem:any, dIndex:number) => {
            return {
                title: (<div style={{ fontSize: '14px', color: '#262626'}}> {dItem.name} <InfoCircleOutlined style={{ paddingLeft: '6px'}} /> </div>),
                description: (
                    <div key={dIndex} style={{ paddingTop : '16px'}}>
                        {
                            dItem.child.map((item:any,index:number) => (
                                <div key={index} style={{ display: 'flex', fontSize: '12px', color: '#262626', marginBottom: '20px'}}>
                                    <div style={{ width: '130px', marginRight: '13px', paddingTop : '23px', textAlign: 'right'}}>{item.name}:</div>
                                    <div style={{ flex: 1, padding: '12px 10px 12px 0', background: '#F7F7F7' }}>
                                        <div style={{ display: 'flex'}}>
                                            <div style={{ width: '126px', marginRight: '15px', textAlign: 'right', lineHeight: '32px'}}>审核人员：</div>
                                            <div style={{ flex: 1, display: 'flex' }}>
                                                {
                                                    item.reviewState === 'once' ? (
                                                        <div style={{ lineHeight: '32px', color: '#999999'}}>需求提交人     (一致性审核为发布提交时选择的需求提交人，不需要填写)</div>
                                                    ) : (
                                                        <Radio.Group
                                                            onChange={(e)=>{staffWayChange(e, dIndex, index)}}
                                                            value={item.staffWay}
                                                            options={[
                                                                { value: '1', label: '项目成员', style: { lineHeight: '32px'} },
                                                                { value: '2', label: '指定成员', style: { lineHeight: '32px'} },
                                                            ]}
                                                            disabled={selectedNode?.rangeType === 'ten' && isAdmin !== '1' && userInfo.staffId !== selectedNode?.staffId}
                                                        />
                                                    )
                                                }
                                                {
                                                    item.staffWay !== '0' ? (
                                                        item.staffWay === '1' ? (
                                                            <TreeSelect
                                                                disabled={selectedNode?.rangeType === 'ten' && isAdmin !== '1' && userInfo.staffId !== selectedNode?.staffId}
                                                                multiple
                                                                showSearch
                                                                style={{ flex: 1 }}
                                                                value={item.reviewStaffIds}
                                                                placeholder="请选择"
                                                                allowClear
                                                                treeDefaultExpandAll
                                                                onChange={(value: string[], label: any[])=>{handleSelectChange(value, dIndex, index, label, item)}}
                                                                treeData={item.options} 
                                                                fieldNames={{label: 'staffId', value: 'id', children: 'children'}}
                                                                treeNodeFilterProp="staffId"
                                                                treeTitleRender={(node: any) => {
                                                                    // node 是当前节点的原始数据
                                                                    if(node.value){
                                                                        const newName = item.reviewStaffNm?.split(',')[item.reviewStaffIds.indexOf(node.value)]
                                                                        return <span>{newName} {node.value}</span>;
                                                                    }
                                                                    return <span>{node.name || '--'} {node.staffId}</span>;
                                                                }}
                                                            />
                                                        ) : (
                                                            <>
                                                                <Select
                                                                    disabled={selectedNode?.rangeType === 'ten' && isAdmin !== '1' && userInfo.staffId !== selectedNode?.staffId}
                                                                    mode="multiple"
                                                                    style={{ flex: 1 }}
                                                                    value={item.reviewStaffIds}
                                                                    open={item.open}
                                                                    options={item.options2}
                                                                    key={item.selectkey}
                                                                    searchValue={item.searchText}
                                                                    onChange={(value, option)=>{handleSelectChange(value, dIndex, index)}}
                                                                    onDropdownVisibleChange={(open)=>{ !open && setCommonProcessState(dIndex, index, { open: false, }); }}
                                                                    showSearch
                                                                    filterOption={false}
                                                                    placeholder="请输入成员手机号，查找后完成选择"
                                                                    loading={item.selectLoading}
                                                                    notFoundContent={item.noData}
                                                                    onSearch={(val)=>{handleSearch(val, dIndex, index)}}
                                                                    suffixIcon={null}
                                                                    onBlur={() => { setCommonProcessState(dIndex, index, { open: false, }); }}
                                                                />
                                                                <span onClick={()=>{searchStaff(dIndex, index)}} style={{ cursor: 'pointer', color:' #0085D0', lineHeight: '32px', paddingLeft: '10px' }}>查找</span>
                                                            </>
                                                        )
                                                    ) : null
                                                }
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', lineHeight: '70px'}}>
                                            <div style={{ width: '126px', marginRight: '15px', textAlign: 'right'}}>多人审批时审批方式:</div>
                                            <div style={{ color: '#999999'}}>或签（一名审批人同意即可）</div>
                                        </div>
                                        <div style={{ display: 'flex'}}>
                                            <div style={{ width: '126px', marginRight: '15px', textAlign: 'right'}}>通知处理人短信内容:</div>
                                            <div style={{ flex: 1 }}>
                                                <TextArea readOnly style={{ resize: 'none', backgroundColor: '#F2F2F2', border: '1px solid #D9D9D9' }} 
                                                    rows={3} placeholder="请输入"  
                                                    value={'【中国移动】【应用集成平台-应用管理】您收到一条新工单标题为【XX】应用，请及时登陆应用集成平台进行【'+ item.name +'】，多谢！'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ),
            }
        })
    };
    // 审核人员方式切换
    const staffWayChange = (e:any, dindex: number, index: number)=>{
        setCommonProcessState(dindex, index, {
            staffWay: e.target.value,
            reviewStaffIds: [],
            options2: [],
        });
    };
    // 指定人员下拉 searchText改变时触发
    const handleSearch = (value: string, dindex: number, index: number)=>{
        setCommonProcessState(dindex, index, {
            searchText: value,
            open: true,
            options2: [],
            noData: '点击查找获取数据',
        });
    };
    //  项目/指定人员 Select选择值变化时触发
    const handleSelectChange = (value: string[], dindex: number, index: number, label?: any[], item?: any) => {
        // 限制最大选中数量
        if (value.length > 20) {
            message.warning(`最多只能选择20个选项`);
            return;
        }
        setCommonProcessState(dindex, index, label ? {
            reviewStaffIds: value,
            reviewStaffId: label.map((name, nindex)=>name ? name.props.children[2] : value[nindex]).join(),
            reviewStaffNm: label.map((name, nindex)=>name ? name.props.children[0] : item.reviewStaffNm.split(',')[nindex]).join()
        } : {
            reviewStaffIds: value,
            reviewStaffId: value.map(item=>item.split('(')[1].split(')')[0]).join(),
            reviewStaffNm: value.map(item=>item.split('(')[0]).join(),
            open: true, // 选择后保持下拉打开，方便连续多选
            // searchText: '', // 清空搜索文本
        });
    };
    // 点击查找时触发
    const searchStaff = (dindex: number, index: number)=>{
        const text = contType == 'app' ? appReviewProcess[dindex].child[index].searchText : contType == 'temp' ? tempReviewProcess[dindex].child[index].searchText : contType == 'comp' ? compReviewProcess[dindex].child[index].searchText : eleReviewProcess[dindex].child[index].searchText;
        if (!text) {
            message.warning('请输入手机号');
            return;
        }
        // 设置loading状态并打开下拉
        setCommonProcessState(dindex, index, {
            open: true,
            selectLoading: true,
            noData: '加载中...',
            options2: []
        });
        fetchData(text, dindex, index);
    };
    // 通用的状态设置函数
    const setCommonProcessState = (dindex: number, index: number, stateUpdate: any) => {
        if(contType === 'app'){
            setAppReviewProcess((preArr: ReviewProcess[])=>{
                const newArr = [...preArr];
                newArr[dindex].child[index] = {
                    ...newArr[dindex].child[index],
                    ...stateUpdate
                };
                return newArr;
            })
        }else if(contType === 'temp'){
            setTempReviewProcess((preArr: ReviewProcess[])=>{
                const newArr = [...preArr];
                newArr[dindex].child[index] = {
                    ...newArr[dindex].child[index],
                    ...stateUpdate
                };
                return newArr;
            })
        }else if(contType === 'comp'){
            setCompReviewProcess((preArr: ReviewProcess[])=>{
                const newArr = [...preArr];
                newArr[dindex].child[index] = {
                    ...newArr[dindex].child[index],
                    ...stateUpdate
                };
                return newArr;
            })
        }else{
            setEleReviewProcess((preArr: ReviewProcess[])=>{
                const newArr = [...preArr];
                newArr[dindex].child[index] = {
                    ...newArr[dindex].child[index],
                    ...stateUpdate
                };
                return newArr;
            })
        }
    };
    // 点击查找后调用的接口
    const fetchData =  (searchText: string, dindex: number, index: number) => {
        try{
            request
            .post('/appTenant/queryAdminStaffInfo', { params: {phone: searchText }})
            .then((res) => {
                const adminSatffIdList = res.beans.map((item:any)=>{
                    return {label: Object.values(item)[0] + '(' + Object.keys(item)[0] + ')', value: Object.values(item)[0] + '(' + Object.keys(item)[0] + ')'}
                })
                const currentState = contType == 'app' ? appReviewProcess[dindex].child[index] : contType == 'temp' ? tempReviewProcess[dindex].child[index] : contType == 'comp' ? compReviewProcess[dindex].child[index] : eleReviewProcess[dindex].child[index];
                
                setCommonProcessState(dindex, index, {
                    options2: adminSatffIdList,
                    noData: adminSatffIdList.length ? '' :'未找到数据',
                    open: true,
                    selectLoading: false,
                    selectkey: currentState?.selectkey + 1,
                });
            })
            .catch((err) => {
                setCommonProcessState(dindex, index, {
                    selectLoading: false,
                    noData: '加载失败，请重试',
                    open: true
                });
            });
        }catch(err){
            setCommonProcessState(dindex, index, {
                selectLoading: false,
                noData: '加载失败，请重试',
                open: true
            });
        }
    };

    const saveAppReviewConfig = async () => {  // 保存审核人员配置
        if(!selectedNode.id){
            message.warning('请选择配置范围树节点');
            return;
        }
        const list = contType == 'app' ? appReviewProcess : contType == 'temp' ? tempReviewProcess : contType == 'comp' ? compReviewProcess : eleReviewProcess;
        // 校验
        for(let i = 0; i < list.length; i++){
            if(list[i].child.some((r: ReviewProcessChild) => r.staffWay !== '0' && !r.reviewStaffIds.length)){
                message.warning('请配置审核人员');
                return;
            }
        }
        setReviewConfirmLoading(true);
        // 封装 reviewList 入参
        const reviewList = [];
        for(let i = 0; i < list.length; i++){
            for(let j = 0; j < list[i].child.length; j++){
                reviewList.push(list[i].child[j])
            }
        }
        const params = {
            contType,
            rangeType: selectedNode?.rangeType,
            markId: selectedNode?.id,
            reviewList,
            crtStaffId: '',
            updateStaffId: '',
        }
        try {
            request
                .post('appReview/saveAppReviewConfig', { params })
                .then((res) => {
                    if(res.returnCode === '0'){
                        message.success('保存成功');
                        setDrawerOpen(false);
                    }
                })
                .catch((err) => {});
        } catch (error) {
            console.error('保存配置失败:', error);
            setReviewConfirmLoading(false);
        } finally { }
    };
    const footer: React.ReactNode = (  // 抽屉底部
        <Flex gap="small" justify="flex-start" align="center" style={{height: '62px'}}>
          <Button type="primary" loading={reviewConfirmLoading} onClick={saveAppReviewConfig}>确定</Button>
          <Button onClick={() => setDrawerOpen(false)}>取消</Button>
        </Flex>
    );

    return (
        <Drawer
            width="75vw"
            footer={footer}
            title="审核人员配置"
            className={styles.reviewConfigDrawer}
            open={drawerOpen}
            onClose={() => {setDrawerOpen(false);}}
            keyboard={false}
            maskClosable={false}
            rootClassName="custom-drawer-root"
            getContainer={false}
            destroyOnClose
            afterOpenChange={(open) => {!open && reviewConfirmLoading && setReviewConfirmLoading(false);}}
        >
            <div className={[styles.tip, tipClose ? styles.tipClose : ''].join(' ')}>
                <img
                    src={tipIcon}
                    alt=""
                    style={{ width: 16, height: 16, objectFit: 'contain', verticalAlign: 'text-bottom', margin: '0 15px 0 22px' }}
                />
                <span>{`审核人选取将遵循“项目 > 租户 > 全网”的逐级顺位原则：以项目层配置为最高优先级，当该层未配置时，自动启用下一层级（租户）的配置，若租户层亦未配置，则最终采用全网层配置。`}</span>
                <img
                    onClick={() => {
                        setTipClose(true);
                    }}
                    src={closeIcon}
                    alt=""
                    style={{ position: 'absolute', right: '13px', top: '10px', cursor: 'pointer' }}
                />
            </div>
            <div className={[styles.contentBox, tipClose ? styles.contentBoxNoTip : ''].join(' ')}>
                <div className={styles.contentLeft}>
                    <div className={styles.contentTop}>第1步：审核内容选择</div>
                    <div style={{ padding: '15px 0 0 20px', height: 'calc(100% - 50px)', borderRight: '1px solid #D5DCE6' }}>
                        <Radio.Group
                            className={styles.reviewType}
                            onChange={contTypeChange}
                            value={contType}
                            options={[   // 平台管理员isAdmin为'1'  模板、组件、元素可进行选择，否则不可进行选择。
                                { value: 'app', label: '应用', style: { lineHeight: '32px'} },
                                { value: 'temp', label: '模板', disabled: isAdmin !== '1', style: { lineHeight: '32px'} },
                                { value: 'comp', label: '组件', disabled: isAdmin !== '1', style: { lineHeight: '32px'} },
                                { value: 'ele', label: '元素', disabled: isAdmin !== '1', style: { lineHeight: '32px'} }, 
                            ]}
                        />
                    </div>
                </div>
                <div className={styles.contentCenter}>
                    <div className={styles.contentTop}>第2步： 配置范围选择</div>
                    <div className={styles.scrollbarDis} style={{ padding: '15px 10px 10px 15px', height: 'calc(100% - 50px)', overflowY: 'auto', borderRight: '1px solid #D5DCE6' }}>
                        <Tree
                            treeData={treeData}
                            expandedKeys={expandedKey}
                            onExpand={setExpandedKey}
                            blockNode
                            showIcon
                            onSelect={treeSelect}
                            selectedKeys={selectedKeys}
                            fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                        />
                    </div>
                </div>
                <div className={styles.contentRight}>
                    <div className={styles.contentTop}>
                        第3步 ：审核人员配置<span>为左侧选择的审核内容及配置范围，配置各流程各环节的审核人。</span>
                    </div>
                    {/* <div><CheckCircleFilled style={{ color: '#90C31F'}} /></div>  */}
                    <div style={{ padding: '15px 18px 0 14px', overflowY: 'auto', height: 'calc(100% - 50px)'}}>
                        <Steps direction="vertical" progressDot={true} 
                        items={renderStepsItems(contType == 'app' ? appReviewProcess : contType == 'temp' ? tempReviewProcess : contType == 'comp' ? compReviewProcess : eleReviewProcess)} />
                    </div>
                </div>
            </div>
        </Drawer>
    );
}

export default forwardRef(reviewConfigDrawer);
