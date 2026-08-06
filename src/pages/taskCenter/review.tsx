import { forwardRef, useImperativeHandle, useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Drawer, Steps, Descriptions, Button, Radio, Select, Input, Checkbox, Modal, App, Tooltip, Tag } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { UpOutlined, DownOutlined, PlayCircleOutlined, SearchOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { menu } from '../../stores/menuStore';
import { publictData } from '../../utils/appMenuData';
import CascadeSelect from '../applicationOrchestration/CascadeSelect';
import CascadeSelects from '../applicationOrchestration/CascadeSelects';
import Preview from '../../layout/Preview/Preview';
import request from '../../utils/request';
import Upcheckty from '..//applicationList/upcheckty'; //上架详情
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { baseApiConvert } from '../../utils/util';
import styles from './index.module.less';

const { TextArea } = Input;
interface AppTemptypeData {
    pId: string;
    typeLevel: string;
    appTypeCategory: string;
    appTypeId: string;
    appTypeName: string;
}
interface FileInfo {
    nm: string;  // 文件名称
    url: string; // 文件链接
}

const modalStyles = { // 应用分类弹窗样式
    content: {
        paddingLeft: 0,
        paddingRight: '0px',
        paddingBottom: '0px',
    },
    header: {
        paddingLeft: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #d0d6d9',
    },
};
const items = [
    {
        title: '应用发布提交',
        reviewstate: 'pubSub',
    },
    {
        title: '网络安全审核',
        reviewstate: 'netSafe',
    },
    {
        title: '数据安全审核',
        reviewstate: 'dataSafe',
    },
    {
        title: '应用发布审核',
        reviewstate: 'app',
    },
    {
        title: '一致性确认',
        reviewstate: 'once',
    },
    {
        title: '已发布',
        reviewstate: '',
    },
    {
        title: '应用上架提交',
        reviewstate: 'upSub',
    },
    {
        title: '上架审核',
        reviewstate: 'up',
    },
    {
        title: '结束',
        reviewstate: '',
    },
];
const reviewStateOpt = [
    { label: '应用发布提交', value: 'pubSub' },
    { label: '网络安全审核', value: 'netSafe' },
    { label: '数据安全审核', value: 'dataSafe' },
    { label: '应用发布审核', value: 'app' },
    { label: '一致性确认', value: 'once' },
    { label: '应用上架提交', value: 'upSub' },
    { label: '上架审核', value: 'up' },
    { label: '应用下架提交', value: 'downSub' },
    { label: '下架审核', value: 'down' },
    { label: '下架公示', value: 'downNotice' },
    { label: '应用回滚提交', value: 'rollbackSub' },
    { label: '回滚审核', value: 'rollback' },
];

function reviewDrawer(_: any, ref: any){
    const { message } = App.useApp();
    const updeRef = useRef<{ open: (data: any) => void }>();
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const openPreview = menu((state) => state.openPreview);
    const location = useLocation();
    const refreshCallbackRef = useRef<(() => void) | null>(null);
    //应用形式
    const displayFormOptions = publictData.showFormArr;
    //状态
    const statusOptions = publictData.schemeStateArr;
    const provinceSelectValue = publictData.provinceSelectValue; // 分配省份
    const [drawerOpen, setDrawerOpen] = useState(false);  // 抽屉显隐
    const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);  // 预览抽屉显隐
    const [drawerTitle, setDrawerTitle] = useState('');  // 抽屉标题
    const [stepsItem, setStepsItem] = useState<{ title: string; reviewstate: string; }[]>([]);  // 步骤条数据
    const [current, setCurrent] = useState(0);  // 步骤条当前节点
    const [submitReviewLoading, setSubmitReviewLoading] = useState(false);  // 提交按钮loading
    useImperativeHandle(ref, () => ({
        open: (data: any, onRefresh: () => void) => {
            if (onRefresh) {
                refreshCallbackRef.current = onRefresh;
            }
            setDrawerOpen(true);
            setDrawerTitle(data.markName+'审核');   // 设置抽屉标题
            setlistDatas(data);   // 设置基本信息
            if(data.markType === 'app'){
                if(data.reviewType === 'publish' || data.reviewType === 'up'){
                    if(data.showArea === '2'){
                        setStepsItem((prev:any)=>{
                            return items.filter((item:any)=>item.reviewstate !== 'dataSafe' && item.reviewstate !=='netSafe' && item.reviewstate !=='once')
                        });
                        setCurrent(items.filter((item:any)=>item.reviewstate !== 'dataSafe' && item.reviewstate !=='netSafe' && item.reviewstate !=='once').findIndex(item=>item.reviewstate === data.reviewState));
                    }else if(data.specialState.includes("dataSafe")){
                        setStepsItem(items);
                        setCurrent(items.findIndex(item=>item.reviewstate === data.reviewState));
                    }else{
                        setStepsItem((prev:any)=>{
                            return items.filter((item:any)=>item.reviewstate !== 'dataSafe')
                        });
                        setCurrent(items.filter((item:any)=>item.reviewstate !== 'dataSafe').findIndex(item=>item.reviewstate === data.reviewState));
                    }
                }else if(data.reviewType === 'down'){
                    setStepsItem([
                        {
                            title: '应用下架提交',
                            reviewstate: 'downSub',
                        },
                        {
                            title: '下架审核',
                            reviewstate: 'down',
                        },
                        {
                            title: '结束',
                            reviewstate: '',
                        },
                    ])
                    setCurrent(1);
                }else{
                    setStepsItem([
                        {
                            title: '应用回滚提交',
                            reviewstate: 'rollbackSub',
                        },
                        {
                            title: '回滚审核',
                            reviewstate: 'rollback',
                        },
                        {
                            title: '结束',
                            reviewstate: '',
                        },
                    ])
                    setCurrent(1);
                }
            }
            queryAppReviewHisList(data);  // 查询审核记录
            if(data.reviewState === 'up'){
                setAppTypeId(data.appTypeId);
                setSelTagTypeId(data.tagTypeId || '');
                queryAppTypeList(data.appTypeId);  // 上架审核  查询应用分类

                // 先查询应用标签列表，再设置标签名称用于回显
                queryAppTagList(data.tagTypeId);  // 传入tagTypeId参数以便在查询完成后设置标签名称
            }
            data.reviewState === 'once' && queryAppReviewInfoCommon(data);   // 一致性确认  查询上架审核人
        },
    }));

    const [expanded, setExpanded] = useState(true);     // 基本信息折叠/展开状态
    const [listDatas, setlistDatas] = useState<any>();  //  基本信息
    const [recodeExpanded, setRecodeExpanded] = useState(true);  // 审核记录折叠/展开状态
    const [recodeList, setRecodeList] = useState<any>([]);  //  审核记录
    const queryAppReviewHisList = async (data:any) => {  // 获取审核记录数据
        try {
            request
                .post('appReview/queryAppReviewHisList', { params: {
                    markId: data.markId,    // 只传它 查该markId全部审核记录
                        // reviewNo: data.reviewNo,
                        // reviewState: data.reviewState,
                        // reviewType: data.reviewType,
                        // markType: data.markType,
                        // markName: data.markName,
                        // markVersion: data.markVersion,
                        // opeStaffId: userInfo.staffId   // 当前工号
                }})
                .then((res) => {
                    setRecodeList(res.beans);
                })
                .catch((err) => { setRecodeList([]); });
        } catch (error) {
            console.error('获取审核记录数据失败:', error);
        } finally { }
    };

    const [reviewResult, setReviewResult] = useState('');  //  审核结果
    const [reviewComment, setReviewComment] = useState('');  //  审核意见
    const reviewResultChange = (e:any)=>{ //  审核结果切换
        setReviewResult(e.target.value)
        if(e.target.value !== '2'){
            setTransferStaffId(undefined);
            setTransferStaffNm('');
        }
    }
    const [transferStaffId, setTransferStaffId] = useState(undefined);
    const [transferStaffNm, setTransferStaffNm] = useState('');
    const [open, setOpen] = useState(false);
    const [adminOptions, setAdminOptions] = useState<any[]>([]);
    const [selectKey, setSelectKey] = useState(0);
    const [selectLoading, setSelectLoading] = useState(false);
    const handleSearch = (val: string) => {
        setSearchText(val);
        setOpen(false);
    };
    const handleIconClick = (e: any) => {
        e.stopPropagation();
        if (!searchText) {
            message.warning('请输入手机号');
            return;
        }
        if (!open) {
            setOpen(true);
            // 如果要展开，先加载数据
            fetchData(searchText);
        }
    };
    const [searchText, setSearchText] = useState(''); // 管理员搜索值
    const fetchData = (searchText: string) => {
        setSelectLoading(true);
        try {
            request
                .post('/appTenant/queryAdminStaffInfo', { params: { phone: searchText } })
                .then((res) => {
                    const adminSatffIdList = res.beans.map((item: any) => {
                        return { label: Object.values(item)[0] + '(' + Object.keys(item)[0] + ')', value: Object.keys(item)[0] };
                    });
                    setAdminOptions(adminSatffIdList);
                    setSelectKey((pre) => {
                        return pre + 1;
                    }); // 解决setAdminOptions异步导致下拉数据未更新的问题
                    // setSearchText(searchText)
                    setSelectLoading(false);
                })
                .catch((err) => {
                    setAdminOptions([]);
                    setSelectLoading(false);
                });
        } catch (err) {}
    };

    const [checkedList, setCheckedList] = useState<any[]>([]);  // 分配省份
    const normalOptionValues = provinceSelectValue.map(opt => opt.value);
     // 计算全选状态
    const isAllChecked = useMemo(() => {
        // 获取普通选项中被选中的值
        const selectedNormalValues = checkedList.filter(v => normalOptionValues.includes(v));
        // 如果所有普通选项都被选中，则全选应该被选中
        return selectedNormalValues.length === provinceSelectValue.length;
    }, [checkedList, normalOptionValues, provinceSelectValue.length]);
    const onCheckChange = (checkedValues: any[]) => {
        // 判断是否点击了全选选项
        const hasAllChecked = checkedValues.includes('all');
        const hadAllChecked = checkedList.includes('all');

        let newCheckedList = [...checkedValues];

        if (hasAllChecked && !hadAllChecked) {
            // 场景1：点击选中"全选" -> 选中所有普通选项和全选本身
            newCheckedList = ['all', ...normalOptionValues];
        } else if (!hasAllChecked && hadAllChecked) {
            newCheckedList = [];
            // 场景2：点击取消"全选" -> 只保留被选中的普通选项（移除全选）
            // newCheckedList = checkedValues.filter(v => v !== 'all');
        } else if (hasAllChecked && hadAllChecked) {
            // 场景3：已全选状态，手动取消某个普通选项
            // 需要同时移除"全选"的选中状态
            newCheckedList = checkedValues.filter(v => v !== 'all');
        } else {
            // 场景4：未全选状态，手动选中了所有普通选项
            // 检查是否所有普通选项都被选中了
            const selectedNormalValues = checkedValues.filter(v => normalOptionValues.includes(v));
            if (selectedNormalValues.length === provinceSelectValue.length) {
                // 如果所有普通选项都被选中，自动选中"全选"
                newCheckedList = [...checkedValues, 'all'];
            }
        }
        setCheckedList(newCheckedList);
    };
    // 应用分类
    const [appTypeId, setAppTypeId] = useState<string>('');
    const [appTypeName, setAppTypeName] = useState<string>('');
    const [appTypeList, setAppTypeList] = useState<AppTemptypeData[]>([]);
    //应用分类弹窗
    const [modalVisible, setModalVisible] = useState(false);

    // 应用标签
    const [appTagList, setAppTagList] = useState<AppTemptypeData[]>([]);
    const [selTagTypeId, setSelTagTypeId] = useState<string>('');
    const [selTagTypeName, setSelTagTypeName] = useState<string>('');
    const [tagModalVisible, setTagModalVisible] = useState(false);

    // 标签溢出检测相关状态
    const tagItemBoxRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState<number | null>(null);
    const [hiddenTags, setHiddenTags] = useState<{name: string, id: string, originalIndex: number}[]>([]);
    // 查询应用标签列表
    const queryAppTagList = async (tagTypeId?: string) => {
        try {
            const res = await request.post('/appType/queryAppTypeList', { params: { categoryType: '2' } });
            if (res?.beans) {
                const appTagListBeans = res.beans.map((item: AppTemptypeData) => {
                    return {
                        appTypeCategory: item.appTypeCategory,
                        appTypeId: item.appTypeId,
                        appTypeName: item.appTypeName,
                        pId: item.pId,
                        typeLevel: item.typeLevel,
                    };
                });
                setAppTagList(appTagListBeans);

                // 如果传入了tagTypeId，则设置标签名称用于回显
                if (tagTypeId) {
                    const tagIds = tagTypeId.split(',');
                    const tagNames = tagIds.map(id => {
                        const tag = appTagListBeans.find((item: AppTemptypeData) => item.appTypeId === id);
                        return tag ? tag.appTypeName : '';
                    }).filter(name => name);
                    setSelTagTypeName(tagNames.join(','));
                }
            }
        } catch (err) {
            console.error('查询应用标签列表失败:', err);
        }
    };

    const queryAppTypeList = async (appTypeId: string) => {  // 获取应用分类数据
        try {
            request
            .post('/appType/queryAppTypeList', {})
            .then((res) => {
                const appTypeListBeans = res.beans.map((item: AppTemptypeData) => {
                        return {
                            appTypeCategory: item.appTypeCategory,
                            appTypeId: item.appTypeId,
                            appTypeName: item.appTypeName,
                            pId: item.pId,
                            typeLevel: item.typeLevel,
                        };
                    });
                const appTypeNames: string[] = [];
                setAppTypeList(appTypeListBeans);
                getAppTypeNameById(appTypeNames, appTypeListBeans, appTypeId);
                setAppTypeName(appTypeNames.join('-'));
            })
            .catch((err) => {
                console.log('新增失败:', err);
            });
        } catch (error) {
            console.error('获取应用分类数据失败:', error);
        } finally { }
    };
    // 根据应用标签ID获取应用标签名称
    const getAppTagNameById = (tagTypeId?: string): string => {
        if (!tagTypeId) return '';
        const tagIds = tagTypeId.split(',');
        const tagNames = tagIds.map(id => {
            const tag = appTagList.find((item: AppTemptypeData) => item.appTypeId === id);
            return tag ? tag.appTypeName : '';
        }).filter(name => name);
        return tagNames.join(',');
    };

    //  递归查询当前应用分类的所有父级Name
    const getAppTypeNameById = (result: string[], appTypeList:any[], appTypeId?: string ): void => {
        const item = appTypeList.find((i) => i.appTypeId === appTypeId);
        if (item) {
            result.unshift(item.appTypeName);
            if (item.pId) {
                getAppTypeNameById(result, appTypeList, item.pId);
            }
        }
    };
    // 删除单个标签
    const handleRemoveTag = (index: number) => {
        const tagIdsArray = selTagTypeId?.split(',') || [];
        const tagNamesArray = selTagTypeName?.split(',') || [];

        tagIdsArray.splice(index, 1);
        tagNamesArray.splice(index, 1);

        setSelTagTypeId(tagIdsArray.join(','));
        setSelTagTypeName(tagNamesArray.join(','));
    };

    // 从隐藏标签中删除指定标签
    const handleRemoveHiddenTag = (originalIndex: number) => {
        handleRemoveTag(originalIndex);
    };

    //  关闭弹窗时，重置
    const resetData = () => {
        setExpanded(true);
        setRecodeExpanded(true);
        setlistDatas([]);  // 重置基本信息
        setRecodeList([]);   // 重置审核记录
        setReviewResult(''); // 重置审核结果
        setTransferStaffId(undefined);   // 重置转派  或前端应用纳管员手机号搜索结果
        setTransferStaffNm('');
        setAdminOptions([]);
        setSelectKey(0);
        setOpen(false);
        setReviewComment('');   // 重置审核意见
        setAppTypeId('');       // 重置应用分类
        setAppTypeName('');     // 重置
        setCheckedList([]);     // 重置省份分配
        // 重置应用标签
        setSelTagTypeId('');
        setSelTagTypeName('');
        // 重置前端应用纳管员相关
        setFrontendManagerId(undefined);
        setFrontStaffNm('');
        setFrontendManagerList([]);
        setAddManagerVisible(false);
    }

    // 检测标签溢出并计算可见标签数量
    useEffect(() => {
        const calculateVisibleTags = () => {
            if (!tagItemBoxRef.current || !selTagTypeName) {
                setVisibleCount(null);
                setHiddenTags([]);
                return;
            }

            const tagNames = selTagTypeName.split(',');
            const tagIds = selTagTypeId?.split(',') || [];

            // 动态根据tagItemBox的实际宽度计算最大宽度
            const containerWidth = tagItemBoxRef.current.offsetWidth;
            const ellipsisWidth = 30; // 省略号大约宽度
            const maxWidth = containerWidth;

            let visibleTags = 0;
            let currentWidth = 0;

            const tagElements = tagItemBoxRef.current.querySelectorAll(`.${styles.tagItem}`);

            // 使用 for 循环以便在超出宽度时能够立即停止遍历
            for (let index = 0; index < tagElements.length; index++) {
                const element = tagElements[index];
                const tagWidth = (element as HTMLElement).offsetWidth;
                const newWidth = currentWidth + tagWidth;

                // 检查加上这个标签和省略号是否会超出容器
                if (newWidth + ellipsisWidth <= maxWidth) {
                    visibleTags++;
                    currentWidth = newWidth;
                } else {
                    break; // 停止遍历
                }
            }

            // 如果所有标签都能放下，就不需要省略号
            if (visibleTags >= tagNames.length) {
                setVisibleCount(null);
                setHiddenTags([]);
            } else {
                setVisibleCount(visibleTags);
                // 收集隐藏的标签
                const hidden = tagNames.slice(visibleTags).map((name, index) => ({
                    name,
                    id: tagIds[visibleTags + index],
                    originalIndex: visibleTags + index
                }));
                setHiddenTags(hidden);
            }
        };

        // 延迟执行，确保DOM已经渲染
        setTimeout(calculateVisibleTags, 100);

        // 监听窗口大小变化
        window.addEventListener('resize', calculateVisibleTags);

        return () => {
            window.removeEventListener('resize', calculateVisibleTags);
        };
    }, [selTagTypeName, selTagTypeId]);
    const [frontendManagerList, setFrontendManagerList] = useState<any[]>([]);  // 前端应用纳管员下拉
    const [frontendManagerId, setFrontendManagerId] = useState(undefined);  // 选中的前端应用纳管员ID
    const [frontStaffNm, setFrontStaffNm] = useState('');  // 选中的前端应用纳管员ID
    const [addManagerVisible, setAddManagerVisible] = useState(false);  // 新增功能显隐状态

    const queryAppReviewInfoCommon = async (data:any) => {  // 查询审核人信息的公共方法
        try {
            request
            .post('/appReview/queryAppReviewInfoCommon', { params: {
                contType: 'app',  //['app', 'comp', 'ele'].indexOf(data.markType) > -1 ? data.markType : 'temp'
                reviewState: 'up', // 'up'    data.reviewState
                markId: data.projectId,
             }})
            .then((res) => {
                const managerList:any[] = [];
                res.beans.map((item: any,index: number) => {
                    if(item.reviewStaffId){
                        const itemArr = item.reviewStaffNm.split(',');
                        const itemIdArr = item.reviewStaffId.split(',');
                        itemArr.map((ia: any,ian: number) => {
                            managerList.push({
                                label: ia + '(' + itemIdArr[ian] + ')',
                                value: itemIdArr[ian]
                            });
                        });
                    }
                });
                setFrontendManagerList(managerList);
            })
            .catch((err) => {
                console.log('获取前端应用纳管员列表失败:', err);
                setFrontendManagerList([]);
            });
        } catch (error) {
            console.error('获取前端应用纳管员数据失败:', error);
        } finally { }
    };

    const submitReview = () => {
        if(!reviewResult){
            message.warning('请选择审核结果');
            return;
        }
        const params:any = {
            reviewId: listDatas.reviewId,
            reviewResult,
            projectId:listDatas.projectId,
            opeStaffId: userInfo.staffId,
            opeStaffNm: userInfo.staffName,
            orgaName: userInfo.orgaName,
        }
        if(reviewResult === '2'){
            if(!transferStaffId){
                message.warning('请选择转派人员');
                return;
            }
            params.transferStaffId = transferStaffId;
            params.transferStaffNm = transferStaffNm;
        }
        if(listDatas.reviewState === 'up'){
            params.appTypeId = appTypeId;
            if(listDatas.appCategory === '1'){
                if(!selTagTypeId){
                    message.warning('请选择应用标签');
                    return;
                }
                params.tagTypeId = selTagTypeId;
            }
            if(listDatas.appLevel === '1' && listDatas?.isCreateMenu === '1'){
                if(checkedList.length === 0){
                    message.warning('请选择分配省份');
                    return;
                }
                params.divideProv = checkedList.filter(item=>item !== 'all');
            }else{
                params.divideProv = [listDatas.provId];
            }
        }
        if(listDatas?.showArea !== '2' && listDatas.reviewState === 'once'){
            if(!frontendManagerId && !transferStaffId){
                message.warning('请选择前端应用纳管员！');
                return;
            }
            params.frontStaff = frontStaffNm || transferStaffNm;
        }
        if(!reviewComment){
            message.warning('请填写审核意见');
            return;
        }
        setSubmitReviewLoading(true);
        params.reviewComment = reviewComment;
        if(listDatas?.showArea === '2' && (listDatas.reviewState === 'app' || listDatas.reviewState === 'up')){
            params.showArea = listDatas?.showArea;
        }
        let url = '';
        listDatas.reviewType === 'publish' && (url = 'app/pubReviewAppInfo')
        listDatas.reviewType === 'up' && (url = 'app/upReviewAppInfo')
        listDatas.reviewType === 'down' && (url = 'app/downReviewAppInfo')
        listDatas.reviewType === 'rollback' && (url = 'app/rollbackReviewAppInfo')
        request.post(url, { params })
            .then((res) => {
                if(res.returnCode === '0'){
                    message.success('提交成功');
                    setDrawerOpen(false);
                    resetData();
                    // 触发父组件刷新列表
                    if (refreshCallbackRef.current) {
                        refreshCallbackRef.current();
                    }
                }
            })
            .catch((err) => {
                console.log('提交审核失败:', err);
                setSubmitReviewLoading(false);
            });

    }
    const downloadUploadedFile = (fileInfo: FileInfo) => {
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = baseApiConvert(fileInfo.url);
            document.body.appendChild(iframe);
            // 下载完成后移除 iframe
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 3000); // 给予足够时间开始下载
        } catch (error) {
            message.error('文件下载失败');
        }
    };

    return (
        <>
            <Drawer
                width="75vw"
                title={drawerTitle}
                className={styles.reviewDrawer}
                open={drawerOpen}
                onClose={() => {setDrawerOpen(false);resetData();}}
                keyboard={false}
                maskClosable={false}
                rootClassName="custom-drawer-root"
                destroyOnClose={true}
                afterOpenChange={(open) => {!open && submitReviewLoading && setSubmitReviewLoading(false);}}
            >
                {/* 步骤条 */}
                <div style={{ display: 'flex', alignItems: 'center', height: '96px', marginBottom: '16px', backgroundColor: '#F4FAFF'  }}>
                    <Steps current={current} items={stepsItem} progressDot={true} />
                </div>
                {/* 基本信息 */}
                <div className={styles.infocard}>
                    <div className={styles.cardheader}>
                        <div className={styles.titlea}>基本信息</div>
                        {expanded ?
                        <UpOutlined onClick={() => setExpanded(!expanded)} style={{ fontSize: '16px', color: '#0B85EA', cursor: 'pointer' }}/>
                        : <DownOutlined onClick={() => setExpanded(!expanded)} style={{ fontSize: '16px', color: '#0B85EA', cursor: 'pointer' }}/>}
                    </div>
                    {expanded && (
                        <div className={styles.cardcontent}>
                            <Descriptions column={3} bordered={false} size="middle">
                                <Descriptions.Item label="应用名称">
                                    <Tooltip title={listDatas?.markName} placement="topLeft">
                                        <span className={styles.appNameText}>
                                            {listDatas?.markName}
                                        </span>
                                    </Tooltip>
                                <Button
                                    type="primary"
                                    // size="small"
                                    icon={<PlayCircleOutlined style={{fontSize: '14px',color: '#fff'}} />}
                                    style={{ width: '86px',height: '28px',padding: '0 7px',marginLeft: 10, fontSize: '12px',color:'#fff',gap: '6px' }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // 防止触发折叠
                                        if(location.pathname === '/TaskCenter' || location.pathname === '/'){
                                            setPreviewDrawerOpen(true);
                                        }else{
                                            if (listDatas?.sceneType == 'base') {
                                                //  装配式预览
                                                openPreview(listDatas?.appName, listDatas?.appId, 'yy-base');
                                            } else if (listDatas?.sceneType == 'process') {
                                                //步骤引导式预览
                                                openPreview(listDatas?.appName, listDatas?.appId, 'Step-base');
                                            }
                                        }
                                    }}
                                >
                                    界面预览
                                </Button>
                                </Descriptions.Item>
                                <Descriptions.Item label="应用类别">{listDatas?.appCategory === '1' ? '生产应用' : '运营应用'}</Descriptions.Item>
                                <Descriptions.Item label="归属项目">{listDatas?.projectName}</Descriptions.Item>
                                <Descriptions.Item label="应用级别">{listDatas?.appLevel === '1' ? '一级应用' : '二级应用'}</Descriptions.Item>
                                <Descriptions.Item label="应用形式">{displayFormOptions.find((item:any) => item.value == listDatas?.sceneType)?.label}</Descriptions.Item>
                                <Descriptions.Item label="当前节点">{reviewStateOpt.filter(item=>item.value === listDatas?.reviewState)[0]?.label}</Descriptions.Item>
                                <Descriptions.Item label="运营部门">{listDatas?.frontStaffDept}</Descriptions.Item>
                                <Descriptions.Item label="前端应用纳管员">{listDatas?.frontStaff}</Descriptions.Item>
                                <Descriptions.Item label="版本号">{listDatas?.markVersion}</Descriptions.Item>
                                <Descriptions.Item label="状态">{statusOptions.find((item:any) => item.value == listDatas?.appStatus)?.label}</Descriptions.Item>
                                <Descriptions.Item label="技术负责人">{listDatas?.tecStaff}</Descriptions.Item>
                                <Descriptions.Item label="">{''}</Descriptions.Item>
                                <Descriptions.Item label="应用描述" span={3}>{listDatas?.desc}</Descriptions.Item>
                            </Descriptions>
                        </div>
                    )}
                </div>
                {/* 审核记录 */}
                <div className={styles.infocard}>
                    <div className={styles.cardheader}>
                        <div className={styles.titlea}>审核记录</div>
                        {recodeExpanded ?
                        <UpOutlined onClick={() => setRecodeExpanded(!recodeExpanded)} style={{ fontSize: '16px', color: '#0B85EA', cursor: 'pointer' }}/>
                        : <DownOutlined onClick={() => setRecodeExpanded(!recodeExpanded)} style={{ fontSize: '16px', color: '#0B85EA', cursor: 'pointer' }}/>}
                    </div>
                    {recodeExpanded && (
                        <>
                            <div className={styles.recodeContent}>
                                <div style={{ width: '138px' }}>审核环节</div>
                                <div style={{ width: '85px' }}>操作人</div>
                                <div style={{ width: '110px' }}>操作人工号</div>
                                <div style={{ width: '192px' }}>操作时间</div>
                                <div style={{ width: '136px' }}>用时</div>
                                <div style={{ flex: 1 }}>操作描述</div>
                            </div>
                            {recodeList.map((item:any,index:number) => (
                                <div className={styles.recodeItem} key={index}>
                                    <div style={{ width: '138px' }}>{reviewStateOpt.find((i:any) => i.value == item.reviewState)?.label}</div>
                                    <div style={{ width: '85px' }}>{item.opeStaffNm}</div>
                                    <div style={{ width: '110px' }}>{item.opeStaffId}</div>
                                    <div style={{ width: '192px' }}>{item.opeTime}</div>
                                    <div style={{ width: '136px' }}>{item.usedTime}</div>
                                    <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-all' }}>
                                        { item.reviewState === 'upSub' ? item.opeDesc.split(/(“菜单详情”按钮；)/g).map((str:any, stri: number) => {
                                            if (str === '“菜单详情”按钮；') {
                                            return (
                                                <a
                                                key={stri}
                                                href="javascript:void(0)"
                                                className="menu-detail-link"
                                                onClick={() =>  updeRef.current?.open(listDatas)}
                                                >
                                                菜单详情
                                                </a>
                                            );
                                            }
                                            return <span key={stri}>{str}</span>;
                                        }) : item.opeDesc}
                                        {Object.keys(JSON.parse(item.uploadFiles)).map((key, keyi) => (
                                            <div key={keyi}>
                                                {key === 'netSafe' ? '网络安全检查附件：' : key === 'dataSafe' ? '数据安全检查附件：' : '附件：' }
                                                {JSON.parse(item.uploadFiles)[key].length ? (JSON.parse(item.uploadFiles)[key][0].nm && (
                                                    <span
                                                        style={{
                                                            fontSize: 14,
                                                            color: '#0085D0',
                                                            cursor: 'pointer',
                                                            textDecoration: 'underline'
                                                        }}
                                                        onClick={() => downloadUploadedFile(JSON.parse(item.uploadFiles)[key][0])}
                                                    >
                                                        {JSON.parse(item.uploadFiles)[key][0].nm}
                                                        {/* <img src={new URL(`../applicationList/asset/downloadIcon.png`, import.meta.url).href} alt="" /> */}
                                                    </span>
                                                )) : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                {/* 审核意见 */}
                <div className={styles.infocard}>
                    <div className={styles.cardheader}>
                        <div className={styles.titlea}>审核意见</div>
                    </div>
                    {/* 审核结果 */}
                    <div className={styles.comment}>
                        <div className={styles.commentLeft}><span>审核结果:</span></div>
                        <div>
                            <Radio.Group
                                onChange={reviewResultChange}
                                value={reviewResult}
                                options={listDatas?.reviewState === 'once' ? [
                                    { value: '1', label: '同意', style: { lineHeight: '49px'} },
                                    { value: '0', label: '不同意', style: { lineHeight: '49px'} },
                                ] : [
                                    { value: '1', label: '同意', style: { lineHeight: '49px'} },
                                    { value: '0', label: '不同意', style: { lineHeight: '49px'} },
                                    { value: '2', label: '转派给指定人员', style: { lineHeight: '49px'} },
                                ]}
                            />
                            {reviewResult === '2' && (
                                <Select
                                    options={adminOptions}
                                    key={selectKey}
                                    open={open}
                                    value={transferStaffId}
                                    onChange={(value, option) => {
                                        setTransferStaffId(value);
                                        setTransferStaffNm(option.label.split('(')[0]);
                                        setOpen(false);
                                    }}
                                    onDropdownVisibleChange={() => {}}
                                    onClick={() => {}} // 阻止点击展开
                                    showSearch
                                    placeholder="请输入手机号码选择转派员工"
                                    loading={selectLoading}
                                    notFoundContent={selectLoading ? '加载中...' : '暂无数据'} // 自定义空状态
                                    onSearch={handleSearch}
                                    // 自定义后缀图标
                                    suffixIcon={
                                        <SearchOutlined
                                            style={{
                                                cursor: 'pointer',
                                                color: '#1890ff',
                                                fontSize: 16,
                                            }}
                                            onClick={handleIconClick}
                                        />
                                    }
                                />
                            )}
                        </div>
                    </div>
                    {/* 应用分类  分配省份 */}
                    { listDatas?.reviewState === 'up' && (
                        <>
                            <div className={styles.comment}>
                                <div className={styles.commentLeft}>
                                    <span>应用分类
                                        <Tooltip title="应用地图按此分类信息进行分类展示">
                                            <QuestionCircleOutlined />
                                        </Tooltip>:
                                    </span>
                                </div>
                                <div>
                                    <span style={{ paddingRight: '7px', lineHeight: '49px'}}>{appTypeName}</span>
                                    <span onClick={() => setModalVisible(true)} style={{ fontSize: '16px', cursor: 'pointer' }}>
                                        <img src={new URL(`../elementManagement/imgs/editIcon.png`, import.meta.url).href} alt="" />
                                    </span>
                                </div>
                            </div>
                            {listDatas?.appCategory === '1' && (
                                <div className={styles.comment}>
                                    <div className={styles.commentLeft}>
                                        <span>
                                            应用标签:
                                        </span>
                                    </div>
                                    <div>
                                        <div className={styles.tagContainer}>
                                            <div className={styles.tagsWrapper}>
                                                <div
                                                    ref={tagItemBoxRef}
                                                    className={styles.tagItemBox}
                                                >
                                                    {selTagTypeName ? (
                                                        <>
                                                            {selTagTypeName.split(',').slice(0, visibleCount ?? undefined).map((tagName, index) => (
                                                                <div
                                                                    key={`${tagName}-${index}`}
                                                                    className={styles.tagItem}
                                                                    title={tagName}
                                                                >
                                                                    <span>{tagName}</span>
                                                                    <CloseOutlined
                                                                        className={styles.tagCloseIcon}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveTag(index);
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}

                                                            {/* 省略号提示 */}
                                                            {visibleCount !== null && visibleCount < selTagTypeName.split(',').length && (
                                                                <Tooltip
                                                                    overlayClassName={styles.hiddenTagsTooltipOverlay}
                                                                    title={
                                                                        <div>
                                                                            {hiddenTags.map((tag, idx) => (
                                                                                <div key={tag.id} title={tag.name}>
                                                                                    <span>{tag.name}</span>
                                                                                    <CloseOutlined
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleRemoveHiddenTag(tag.originalIndex);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    }
                                                                    placement="bottomLeft"
                                                                >
                                                                    <div className={styles.overflowEllipsis}>
                                                                        ...
                                                                    </div>
                                                                </Tooltip>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className={styles.emptyTip}>
                                                            请选择应用标签
                                                        </span>
                                                    )}
                                                </div>

                                                <div
                                                    className={styles.tagSelector}
                                                    onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTagModalVisible(true);
                                                                        }}
                                                >
                                                    选择
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {listDatas?.appLevel === '1' && listDatas?.isCreateMenu === '1' && ( // 一级应用且生成菜单时显示分配省份
                                <>
                                    <div className={styles.comment}>
                                        <div className={styles.commentLeft}><span>分配省份:</span></div>
                                        <div style={{flex: '1', padding: '5px 0'}}>
                                            <Checkbox.Group
                                                onChange={onCheckChange}
                                                value={checkedList}
                                            >
                                                {/* 手动渲染全选选项 */}
                                                <Checkbox
                                                    value="all"
                                                    checked={isAllChecked}
                                                > 全选
                                                </Checkbox>
                                                {/* 渲染普通选项 */}
                                                {provinceSelectValue.map(option => (
                                                <Checkbox key={option.value} value={option.value}>
                                                    {option.label}
                                                </Checkbox>
                                                ))}
                                            </Checkbox.Group>
                                        </div>
                                    </div>
                                </>
                            )}
                            {/* 弹窗组件 */}
                            <Modal
                                title="选择应用分类"
                                open={modalVisible}
                                onCancel={() => setModalVisible(false)}
                                styles={modalStyles}
                                footer={null} // 移除默认底部按钮
                                width={650}
                                destroyOnClose // 关闭时销毁子元素
                            >
                                <CascadeSelect
                                    appCategory={''}
                                    appTypeId={appTypeId ? appTypeId : ''}
                                    appTypeList={appTypeList}
                                    onCancel={() => setModalVisible(false)}
                                    onSure={(data) => {
                                        setAppTypeName(data.appTypeName);
                                        setAppTypeId(data.appTypeId);
                                        setModalVisible(false);
                                    }}
                                />
                            </Modal>

                            {/* 应用标签弹窗 */}
                            <Modal
                                title="选择应用标签"
                                open={tagModalVisible}
                                onCancel={() => setTagModalVisible(false)}
                                styles={modalStyles}
                                footer={null} // 移除默认底部按钮
                                width={650}
                                destroyOnClose // 关闭时销毁子元素
                            >
                                <CascadeSelects
                                    appCategory={'1'}
                                    appTypeId={selTagTypeId ? selTagTypeId : ''}
                                    selectedTagIds={selTagTypeId ? selTagTypeId : ''}
                                    appTypeList={appTagList}
                                    onCancel={() => setTagModalVisible(false)}
                                    onSure={(data) => {
                                        setSelTagTypeName(data.appTypeName);
                                        setSelTagTypeId(data.appTypeId);
                                        setTagModalVisible(false);
                                    }}
                                />
                            </Modal>
                        </>
                    )}
                    {/* 前端应用纳管员 */}
                    { listDatas?.showArea !== '2' && listDatas?.reviewState === 'once' && (
                        <div className={styles.comment}>
                            <div className={styles.commentLeft}><span>前端应用纳管员:</span></div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', lineHeight: '49px' }}>
                                <Select
                                    style={{ width: '262px', margin: '9px 0 0 0' }}
                                    placeholder="请选择员工"
                                    value={frontendManagerId}
                                    onChange={(value, option) => {
                                        setFrontendManagerId(value);
                                        setFrontStaffNm(option.label);
                                    }}
                                    options={frontendManagerList}
                                />
                                <span style={{color: '#0B85EA', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    onClick={() => setAddManagerVisible(true)}
                                >+新增</span>

                                {/* 新增功能区域 - 右侧显示的手机号搜索下拉框 */}
                                {addManagerVisible && (
                                    <Select
                                        options={adminOptions}
                                        key={selectKey}
                                        open={open}
                                        value={transferStaffId}
                                        onChange={(value, option) => {
                                            setTransferStaffId(value);
                                            setTransferStaffNm(option.label);
                                            setOpen(false);
                                        }}
                                        onDropdownVisibleChange={() => {}}
                                        onClick={() => {}} // 阻止点击展开
                                        showSearch
                                        placeholder="请输入手机号码查询业务账号"
                                        loading={selectLoading}
                                        notFoundContent={selectLoading ? '加载中...' : '暂无数据'} // 自定义空状态
                                        onSearch={handleSearch}
                                        // 自定义后缀图标
                                        suffixIcon={<SearchOutlined onClick={handleIconClick} style={{cursor: 'pointer', color: '#1890ff', fontSize: 16}}/>}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                    {/* 审核意见 */}
                    <div className={styles.comment}>
                        <div className={styles.commentLeft}><span>审核意见:</span></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: '9px', paddingBottom: '14px' }}>
                            <div style={{width: '388px', height: '64px'}}>
                                <TextArea style={{ height: '100%', backgroundColor: '#fff', border: '1px solid #DCDCDC', borderRadius: '3px', }} placeholder="请填写审核意见"
                                maxLength={200} showCount
                                value={reviewComment}
                                onChange={(e)=>{setReviewComment(e.target.value)}} />
                            </div>
                            <div style={{ color: '#595959', fontSize: 12 }}>
                                <span onClick={()=>{ setReviewComment('请审核') }} style={{ cursor: 'pointer' }}>请审核</span>/
                                <span onClick={()=>{ setReviewComment('请协调配合') }} style={{ cursor: 'pointer' }}>请协调配合</span>/
                                <span onClick={()=>{ setReviewComment('请派发') }} style={{ cursor: 'pointer' }}>请派发</span>/
                                <span onClick={()=>{ setReviewComment('同意') }} style={{ cursor: 'pointer' }}>同意</span>/
                                <span onClick={()=>{ setReviewComment('不同意') }} style={{ cursor: 'pointer' }}>不同意</span>/
                                <span onClick={()=>{ setReviewComment('已阅') }} style={{ cursor: 'pointer' }}>已阅</span>/
                                <span onClick={()=>{ setReviewComment('请优先处理') }} style={{ cursor: 'pointer' }}>请优先处理</span>/
                            </div>
                        </div>
                    </div>
                    {/* 按钮*/}
                    <div className={styles.comment}>
                        <div className={styles.commentLeft}></div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', height: '83px' }}>
                            <Button loading={submitReviewLoading} onClick={submitReview} type="primary" style={{ width: '100px', height: '40px', borderRadius: '3px' }}>提交</Button>
                            <Button onClick={()=>{setDrawerOpen(false);resetData();}} style={{ width: '100px', height: '40px', borderRadius: '3px', color:'#646464' }}>取消</Button>
                        </div>
                    </div>
                </div>
            </Drawer>
            <DndProvider backend={HTML5Backend}>
                <Drawer
                    width="75vw"
                    title={listDatas?.appName}
                    className={styles.previewDrawer}
                    open={previewDrawerOpen}
                    onClose={() => {setPreviewDrawerOpen(false);}}
                    keyboard={false}
                    maskClosable={false}
                    rootClassName="custom-drawer-root"
                    destroyOnClose={true}
                >
                    <Preview id={listDatas?.appId} pageType={listDatas?.sceneType == 'base' ? 'yy-base' : 'Step-base'}/>
                </Drawer>
            </DndProvider>
            <Upcheckty
                onrefFun={() => {
                }}
                ref={updeRef}
            />
        </>
    );
}

export default forwardRef(reviewDrawer);
