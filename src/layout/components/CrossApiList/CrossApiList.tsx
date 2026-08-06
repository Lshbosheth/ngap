import { useRef, useEffect,useState } from 'react';
import { useDebounceFn } from 'ahooks';
import { Form, Select, Button } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { CrossApiListInfo } from '@/stores/crossApiListStore';
import styles from './index.module.less';
import { useAppContext } from '../../../utils/AppProvider';
import { updateApiConfig } from '../../../utils/dealApiGlobal';
import { handleApi } from '../../../packages/utils/handleApi';
import { crossApiUserInfo } from '../../../stores/crossapiStore';
import { publictData } from '@/utils/appMenuData';
import NodeModal from '@/components/FlowNode/NodeModal';
import { NodeType } from '@/components/FlowNode/FlowNode';
import request from '@/utils/request';
import { objectToFormData } from '@/utils/objectToFormData'; // 对象转 FormData 工具函数

export default () => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const _state = useAppContext();
    const { pageStore } = _state;
    type callback = (nodeList: NodeType[]) => void;
    const nodeRef = useRef<{ open: (nodeList: NodeType[], callback: callback) => void }>();
    const baseInfo = pageStore((state: any) => state.config);
    const { updateCrossApisGlobal, crossApisGlobal,setCurrentCrossApiRow  } = pageStore((state?: any) => {
        return {
            updateCrossApisGlobal: state.updateCrossApisGlobal,
            crossApisGlobal: state.page.pageData.crossApisGlobal,
            setCurrentCrossApiRow: state.setCurrentCrossApiRow,
        };
    });
    const [optionsLoading, setOptionsLoading] = useState<boolean>(true); // 新增：加载状态
    const [optionsData,setoptionsData] = useState([]);
    const [form] = Form.useForm();
    // 根据选中的类目和应用类型过滤应用数据
    const [appActionNmData,setappActionNmData] = useState<any>({});
    const filterAppData = () => {
         setOptionsLoading(true); // 开始请求时设为 true
        // 构建查询参数
        const queryParams = {
            appCategory: "",
            appLevel: "",
            appTypeIds: "",
            tagTypeId: "",
            page: 1,
            limit: 500,
            start: 0,
            dataType: '1',
            provId: userInfo.provinceId,
            projectId: baseInfo.projectId,
            shareProv: userInfo.provinceId,
            isNewVersion: '1',
        };

        request
            .post('/app/queryAppList', objectToFormData(queryParams))
            .then((res) => {
                if (res?.beans?.length > 0) {
                    let NewArr = res?.beans?.flatMap((item: any) => [
                        { value: item.id+'@#'+item.appName, label: item.appName },
                    ]);
                    setoptionsData(NewArr);
                    let newObjecs =Object.fromEntries(res?.beans?.map((user:any) => [user.id, user.appName]))
                    setappActionNmData(newObjecs)
                }
                setOptionsLoading(false); // 请求完成
            })
            .catch((err) => {
            });
    };
    useEffect(() => {
        filterAppData()
    }, []);

    useEffect(() => {
        if (Object.keys(appActionNmData).length === 0) return;
        if (optionsData.length === 0) return;
        if (JSON.stringify(form.getFieldsValue()) !== JSON.stringify(crossApisGlobal)) {
            const apiList:any = (crossApisGlobal && crossApisGlobal.length > 0)
            ? crossApisGlobal.map((item: any, index: number) => {
                  const newItem = { ...item };
                  if (newItem.eventName !== 'masterAuxLinkage') {
                      newItem.appAction = '';
        }
                  return newItem;
              })
            : [{ eventName: '', actions: [], appAction: '' }];
            form.setFieldsValue({ api: apiList });
        }
    }, [crossApisGlobal, appActionNmData, optionsData]);

    // 防抖
    const { run } = useDebounceFn(
        (api: any, apis) => {
            updateApi(apis.api);
        },
        { wait: 800 },
    );
    const updateApi = (api: any = []) => {
        updateCrossApisGlobal(JSON.parse(JSON.stringify(api)));
    };
    const addCrossApi = (add: any) => {
        if (form.getFieldsValue().api.length > publictData.crossApiEventFlow.length) {
            message.warning('事件监听已新增最大！');
        } else {
            add({ eventName: '', actions: [] });
        }
    };
    const deleteCrossApi = (api: any, remove: any) => {
        remove(api.name);
    };
    const handleAddAction = (index: number) => {
        // 获取当前行数据
        const currentRow = form.getFieldValue(['api', index]);
        // 存入 store
        setCurrentCrossApiRow(currentRow);
        nodeRef.current?.open(form.getFieldValue(['api', index, 'actions']), (nodeList: any) => {
            form.setFieldValue(['api', index, 'actions'], nodeList);
            handleValueChange(null, form.getFieldsValue());
        });
    };
    // 值变化
    const handleValueChange = (_: any, values: any) => {
        updateApi(values.api);
    };
    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    return (
        <>
            <Form form={form} onValuesChange={run}>
                <Form.List name="api">
                    {(crossApis: any, { add: addOuter, remove: removeOuter }) =>
                        crossApis.map((api: any, _index: number) => (
                            <div className={styles.apiItem} key={`api_${_index}`}>
                                <Form.Item label="事件名称" name={[api.name, 'eventName']}>
                                    <Select
                                        defaultValue=""
                                        className={styles.apiTreeData}
                                        onChange={handleChange}
                                        options={publictData.crossApiEventFlow}
                                    />
                                </Form.Item>
                                 {crossApisGlobal[_index]?.eventName === 'masterAuxLinkage' && (<Form.Item
                                    label="发起应用"
                                    name={[api.name, 'appAction']}
                                    tooltip="用户点击操作的应用,为联动的发起方,请勿随意切换"
                                 >
                                    <Select
                                        defaultValue=""
                                        className="appActionData"
                                        options={optionsData}
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="请输入应用名称搜索"
                                        loading={optionsLoading}
                                        disabled={optionsLoading}
                                    />
                                </Form.Item>
                                )}
                                {/* 添加事件行为 */}
                                <div className={styles.setEventFlow}>
                                    <Button type="primary" onClick={() => handleAddAction(_index)}>
                                        设置事件流
                                    </Button>
                                </div>
                                {crossApis.length > 1 && (
                                    <Button
                                        type="primary"
                                        className="apiOperate"
                                        onClick={() => {
                                            deleteCrossApi(api, removeOuter);
                                        }}
                                    >
                                        删除
                                    </Button>
                                )}
                                <Button
                                    type="primary"
                                    className="apiOperate"
                                    onClick={() => {
                                        addCrossApi(addOuter);
                                    }}
                                >
                                    新增
                                </Button>
                            </div>
                        ))
                    }
                </Form.List>
            </Form>
            <NodeModal ref={nodeRef} source="crossApi" />
        </>
    );
};
