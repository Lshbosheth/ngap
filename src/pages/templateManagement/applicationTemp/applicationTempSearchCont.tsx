import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Row, Col, Spin, Modal } from 'antd';
import { publictData } from '../../../utils/appMenuData';
import { OptionItem, appTempFormData, componentTempData, appTempData } from '../templateManageTypes';
import AddApplyComponentTemp from './addApplyponentTemp';
import { useShallow } from 'zustand/react/shallow';
// import { useAppContext } from '@/utils/AppProvider';
import { crossApiUserInfo } from '@/stores/crossapiStore';

import request from '@/utils/request';

import styles from '../index.module.less';

const { Option } = Select;

interface SearchFormProps {
    onSearch: (values: appTempFormData) => void;
    onReset: () => void;
    confirmEvent: (data: appTempData) => void;
}

interface ListItem {
    pId?: string;
    typeLevel?: string;
    appTypeCategory?: string;
    appTypeName?: string;
    appTypeId?: string;
    value: string;
    label: string;
    id: string;
}

const ApplicationTempSearchCont: React.FC<SearchFormProps> = ({ onSearch, onReset, confirmEvent }) => {
    const [options, setOptions] = useState<{
        appCategoryOption: OptionItem[]; // 应用模板类别
        showFormOption: OptionItem[]; // 应用形式
    }>({
        appCategoryOption: [], // 应用模板类别
        showFormOption: [], // 应用形式
    });

    const [appType, setApptyepOptions] = useState<{
        appTypeOption: OptionItem[]; // 应用分类
    }>({
        appTypeOption: [], // 应用分类
    });
    const [appTypeId, setAppTypeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [appTypeList, setAppTypeList] = useState<any[]>([]);
    const [appTypeArry, setAppTypeArry] = useState<ListItem[]>([]);

    const [appTempForm, setAppTempForm] = useState<appTempFormData>({
        appName: '',
        appCategory: '',
        appTypeIds: '',
        sceneType: '',
    });

    // 控制弹窗显示状态
    const [appTemplateModalVisible, setAppTemplateModalVisible] = useState(false);

    // 打开弹窗
    const handleOpenAppTemplateModal = () => {
        setAppTemplateModalVisible(true);
    };

    // 关闭弹窗
    const handleCloseAppTemplateModal = () => {
        setAppTemplateModalVisible(false);
    };
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    // const {pageStore} = useAppContext();
    // const updateConfig = pageStore(useShallow((state: any) => state.updateConfig));

    const addCanvans = (options: any) => {
        // updateConfig(
        //     {
        //         ...options,
        //         serviceTypeId: userInfo.serviceTypeId,
        //     },
        //     '',
        //     () => {},
        // );
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

    // 模拟从API获取选项数据
    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            try {
                request
                    .post('/appType/queryAppTypeList', {})
                    .then((res) => {
                        const appTypeList = res.beans;
                        setAppTypeList((pev) => {
                            return appTypeList.map((item: any) => {
                                return {
                                    appTypeCategory: item.appTypeCategory,
                                    appTypeId: item.appTypeId,
                                    appTypeName: item.appTypeName,
                                    pId: item.pId,
                                    typeLevel: item.typeLevel,
                                };
                            });
                        });
                        // 遍历转换
                        const businessIdSelectData: ListItem[] = appTypeList.map((item: ListItem) => ({
                            ...item,
                            label: item.appTypeName, // 原始值转换后赋值
                            value: item.appTypeId,
                            id: item.appTypeId,
                        }));
                        const appTemplateTabs = businessIdSelectData.filter((item: ListItem) => {
                            if (item.typeLevel === '1') {
                                return item;
                            }
                        });
                        setAppTypeArry(appTemplateTabs);
                    })
                    .catch((err) => {});

                const { appCategoryArr, showFormArr } = publictData;
                setOptions({
                    appCategoryOption: [{ value: '', label: '全部', id: '' }, ...appCategoryArr],
                    // appTypeOption: [
                    //     { value: '', label: '全部', id: '' },
                    //     // ...loadappTypeArry
                    // ],
                    showFormOption: [{ value: '', label: '请选择', id: '' }, ...showFormArr],
                });
            } catch (error) {
                console.error('获取选项数据失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    // 模板类别变化
    const handleAppCategoryChange = (value: string) => {
        const newAppTypeArry = appTypeArry.filter((item: ListItem) => {
            if (item.appTypeCategory === value) {
                return item;
            }
        });
        //应用分类处理
        if (!value) {
            setApptyepOptions({
                appTypeOption: [{ value: '', label: '全部', id: '' }],
            });
        } else {
            setApptyepOptions({
                appTypeOption: [{ value: '', label: '全部', id: '' }, ...newAppTypeArry],
            });
        }
        setAppTypeId('');
        setAppTempForm({
            ...appTempForm,
            appCategory: value,
            appTypeIds: '',
            sceneType: value === '1' ? appTempForm.sceneType : '',
        });
    };

    // 模板名称变化
    const changeAppName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAppTempForm({
            ...appTempForm,
            appName: e.target.value,
        });
    };

    const getChildIdList = (id: string, idsArry: string[]) => {
        for (const item of appTypeList) {
            if (item.pId == id && item.appTypeId) {
                idsArry.push(item.appTypeId);
                getChildIdList(item.appTypeId, idsArry);
            }
        }
        setAppTempForm({
            ...appTempForm,
            appTypeIds: idsArry.join(','),
        });
    };
    // 应用分类变化
    const changeAppTypeIds = (value: string) => {
        setAppTypeId(value);
        getChildIdList(value, [value]);
    };
    // 应用形式变化
    const changeSceneType = (value: string) => {
        setAppTempForm({
            ...appTempForm,
            sceneType: appTempForm.appCategory === '1' ? value : '',
        });
    };

    // 查询按钮点击将表单数据传递到父组件
    const changeFrom = () => {
        onSearch(appTempForm);
    };
    // 重置按钮
    const resetSearchForm = () => {
        setAppTempForm({
            ...appTempForm,
            appName: '',
            appCategory: '',
            appTypeIds: '',
            sceneType: '',
        });
        onReset();
    };

    const addBaseInfo = (data: appTempData) => {
        confirmEvent(data);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin tip="加载选项数据中..." />
            </div>
        );
    }

    return (
        <div>
            <Row gutter={16} className={styles.applicationTempFrom}>
                <Col span={appTempForm.appCategory === '1' ? 4 : 5} className={styles.configItem}>
                    <label>模板名称:</label>
                    <Input name="appName" placeholder="请输入" className={styles.fromItem} value={appTempForm.appName} onChange={changeAppName} />
                </Col>

                <Col span={appTempForm.appCategory === '1' ? 4 : 5} className={styles.configItem}>
                    <label>模板类别:</label>
                    <Select className={styles.fromItem} placeholder="请选择" value={appTempForm.appCategory} onChange={handleAppCategoryChange}>
                        {options.appCategoryOption.map((item) => (
                            <Option key={item.value} value={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Col>

                <Col span={appTempForm.appCategory === '1' ? 4 : 5} className={styles.configItem}>
                    <label>应用分类:</label>
                    <Select className={styles.fromItem} onChange={changeAppTypeIds} value={appTypeId} placeholder="请选择">
                        {appType.appTypeOption.map((item) => (
                            <Option key={item.value} value={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Col>

                {appTempForm.appCategory === '1' && (
                    <Col span={4} className={styles.configItem}>
                        <label>应用形式:</label>
                        <Select placeholder="请选择" onChange={changeSceneType} value={appTempForm.sceneType} className={styles.fromItem}>
                            {options.showFormOption.map((item) => (
                                <Option key={item.value} value={item.value}>
                                    {item.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                )}

                <Col className={styles.configItem} span={appTempForm.appCategory === '1' ? 4 : 5} style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={changeFrom} style={{ marginRight: 8 }}>
                        查询
                    </Button>
                    <Button onClick={resetSearchForm}>重置</Button>
                </Col>
            </Row>
            <div className={styles.appTempBtns}>
                <button className={styles.addAppTemp} onClick={handleOpenAppTemplateModal}>
                    新增应用模板
                </button>
            </div>
            {/* 弹窗组件 */}
            <Modal
                className={styles.addTempModal}
                title="新增应用模板"
                open={appTemplateModalVisible}
                onCancel={handleCloseAppTemplateModal}
                styles={modalStyles}
                footer={null} // 移除默认底部按钮
                width={800}
                maskClosable={false} // 设置为false，点击遮罩不关闭
                destroyOnClose // 关闭时销毁子元素
            >
                <AddApplyComponentTemp
                    onReset={handleCloseAppTemplateModal}
                    onSearch={(options) => {
                        handleCloseAppTemplateModal();
                        addCanvans(options);
                    }}
                    appTypeList={appTypeList}
                    addconfirmEvent={addBaseInfo}
                />
            </Modal>
        </div>
    );
};

export default ApplicationTempSearchCont;
