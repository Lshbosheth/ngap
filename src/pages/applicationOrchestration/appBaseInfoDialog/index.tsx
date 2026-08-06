import React, { useState, useEffect, useRef } from 'react';
import { Input, Select, Button, Modal, Col, Spin, Tooltip } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { CloseOutlined, AlertOutlined, QuestionCircleOutlined, CloseCircleOutlined, MoreOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import { OptionItem, AppTemptypeData } from '../appOrchestrationTypes';
import AppCategory from '../appCategory';
import { publictData } from '../../../utils/appMenuData';
import { fromPairs } from 'lodash-es';
import CascadeSelect from '../CascadeSelect';
import CascadeSelects from '../CascadeSelects';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import request from '../../../utils/request';
import MultilevelIntentionSelectDialog from '../MultilevelIntentionSelect';
const { TextArea } = Input;

const { Option } = Select;

interface appTempData {
    provId?: string;
    serviceTypeId?: string;
    staffId?: string;
    appName: string; // 应用名称
    appTypeId?: string; // 应用分类ID
    appTypeName?: string; // 应用分类名称
    appCategory: string; // 应用类别
    appLevel: string; // 应用级别
    belongModule?: string; // 归属模块
    tagTypeId?: string; // 应用标签ID
    tagTypeName?: string; // 应用标签名称
    projectId?:string;
    sceneType: string; // 展示形式（方案类型）
    appDesc: string; // 应用备注
    showArea?: string;
    sceneTypeNm?: string; // 场景名称
    sceneTypeId?: string; // 场景名称ID
}
interface BaseInfo {
    appCategory: string; // 应用类别
    sceneType: string; // 展示形式（方案类型）
    appName?: string;
    appLevel?: string;
    belongModule?: string;
    tagTypeId?: string;
    tagTypeName?: string;
    projectId?:string;
    appDesc?: string;
    appTypeId?: string;
    sceneTypeNm?: string;
    sceneTypeId?: string;
}
interface DialogProps {
    onSearch: (values: any) => void;
    onReset: () => void;
    editconfirmEvent?: (data: any) => void;
    baseInfo: BaseInfo;
    appTypeList: AppTemptypeData[];
    editData?: appTempData;
    showTitleBox?: boolean; // 是否显示标题提示框
}

const AppBaseInfoDialog: React.FC<DialogProps> = ({ onSearch, onReset, editconfirmEvent, baseInfo, appTypeList, editData, showTitleBox = false }) => {
    // 获取中心权限
    const [ngshCenterPermission, setNgshCenterPermission] = useState<string>('0');
     const [appLevelab, setappLevelab] = useState<string>('0');
    const [modalVisible, setModalVisible] = useState(false);
    
    // 应用标签列表数据
    const [appTagList, setAppTagList] = useState<AppTemptypeData[]>([]);
    
    // 标签溢出检测相关状态
    const tagItemBoxRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState<number | null>(null);
    const [hiddenTags, setHiddenTags] = useState<{name: string, id: string, originalIndex: number}[]>([]);
    // 用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const [options, setOptions] = useState<appTempData>({
        provId: userInfo.provinceId,
        serviceTypeId: userInfo.serviceTypeId,
        staffId: userInfo.staffId,
        appName: baseInfo.appName ? baseInfo.appName : '', // 应用名称
        appTypeId: baseInfo.appTypeId ? baseInfo.appTypeId : '', // 应用分类ID
        appTypeName: '', // 应用分类名称
        belongModule: baseInfo.belongModule ? baseInfo.belongModule : '', // 归属模块
        tagTypeId: baseInfo.tagTypeId ? baseInfo.tagTypeId : '', // 应用标签ID 2604181542280100014,2604181557160100015,2604181557280100016,2604181557380100017,2604221030560100019
        tagTypeName: '', // 应用标签名称
        projectId:baseInfo.projectId ? baseInfo.projectId : '', // 归属模块
        appDesc: baseInfo.appDesc ? baseInfo.appDesc : '', // 应用备注
        ...baseInfo,
        appLevel: baseInfo.appLevel === '1' ? baseInfo.appLevel : '2', // 应用级别
        showArea: '1',  // 展示区域
        sceneTypeNm: baseInfo.sceneTypeNm ? baseInfo.sceneTypeNm : '',  // 场景名称
        sceneTypeId: baseInfo.sceneTypeId ? baseInfo.sceneTypeId : '',  // 场景名称Id
        ...editData,
    });
    const [tagModalVisible, setTagModalVisible] = useState(false); // 应用标签弹窗状态
    const [currentCategoryType, setCurrentCategoryType] = useState<string>('');

    const [isOpenAppType, setIsOpenAppType] = useState<boolean>(false);
    // 场景名称弹窗
    const [dialogVisible, setDialogVisible] = useState(false);

    const closeDialog = () => {
        onReset();
    };

    const saveTempData = () => {
        if (!options.appName) {
            message.error('请输入应用名称！');
            return;
        }
        if (!options.appLevel) {
            message.error('请选择应用级别！');
            return;
        }
        if (!options.appTypeId) {
            message.error('请选择应用分类！');
            return;
        }
        if (!options.tagTypeId && options.appCategory === '1') {
            message.error('请选择应用标签！');
            return;
        }
        if (!options.projectId) {
            message.error('请选择归属项目！');
            return;
        }
        if (!options.appDesc) {
            message.error('请输入应用描述！');
            return;
        }

        if (editData) {
            editconfirmEvent && editconfirmEvent(options);
            onReset();
        } else {
            onSearch(options);
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

    const [activityData, setactivityData] = useState([]);
    // 查询应用标签列表
    const queryAppTagList = () => {
        request
            .post('/appType/queryAppTypeList', { params: { categoryType: '2' } })
            .then((res) => {
                if (res?.beans) {
                    setAppTagList(res.beans);
                    // 根据tagTypeId匹配tagTypeName
                    if (baseInfo.tagTypeId) {
                        const tagIds = baseInfo.tagTypeId.split(',');
                        const tagNames = tagIds.map(id => {
                            const tag = res.beans.find((item: AppTemptypeData) => item.appTypeId === id);
                            return tag ? tag.appTypeName : '';
                        }).filter(name => name);
                        
                        setOptions((prev) => ({
                            ...prev,
                            tagTypeName: tagNames.join(',')
                        }));
                    }
                }
            })
            .catch((err) => {
                console.error('查询应用标签列表失败:', err);
            });
    };

    useEffect(() => {
        setappLevelab('1')
        if(userInfo.provinceId === '0000'){
            setOptions((prev)=>({
                ...prev,
                appLevel:'1'
            }))
        }else{
            setOptions((prev)=>({
                ...prev,
                appLevel:'2'
            }))
        }
        queryActSearch();
        if (baseInfo.tagTypeId) {
            queryAppTagList()
        }
    },[])
     // 查询项目表格查询
    const queryActSearch = () => {
        const params = {
            staffId: userInfo.staffId,
            isAdmin: userInfo.isAdmin,
            serviceTypeIds: userInfo.serviceTypeId
        };
        request
            .post('/app/querySeatTenantList', {params})
            .then((res) => {
                if(res?.beans?.length>0){
                    res?.beans?.unshift({
                        projectId:'',
                        projectNm: '请选择'
                    })
                    let NewArr = res?.beans?.map((item: any, index: number) => ({
                        value: item.projectId,
                        label: item.projectNm,
                    }));
                    setactivityData(NewArr);
                }
            })
            .catch((err) => {
            });
    };
    // 根据传入的应用ID获取应用名称
    useEffect(() => {
        const appTypeNames: string[] = [];
        getAppTypeNameById(appTypeNames, baseInfo.appTypeId);
        setOptions((prev) => ({
            ...prev,
            appTypeName: appTypeNames.join('-'), // 应用名称
        }));
    }, [baseInfo.appTypeId]);

    // 递归查询所有父级Name
    const getAppTypeNameById = (result: string[], appTypeId?: string): void => {
        const item = appTypeList.find((i) => i.appTypeId === appTypeId);
        if (item) {
            result.unshift(item.appTypeName);
            if (item.pId) {
                getAppTypeNameById(result, item.pId);
            }
        }
    };

    // 组件名称
    const appNameChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setOptions((prev) => ({
            ...prev,
            appName: value,
        }));
    };
    // 组件描述
    const appDescChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setOptions((prev) => ({
            ...prev,
            appDesc: value,
        }));
    };
    // 归属模块
    const belongModuleChange = (value: string) => {
        setOptions((prev) => ({
            ...prev,
            belongModule: value,
        }));
    };

    // 应用标签
    const appTagsChange = (data: any) => {
        setOptions((prev) => ({
            ...prev,
            tagTypeId: data.tagTypeId,
            tagTypeName: data.tagTypeName,
        }));
    };
    // 归属项目
    const activitymanChange = (value: string) => {
        setOptions((prev) => ({
            ...prev,
            projectId: value,
        }));
    };

    // 删除单个标签
    const handleRemoveTag = (index: number) => {
        const tagIdsArray = options.tagTypeId?.split(',') || [];
        const tagNamesArray = options.tagTypeName?.split(',') || [];
        
        tagIdsArray.splice(index, 1);
        tagNamesArray.splice(index, 1);
        
        setOptions((prev) => ({
            ...prev,
            tagTypeId: tagIdsArray.join(','),
            tagTypeName: tagNamesArray.join(','),
        }));
    };

    // 检测标签溢出并计算可见标签数量
    useEffect(() => {
        const calculateVisibleTags = () => {
            if (tagItemBoxRef.current && options.tagTypeName) {
                const tagNames = options.tagTypeName.split(',');
                const tagIds = options.tagTypeId?.split(',') || [];
                const maxWidth = 500;
                const ellipsisWidth = 30; // 省略号大约宽度
                
                let visibleTags = 0;
                let currentWidth = 0;
                
                const tagElements = tagItemBoxRef.current.querySelectorAll(`.${styles.tagItem}`);
                
                tagElements.forEach((element, index) => {
                    const tagWidth = (element as HTMLElement).offsetWidth;
                    const newWidth = currentWidth + tagWidth;
                    
                    // 检查加上这个标签和省略号是否会超出容器
                    if (newWidth + ellipsisWidth <= maxWidth) {
                        visibleTags++;
                        currentWidth = newWidth;
                    } else {
                        return false; // 停止遍历
                    }
                });
                
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
            } else {
                setVisibleCount(null);
                setHiddenTags([]);
            }
        };

        // 延迟执行，确保DOM已经渲染
        setTimeout(calculateVisibleTags, 100);

        // 监听窗口大小变化
        window.addEventListener('resize', calculateVisibleTags);
        
        return () => {
            window.removeEventListener('resize', calculateVisibleTags);
        };
    }, [options.tagTypeName, options.tagTypeId]);

    // 从隐藏标签中删除指定标签
    const handleRemoveHiddenTag = (originalIndex: number) => {
        handleRemoveTag(originalIndex);
    };
    
    // 公共数据取用 应用类别 应用形式 归属模块  展示区域
    const { appCategoryArr, showFormArr, appBelongModuleArr, showAreaArr, provinceSelectValue } = publictData;
    // 应用级别(应用列表页)
    const appListLevelArr: OptionItem[] = [
        { label: '中心一级', value: '1', id: '1' },
        { label: '分中心二级', value: '2', id: '2' },
    ];
    const randerAppCategory = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const activeClass = options.appCategory === item.value ? 'active' : '';
            return (
                <span className={styles[activeClass]} key={item.value}>
                    {item.label}
                </span>
            );
        });
    };
    const randerShowForm = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const activeClass = options.sceneType === item.value ? 'active' : '';
            return (
                <span className={styles[activeClass]} key={item.value}>
                    {item.label}
                </span>
            );
        });
    };
    const randerShowArea = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const activeClass = options.showArea === item.value ? 'active' : '';
            return (
                <span className={styles[activeClass]} key={item.value} onClick={()=>{handleAreaClick(item)}}>
                    {item.label}
                </span>
            );
        });
    };
    const handleAreaClick = (item: OptionItem) => {
        if(editData) return;
        setOptions((prev) => ({
            ...prev,
            showArea: item.value,
        }));
    };

    const randerAppLevel = () => {
        let diableClass = ngshCenterPermission === '1' ? 'disabled' : '';
         diableClass = appLevelab === '1' ? 'disabled' : '';
        return (
            <div className={[styles.defaultParam, styles.appLevel, styles[diableClass]].join(' ')}>
                {appListLevelArr.map((item: OptionItem) => {
                    const activeClass = options.appLevel === item.value ? 'active' : '';
                    return (
                        <span
                            key={item.value}
                            className={styles[activeClass]}
                            // onClick={() => {
                            //     handleLevelClick(item);
                            // }}
                        >
                            {item.label}
                        </span>
                    );
                })}
            </div>
        );
    };
    const handleLevelClick = (item: OptionItem) => {
        setOptions((prev) => ({
            ...prev,
            appLevel: item.value,
        }));
    };

    // 打开编辑应用分类弹窗
    const handleOpenAppTypeModal = (categoryType?: string) => {
        setCurrentCategoryType(categoryType || '');
        setIsOpenAppType(true);
    };

    // 关闭编辑应用分类弹窗
    const handleCloseAppTypeModal = () => {
        setIsOpenAppType(false);
        setCurrentCategoryType('');
    };

    return (
        <div className={styles.appBaseInfoDialog}>
            <div className={styles.appBaseInfoCont}>
                {showTitleBox && (
                    <div className={styles.titleBox}>
                        <AlertOutlined />
                        <span style={{ paddingLeft: '5px' }}>
                            温馨提示：下述内容为原始应用基础信息字段回显内容，请结合当前业务需要选择性修改。
                        </span>
                    </div>
                )}
                <div className={styles['app_modules']}>
                    <label id="applyNameCont">
                        <i className={styles['icon-config']}>*</i>应用名称：
                    </label>
                    <div className="appName">
                        <Input name="appName" value={options.appName} placeholder="请输入" onChange={appNameChange} />
                    </div>
                </div>
                <div className={styles['app_modules']}>
                    <label>
                        <i className={styles['icon-config']}>*</i>应用类别：
                    </label>

                    <div className={[styles.defaultParam, styles.appCategory, styles.disabled].join(' ')}>{randerAppCategory(appCategoryArr)}</div>
                </div>
                <div className={[`${styles['app_modules']}`, styles.appLevelCont].join(' ')}>
                    <label>
                        <i className={styles['icon-config']}>*</i>应用级别：
                    </label>
                    {/* <div className="defaultParam appLevel">
                        <span level="1">中心一级</span>
                        <span level="2">分中心二级</span>
                    </div> */}
                    {randerAppLevel()}
                </div>

                {options.appCategory === '1' && (
                    <div className={[styles['app_modules'], styles.disabled].join(' ')}>
                        <label>
                            <i className={styles['icon-config']}>*</i>应用形式：
                        </label>
                        <div className={[styles.defaultParam, styles.appFormat, styles.disabled].join(' ')}>{randerShowForm(showFormArr)}</div>
                    </div>
                )}
                {/* 展示区域 */}
                {options.appCategory === '1' && (
                    <div className={styles['app_modules']}>
                        <label>
                            <i className={styles['icon-config']}>*</i>展示区域
                            <Tooltip title="展示区域在主视图，可作为全部菜单在主框架上进行展示，在辅助视图区域，可在框架右侧伴随区或负一屏中展示">
                                <QuestionCircleOutlined />
                            </Tooltip>:
                        </label>
                        <div className={[styles.defaultParam, styles.appFormat, editData ? styles.disabled : ''].join(' ')}>{randerShowArea(showAreaArr.slice(1))}</div>
                    </div>
                )}

                <div className={styles['app_modules']}>
                    <label>
                        <i className={styles['icon-config']}>*</i>应用分类：
                    </label>
                    <div style={{ position: 'relative', width: 'calc(100% - 170px)' }}>
                        <Input
                            name="appType"
                            placeholder="请选择应用分类"
                            value={options.appTypeName}
                            readOnly
                            onClick={() => setModalVisible(true)}
                        />
                        <div
                            className={styles.appTypeSelector}
                            onClick={() => setModalVisible(true)}
                        >
                            选择
                        </div>
                        
                        {/* 弹窗组件 */}
                        <Modal
                            className={styles.addTempModal}
                            title="选择应用分类"
                            open={modalVisible}
                            onCancel={() => setModalVisible(false)}
                            styles={modalStyles}
                            footer={null}
                            width={650}
                            destroyOnClose
                        >
                            <CascadeSelect
                                appCategory={options.appCategory}
                                appTypeId={options.appTypeId ? options.appTypeId : ''}
                                appTypeList={appTypeList}
                                onCancel={() => setModalVisible(false)}
                                onSure={(data) => {
                                    setOptions((prev) => ({
                                        ...prev,
                                        appTypeName: data.appTypeName,
                                        appTypeId: data.appTypeId,
                                    }));
                                    setModalVisible(false);
                                }}
                            />
                        </Modal>
                    </div>
                    <button className={styles.addAppTypeBtn} style={{ display: 'none' }} onClick={() => handleOpenAppTypeModal()}>
                        +应用分类
                    </button>
                </div>
                {options.appCategory === '1' && (
                    <div className={styles['app_modules']}>
                        <label>
                            <i className={styles['icon-config']}>*</i>应用标签
                            <Tooltip title="应用标签是为当前应用添加场景标签信息，方便在应用地图中快速筛选及定位查找">
                                <QuestionCircleOutlined />
                            </Tooltip>:
                        </label>
                        <div className={styles.tagContainer}>
                            <div className={styles.tagsWrapper}>
                                <div className={styles.tagItemBox} ref={tagItemBoxRef}>
                                    {options.tagTypeName ? (() => {
                                        const tagNames = options.tagTypeName?.split(',');
                                        const tagIds = options.tagTypeId?.split(',') || [];
                                        
                                        // 计算要显示的标签数量
                                        const displayCount = visibleCount !== null ? visibleCount : tagNames.length;
                                        
                                        return (
                                            <>
                                                {/* 只渲染可见的标签 */}
                                                {tagNames.slice(0, displayCount).map((tagName, index) => {
                                                    const tagId = tagIds[index];
                                                    return (
                                                        <div key={tagId || index} className={styles.tagItem} title={tagName}>
                                                            <span>{tagName}</span>
                                                            <CloseOutlined
                                                                className={styles.tagCloseIcon}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveTag(index);
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                                
                                                {/* 溢出时显示省略号 */}
                                                {visibleCount !== null && hiddenTags.length > 0 && (
                                                    <Tooltip
                                                        title={
                                                            <div className={styles.hiddenTagsTooltip}>
                                                                {hiddenTags.map((tag) => (
                                                                    <div key={tag.id} className={styles.hiddenTagItem} title={tag.name}>
                                                                        <span>{tag.name}</span>
                                                                        <CloseOutlined
                                                                            className={styles.hiddenTagCloseIcon}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRemoveHiddenTag(tag.originalIndex);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        }
                                                        placement="topRight"
                                                        overlayClassName={styles.hiddenTagsTooltipOverlay}
                                                    >
                                                        <span className={styles.overflowEllipsis}>...</span>
                                                    </Tooltip>
                                                )}
                                            </>
                                        );
                                    })() : <span className={styles.emptyTip}>请选择应用标签</span>}
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
                            
                            {/* 应用标签弹窗组件 */}
                            <Modal
                                className={styles.addTempModal}
                                title="选择应用标签"
                                open={tagModalVisible}
                                onCancel={() => setTagModalVisible(false)}
                                styles={modalStyles}
                                footer={null}
                                width={650}
                                destroyOnClose
                            >
                                <CascadeSelects
                                    appCategory={options.appCategory}
                                    appTypeId={options.tagTypeId ? options.tagTypeId : ''}
                                    appTypeList={appTypeList}
                                    selectedTagIds={options.tagTypeId ? options.tagTypeId : ''}
                                    onCancel={() => setTagModalVisible(false)}
                                    onSure={(data) => {
                                        appTagsChange({
                                            tagTypeId: data.appTypeId,
                                            tagTypeName: data.appTypeName,
                                        });
                                        setTagModalVisible(false);
                                    }}
                                />
                            </Modal>
                        </div>
                        <button className={styles.addAppTypeBtn} style={{ display: 'none' }} onClick={() => handleOpenAppTypeModal('2')}>
                            +标签分类
                        </button>
                    </div>
                )}
                <div className={styles['app_modules']}>
                    <label>归属模块：</label>
                    <div className="belongModule">
                        <Select
                            className={styles.belongModuleSelect}
                            placeholder="请选择"
                            value={options.belongModule}
                            options={appBelongModuleArr}
                            onChange={belongModuleChange}
                        ></Select>
                    </div>
                </div>
                <div className={styles['app_modules']}>
                    <label>
                        <i className={styles['icon-config']}>*</i>
                        归属项目：
                    </label>
                    <div className="projectId">
                        <Select
                            className={styles.belongModuleSelect}
                            placeholder="请选择"
                            value={options.projectId}
                            options={activityData}
                            onChange={activitymanChange}
                        ></Select>
                    </div>
                </div>
                <div className={styles['app_modules']}>
                    <label id="applDesc">
                        <i className={styles['icon-config']}>*</i>应用描述：
                    </label>
                    <div className="appDesc">
                        <Input name="appDesc" value={options.appDesc} placeholder="应用概述、核心功能、适用场景" onChange={appDescChange} />
                    </div>
                </div>
                {provinceSelectValue.some(item => item.value === userInfo.provinceId) && (
                    <div className={styles['app_modules']}>
                        <label>
                            场景名称
                            <Tooltip title="关联意图后，可将应用纳入人机协同报表统计范畴">
                                <QuestionCircleOutlined />
                            </Tooltip>:
                        </label>
                        <div style={{ position: 'relative', width: 'calc(100% - 170px)' }}>
                            <Input
                                name="sceneTypeNm"
                                placeholder="请选择"
                                value={options.sceneTypeNm}
                                readOnly
                                onClick={() => setDialogVisible(true)}
                            />
                            <div
                                className={styles.appTypeSelector}
                                onClick={() => setDialogVisible(true)}
                            >
                                选择
                            </div>

                            <MultilevelIntentionSelectDialog
                                visible={dialogVisible}
                                onClose={() => setDialogVisible(false)}
                                onSelect={(node) => {
                                    setOptions((prev) => ({
                                        ...prev,
                                        sceneTypeNm: node ? node.name : undefined,
                                        sceneTypeId: node ? node.id : undefined,
                                    }));
                                    setDialogVisible(false);
                                }}
                                provinceId={userInfo.provinceId}
                                defaultSelectedId={options.sceneTypeId}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.busiButton}>
                <Button type="primary" onClick={saveTempData} style={{ marginRight: 8 }}>
                    确定
                </Button>
                <Button onClick={closeDialog}>取消</Button>
            </div>
            {isOpenAppType && <AppCategory onClose={handleCloseAppTypeModal} appCategory={options.appCategory} categoryType={currentCategoryType} />}
        </div>
    );
};

export default AppBaseInfoDialog;
