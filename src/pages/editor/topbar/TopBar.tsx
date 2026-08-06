import { memo, useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { Button, Space, Modal, Tooltip } from 'antd';
import { EyeOutlined, SaveOutlined, FormOutlined, LeftOutlined } from '@ant-design/icons';
import CreatePage, { CreatePageRef } from '@/components/CreatePage';
import storage from '@/utils/storage';
import styles from './index.module.less';
import request from '../../../utils/request';
import AddComponentTemp from '../../templateManagement/componentTemp/addComponentTemp';
import AddBusponentTemp from '../../businessComponentManage/componentTemplateChoose/addBusponentTemp';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { message } from '@/utils/AntdGlobal';
import { Snapshot } from '@/utils/snapshot';
import recodeLog from '../../../utils/operLog';
import { crossApiUserInfo } from '../../../stores/crossapiStore';


interface BusinessData {
    businessId: string;
    businessName: string;
    businessCategory?: string;
    createStaffId?: string;
    createTime?: string;
    updateTime?: string;
    updateStaffId?: string;
    businessLevel?: string;
    parentId?: string;
}
/**
 * 编辑器顶部工具条
 */
export default memo(
    ({ canvasWidth, updateCanvas, pageRef }: { canvasWidth: string; updateCanvas: Dispatch<SetStateAction<string>>; pageRef: any }) => {
        const [loading, setLoading] = useState(false);
        const [businessData, setBusinessCategoryOptions] = useState<BusinessData[]>([]);
        const [dialogPage, setDialog] = useState<string | null>(null);
        const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
        const createRef = useRef<CreatePageRef>();
        const userInfo = crossApiUserInfo((state: any) => state.userInfo);

        const { snapshotUpload } = Snapshot();
        const { pageStore, pageType, mode, setMode } = useAppContext();
        const {
            baseInfo,
            config,
            componentId,
            id,
            name,
            remark,
            projectId,
            pageData,
            updatePageState,
            updateEditState,
            backComponentPage,
            updateConfig,
            clearPageInfo,
            refreshPageEvent
        } = pageStore(
            useShallow((state: any) => ({
            baseInfo: state.config,
            componentId: state.id,
            config: state.config,
            clearPageInfo: state.clearPageInfo,
            updateConfig: state.updateConfig1,
            id: state.page.id,
            name: state.page.name,
            remark: state.page.remark,
            refreshPageEvent: state.page.refreshPageEvent,
            projectId: state.page.projectId,
            pageData: state.page.pageData,
            updatePageState: state.updatePageState,
            updateEditState: state.updateEditState,
            backComponentPage: state.backComponentPage,
            }))
        );

        // 首次进入页面自动查询

        useEffect(() => {
            fetchBusinessCategoryOptions();
        }, []);
        // 获取业务分类选项
        const fetchBusinessCategoryOptions = () => {
            request
                .post('/appComponentBusiness/queryComponentBusinessList', { params: { provId: '' } })
                .then((res) => {
                    setBusinessCategoryOptions(res.beans);
                })
                .catch((err) => {
                    setBusinessCategoryOptions([]);
                });
        };
        interface componentListInterface {
            componentId: string;
            componentType: string;
            position: string;
        }
        const getComponentList = (elements: any) => {
            const _elements: any = [...elements];
            const componentList: componentListInterface[] = [];
            while (_elements.length > 0) {
                const item = _elements.shift();
                if (item) {
                    componentList.push({
                        componentId: item.id,
                        componentType: 'atom',
                        position: 'left',
                    });
                    if (item.elements && item.elements.length > 0) {
                        _elements.push(...item.elements);
                    }
                }
            }
            return componentList;
        };
        const getAtomList = () => {
            // atomList第一项是全局配置
            const atomList: any = [
                {
                    atomId: '0000',
                    atomType: '0000',
                    id: '0000',
                    pageType: '2',
                    provId: '00030021',
                    relationId: '',
                    serviceTypeId: 'jsytck',
                    staffId: 'JST5069',
                    contConfig: {
                        apis: pageData.apis,
                        config: pageData.config,
                        events: pageData.events,
                        // formData: pageData.formData,
                        interceptor: pageData.interceptor,
                        // variableData: pageData.variableData,
                        variables: pageData.variables,
                        apisGlobal: pageData.apisGlobal,
                        crossApisGlobal: pageData.crossApisGlobal,
                        componentList: getComponentList(pageData.elements),
                    },
                    contCss: {},
                    parentId: '0000',
                    parentIndex: '0',
                },
            ];
            for (let key in pageData.elementsMap) {
                const value = pageData.elementsMap[key];
                atomList.push({
                    atomId: value.id,
                    atomType: value.type,
                    id: value.id,
                    pageType: '2',
                    provId: '00030021',
                    relationId: '',
                    serviceTypeId: 'jsytck',
                    staffId: 'JST5069',
                    contConfig: {
                        config: value.config,
                        events: value.events,
                        methods: value.methods,
                        nodeId: value.id,
                        parentId: value.parentId,
                        param: value.param,
                    },
                    contCss: { name: value.name },
                    parentId: value.parentId,
                    parentIndex: '0',
                });
            }
            return atomList;
        };
        const componentStatusMap: string[] = ['', '3', '1', '1'];

        // 控制弹窗显示状态
        const [modalAppBaseVisible, setModalAppBaseVisible] = useState(false);

        // 关闭弹窗
        const handleCloseAppBaseModal = () => {
            setModalAppBaseVisible(false);
        };

        //编辑页面
        const editPageData = () => {
            setModalAppBaseVisible(true);
            if (config.dataType == '1') {
                //业务组件
                setDialog('1');
            } else if (config.dataType == '3') {
                //模板
                setDialog('2');
            }
        };

        const modalStyles = {
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

        const editBaseInfo = (baseInfo: any) => {
            updateConfig(baseInfo, baseInfo.id);
        };

        const savePrefabricated = useCallback(async (atomList: any) => {
            const params = {
                id: '',
                provId: baseInfo.provId,
                serviceTypeId: baseInfo.serviceTypeId,
                staffId: baseInfo.staffId,
                appName: baseInfo.appName, // 应用名称
                appTypeId: baseInfo.appTypeId, // 应用分类ID
                appCategory: baseInfo.appCategory, // 应用类别
                appLevel: baseInfo.appLevel, // 应用级别
                belongModule: baseInfo.belongModule, // 归属模块
                sceneType: baseInfo.sceneType, // 展示形式（方案类型）
                appDesc: baseInfo.appDesc, // 应用备注
                dataType: baseInfo.dataType || '1', // 1 应用 2 应用模板
                appStatus: '1', //1:保存草稿,2:保存,3:提交审核
                sceneData: '',
                appPicture: '', // 快照缩略图
                refreshPageEvent: refreshPageEvent
            };
            const sceneData = {
                atomList: JSON.stringify(atomList),
                componentList: getComponentList(pageData.elements),
            };
            params.sceneData = JSON.stringify(sceneData);
            componentId && (params.id = componentId);
            //保存时生成快照，获取图片的oss地址
            try {
                snapshotUpload(pageRef, {}, 'fileupload', { type: 'image' }).then((appPicture: any) => {
                    appPicture && (params.appPicture = appPicture);
                    request.post('/app/saveAppInfo', { params: params }).then((result) => {
                        if (result.returnCode == '0') {
                            clearPageInfo();
                            backComponentPage('0');
                            const _p = {
                                provId: baseInfo.provId, // 省份编号
                                serviceTypeId: baseInfo.serviceTypeId, // 业务系统编号
                                createStaffId: baseInfo.staffId, // 坐席工号
                                dataSource: '1', // 数据来源
                                relationId: componentId ? componentId : result.bean.id, // 关联ID
                                dataName: baseInfo.appName,
                                dataType: baseInfo ? baseInfo.dataType : '',
                                dataDesc: baseInfo.appDesc,
                                auditDesc: '已完成应用编辑，请审批',
                            };
                            request.post('/solutionAudit/insertSolutionAudit', {
                                params: _p,
                            });
                        }
                        setLoading(false);
                    });
                    updateEditState(false);
                    updatePageState({ env: 'all' });
                });
            } catch (error) {
                setLoading(false);
                updateEditState(false);
                updatePageState({ env: 'all' });
            }
        }, [baseInfo, pageData, pageRef, componentId, refreshPageEvent]);

        const saveBusinessComponent = useCallback(async (atomList: any) => {
            const data = {
                ...config,
                id: '',
                componentStatus: componentStatusMap[parseInt(config.componentLevel)] || '1',
                auditStatus: '0',
                atomList: JSON.stringify(atomList),
                refreshPageEvent: refreshPageEvent,
            };
            componentId && (data.id = componentId);

            // 添加创建人姓名和部门
            if (config.id === '') {
                data.createStaffName = userInfo.staffName || '';
                data.createOrgaId = userInfo.orgaId || userInfo.deptId || '';
                data.createOrgaName = userInfo.orgaName || userInfo.deptName || '';
            }
            try {
                //保存时生成快照，获取图片的oss地址
                snapshotUpload(pageRef, {}, 'fileupload', { type: 'image' }).then((componentPicture: any) => {
                    componentPicture && (data.componentPicture = componentPicture);
                    request.post('/appComponent/saveAppComponent', { params: data }).then((result) => {
                        if (result.returnCode == '0') {
                            const _p = {
                                provId: baseInfo.provId, // 省份编号
                                serviceTypeId: baseInfo.serviceTypeId, // 业务系统编号
                                createStaffId: baseInfo.staffId, // 坐席工号
                                dataSource: '2', // 数据来源
                                relationId: componentId ? componentId : result.bean.id, // 关联ID
                                dataName: config.componentName,
                                dataType: baseInfo.businessId,
                                dataDesc: config.componentDesc,
                                auditDesc: '已完成业务组件编辑，请审批',
                            };
                            // 无需审核的不调用该请求
                            if (data.componentStatus !== '1') {
                                request.post('/solutionAudit/insertSolutionAudit', {
                                    params: _p,
                                });
                            }
                            clearPageInfo();
                            backComponentPage('0');
                            const logParams = {
                                provCode: baseInfo.provId, // 8位省份编码
                                modelName: '', // 所属模块  暂时为空
                                pageName: '', // 所属菜单   暂时为空
                                dataType: `业务组件${config.dataType === '3' ? '模板' : ''}`, // 数据类型（应用、元素、组件、接口）
                                operType: componentId ? '编辑' : '新增', // 操作类型（新增/编辑/删除/导入）
                                dataId: componentId || '', // 操作数据ID
                                dataName: config.componentName, // 操作数据名称
                                editContent: `${(componentId ? '编辑' : '新增') + config.componentName}业务组件${config.dataType === '3' ? '模板' : ''
                                    }`, // 操作内容简述
                                staffId: baseInfo.staffId, // 操作人工号
                            };
                            recodeLog(logParams);
                        }
                        setLoading(false);
                    });
                    updateEditState(false);
                    updatePageState({ env: 'all' });
                });
            } finally {
                setLoading(false);
                updateEditState(false);
                updatePageState({ env: 'all' });
            }
        }, [baseInfo, pageData, pageRef, componentId, config, refreshPageEvent]);

        // 执行保存页面数据的实际逻辑
        const executeSavePageData = useCallback(async () => {
            const atomList = getAtomList();
            // 第一项是全局配置，所以长度为1表示没有数据；
            if (atomList.length == 1) {
                message.info(`请添加元素或业务组件`);
                setLoading(false);
                return;
            }
            try {
                if (pageType == 'YYBPZPS') {
                    await savePrefabricated(atomList); // 保存应用
                } else {
                    await saveBusinessComponent(atomList); // 保存业务组件
                }
            } catch (error) {
                console.error('保存失败:', error);
                setLoading(false);
            }
        }, [pageType, savePrefabricated, saveBusinessComponent]);

        // 保存页面数据（带防抖）
        const savePageData = useCallback(() => {
            // 清除之前的定时器
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // 立即设置loading状态
            setLoading(true);

            // 设置新的定时器
            debounceTimerRef.current = setTimeout(() => {
                executeSavePageData();
            }, 5000);
        }, [executeSavePageData]);

        return (
            <>
                <div className={`${styles.designerBar} ${mode === 'preview' ? styles.hidden : ''}`}>
                    <span className={styles.componentNameArea}>
                        <Button type="text" icon={<LeftOutlined />} onClick={() => backComponentPage('0')}>
                            返回
                        </Button>
                        <Tooltip placement="top" title={config.componentName}>
                            <span className={styles.componentNameText}>{config.componentName}</span>
                        </Tooltip>
                        <Button type="text" icon={<FormOutlined />} onClick={editPageData} loading={loading}></Button>
                    </span>
                    <Space>
                        <Button type="text" icon={<SaveOutlined />} onClick={savePageData} loading={loading}>
                            保存
                        </Button>
                        <Button type="text" icon={<EyeOutlined />} onClick={() => setMode('preview')}>
                            预览
                        </Button>
                    </Space>

                    {/* 弹窗组件 */}
                    <Modal
                        className={styles.addTempModal}
                        title={dialogPage === '1' ? '编辑业务组件' : '编辑业务组件模板'}
                        open={modalAppBaseVisible}
                        onCancel={handleCloseAppBaseModal}
                        styles={modalStyles}
                        footer={null} // 移除默认底部按钮
                        width={800}
                        maskClosable={false} // 设置为false，点击遮罩不关闭
                        destroyOnClose // 关闭时销毁子元素
                    >
                        {/* 业务组件 */}
                        {dialogPage === '1' && (
                            <AddBusponentTemp
                                componentData={{
                                    ...config,
                                }}
                                cancelEvent={handleCloseAppBaseModal}
                                editconfirmEvent={editBaseInfo}
                                businessListData={businessData}
                                editData={config}
                            />
                        )}
                        {/* 组件模板 */}
                        {dialogPage === '2' && (
                            <AddComponentTemp
                                onReset={handleCloseAppBaseModal}
                                onSearch={handleCloseAppBaseModal}
                                editconfirmEvent={editBaseInfo}
                                businessData={businessData}
                                editData={config}
                                bannedCheckFlag={true}
                            />
                        )}
                    </Modal>
                </div>
                {/* 修改页面 */}
                <CreatePage createRef={createRef} />
            </>
        );
    },
);
