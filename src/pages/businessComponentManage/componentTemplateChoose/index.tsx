import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Input, Modal, Divider } from 'antd';
import type { GetProps } from 'antd';

type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;
import TempCont from './tempCont';

import { ModuleSelectHandle, BusinessData, OptionItem, TempSearchData, CommponentBeansItem, ComponentTempData } from '../businessComponentMangeTypes';
import { publictData } from '../../../utils/appMenuData';
import request from '../../../utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';

import { objectToFormData } from '../../../utils/objectToFormData'; // 对象转 FormData 工具函数
import AddBusponentTemp from './addBusponentTemp';

import styles from './index.module.less';
interface IProps {
    businessListData: BusinessData[];
    onBack: (pos: string) => void;
    onConfirmEvent: (pos: string, data: ComponentTempData) => void;
}
interface LoadData {
    componentName: string;
    startNum: number;
    pageNum: number;
    componentCategory: string;
    businessId: string;
    queryType: string;
}

const ComponentTemplateChoose = forwardRef<ModuleSelectHandle, IProps>((props, ref) => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const { onBack, businessListData, onConfirmEvent } = props;
    const [data, setData] = useState<CommponentBeansItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [start, setStart] = useState<number>(0);
    const [limit, setLimit] = useState<number>(9);
    const listRef = useRef<HTMLDivElement>(null);
    // 控制弹窗显示状态
    const [createDirectlyModalVisible, setCreateDirectlyModalVisible] = useState(false);

    // 打开弹窗
    const handlCreateDirectlyModal = () => {
        setCreateDirectlyModalVisible(true);
    };

    // 关闭弹窗
    const handleCloseCreateDirectlyModal = () => {
        setCreateDirectlyModalVisible(false);
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
    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        funDemo,
    }));
    const funDemo = () => {};
    // 组件类型数据
    const { componentTypeInfo } = publictData;
    const [options, setOptions] = useState<OptionItem[]>([...componentTypeInfo]);
    const [componentTempForm, setComponentTempForm] = useState<TempSearchData>({
        provId: userInfo.provinceId,
        serviceTypeId: userInfo.serviceTypeId,
        dataType: '3',
        componentStatus: '1',
        componentCategory: '1',
        componentName: '',
        businessId: '-1',
        limit: 9,
        page: 1,
        start: 0,
        firBusinessId: '-1',
    });
    const formDataRef = useRef(componentTempForm);

    // 点击返回
    const baseBackEvent = (pos: string) => {
        onBack(pos);
    };
    const randerComponentCategory = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const baseClass = item.value === '1' ? 'product' : 'operate';
            const appDesc = item.value === '1' ? '创建生产组件，用于编排各类生产应用' : '创建运营组件，用于编排各类运营应用';

            const activeClass = componentTempForm.componentCategory === item.value ? 'active' : '';
            return (
                <div
                    key={item.value}
                    className={[styles.componentName, styles[baseClass], styles[activeClass]].join(' ')}
                    onClick={() => {
                        handleAppCategory(item);
                    }}
                >
                    <div className={styles.title}>
                        <label>{item.label}</label>
                        <p>{appDesc}</p>
                    </div>
                    <div className={styles.imgIcon}></div>
                </div>
            );
        });
    };

    const handleAppCategory = (item: OptionItem) => {
        setComponentTempForm({
            ...componentTempForm,
            componentCategory: item.value,
            businessId: '-1',
        });
    };

    const randerBusinessCategory = () => {
        // // 1. 过滤掉没有businessLevel的项
        const validData = businessListData.filter((item) => item.businessLevel);

        // // 2. 分离一级和二级分类
        const level1Items = validData.filter((item) => item.businessLevel === '1');
        const level2Items = validData.filter((item) => item.businessLevel === '2');

        // // 3. 为每个一级分类匹配对应的二级分类
        const formattedLevel1 = level1Items.map((level1) => ({
            ...level1,
            children: level2Items.filter((level2) => level2.parentId === level1.businessId),
        }));

        const businessIds = [
            {
                businessId: '-1',
                businessName: '全部',
                // children: level2Items
            },
        ].concat(formattedLevel1);
        return businessIds.map((item: BusinessData) => {
            const activeClass = item.businessId === componentTempForm.firBusinessId ? 'businessNameActive' : '';
            return (
                <div
                    className={[styles.businessTypeItem, styles[activeClass]].join(' ')}
                    key={item.businessId}
                    onClick={() => handleBusinessIdClick(item)}
                >
                    {item.businessName}
                </div>
            );
        });
    };

    const handleBusinessIdClick = (item: any) => {
        // 获取当前一级分类下所有二级分类的businessId
        const buids = item.children ? item.children?.map((child: any) => child.businessId).join(',') : '';
        setComponentTempForm({
            ...componentTempForm,
            businessId: buids,
            firBusinessId: item.businessId,
        });
    };

    // 模拟API请求数据
    const fetchData = async (searchCurrentData: TempSearchData, pageNum: number): Promise<CommponentBeansItem[]> => {
        return new Promise((resolve) => {
            request.post('/appComponent/queryAppComponentList2', objectToFormData(searchCurrentData)).then((businessComponentBeans) => {
                // 业务组件列表数据
                const data: CommponentBeansItem[] = businessComponentBeans.beans;
                setStart(limit * pageNum);
                setPage(pageNum + 1);

                // 请求次数
                resolve(data);
            });
        });
    };
    // 加载数据
    const loadMoreData = useCallback(
        async (loadData: LoadData) => {
            if (loading || !hasMore) return;

            setLoading(true);
            try {
                const searchListData = {
                    ...componentTempForm,
                    componentName: loadData.componentName,
                    businessId: loadData.businessId !== '-1' ? loadData.businessId : '',
                    componentCategory: loadData.componentCategory,
                    page: loadData.pageNum,
                    start: loadData.startNum,
                };
                const newData = await fetchData(searchListData, loadData.pageNum);
                if (loadData.queryType === '1') {
                    if (newData.length === 0) {
                        setHasMore(false);
                    }
                    setData((prevData) => [...prevData, ...newData]);
                } else {
                    setData(newData);
                }
            } catch (error) {
                console.error('数据加载失败:', error);
            } finally {
                setLoading(false);
            }
        },
        [loading, hasMore, page],
    );
    // 检查是否需要加载更多
    const checkIfNeedLoadMore = useCallback(() => {
        if (!listRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
            loadMoreData({
                startNum: start,
                pageNum: page,
                componentCategory: componentTempForm.componentCategory,
                businessId: componentTempForm.businessId,
                queryType: '1',
                componentName: componentTempForm.componentName,
            });
        }
    }, [loading, hasMore, loadMoreData]);

    // 监听滚动事件
    useEffect(() => {
        const listElement = listRef.current;
        if (!listElement) return;

        listElement.addEventListener('scroll', checkIfNeedLoadMore);
        return () => {
            listElement.removeEventListener('scroll', checkIfNeedLoadMore);
        };
    }, [checkIfNeedLoadMore]);

    // 初始化加载
    useEffect(() => {
        setData([]);
        setHasMore(true);
        setLoading(false);
        loadMoreData({
            startNum: 0,
            pageNum: 1,
            componentCategory: componentTempForm.componentCategory,
            businessId: componentTempForm.businessId,
            queryType: '',
            componentName: componentTempForm.componentName,
        });
    }, [componentTempForm.componentCategory, componentTempForm.businessId]);

    const searchIpt = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setComponentTempForm({
            ...componentTempForm,
            componentName: value,
        });
    };
    const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
        loadMoreData({
            startNum: 0,
            pageNum: 1,
            componentCategory: componentTempForm.componentCategory,
            businessId: componentTempForm.businessId,
            queryType: '',
            componentName: value,
        });
    };

    // 处理业务组件基础信息
    const handleBaseInfo = (data: ComponentTempData) => {
        console.log(data, '新增组件参数');

        onConfirmEvent('2', data);
        setCreateDirectlyModalVisible(false);
    };

    return (
        <div className={styles.componentTemplateChoose}>
            <div className={styles.businessComponentTopcontet}>
                <div className={styles.busititle}>
                    <div
                        className={[styles.baseBack, styles.cancelBtn].join(' ')}
                        onClick={() => {
                            baseBackEvent('0');
                        }}
                    >
                        返回
                    </div>
                </div>
                <div className={styles.topCompt}>{randerComponentCategory(options)}</div>
            </div>

            <div className={styles.componentTemplateChoosePage}>
                <div className={styles.componentBasicTitle}>
                    <span className={styles.useTem}> 选择组件模板</span>
                    <div className={styles.createArea}>
                        <span className={styles.unUseTem}>不使用模板</span>
                        <span className={styles.CreateDirectly} onClick={handlCreateDirectlyModal}>
                            +直接创建
                        </span>
                    </div>
                    {/* 弹窗组件 */}
                    <Modal
                        className={styles.addTempModal}
                        title="新增业务组件"
                        open={createDirectlyModalVisible}
                        onCancel={handleCloseCreateDirectlyModal}
                        maskClosable={false} // 设置为false，点击遮罩不关闭
                        styles={modalStyles}
                        footer={null} // 移除默认底部按钮
                        width={800}
                        destroyOnClose // 关闭时销毁子元素
                    >
                        <AddBusponentTemp
                            componentData={{
                                componentCategory: componentTempForm.componentCategory,
                                provId: userInfo.provinceId,
                                serviceTypeId: userInfo.serviceTypeId,
                                updateStaffId: userInfo.staffId,
                                dataType: '1',
                            }}
                            businessListData={businessListData}
                            cancelEvent={handleCloseCreateDirectlyModal}
                            confirmEvent={handleBaseInfo}
                        />
                    </Modal>
                </div>
                <div className={[styles.speacialItem, styles.businessCategoryCont].join(' ')}>
                    <div className={styles.businessCategoryDom}>{randerBusinessCategory()}</div>
                    <div className={styles.templateSearchIpt}>
                        <Search
                            name="templateSearchIpt"
                            value={componentTempForm.componentName}
                            onSearch={onSearch}
                            placeholder="请输入"
                            onChange={(e) => {
                                searchIpt(e);
                            }}
                        />
                    </div>
                </div>
                <Divider style={{ margin: '10px 0' }} />
                <div className={styles.speacialItem2} ref={listRef}>
                    <div className={styles.templateList}>
                        {data.map((item) => (
                            <TempCont
                                key={item.id} //必须提供唯一key
                                cardData={item}
                                BusinessListData={businessListData}
                                confirmEvent={handleBaseInfo}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});
export default ComponentTemplateChoose;
