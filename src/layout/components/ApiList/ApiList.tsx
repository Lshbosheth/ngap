import { useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import { Form, TreeSelect, Space, Input, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { apiListInfo } from '@/stores/apiListStore';
import styles from './index.module.less';
import VariableBind from '../../../components/VariableBind/VariableBind';
import { useAppContext } from '../../../utils/AppProvider';
import request from '../../../utils/request';
import { updateApiConfig } from '../../../utils/dealApiGlobal';
import { handleApi } from '../../../packages/utils/handleApi';
import { crossApiUserInfo } from '../../../stores/crossapiStore';
export default () => {
  const _state = useAppContext();
  const { pageStore } = _state;
  const {
    updateApiGlobal,
    apiOutParam,
    addApiOutParam,
    apisGlobal,
    editApiOutData,
    apiOutData,
    updateAddApi,
  } = pageStore((state?: any) => {
    return {
      updateApiGlobal: state.updateApiGlobal,
      addApiOutParam: state.addApiOutParam,
      editApiOutData: state.editApiOutData,
      apiOutParam: state.page.pageData.apiOutParam || {},
      apisGlobal: state.page.pageData.apisGlobal,
      apiOutData: state.page.pageData.apiOutData || {},
      updateAddApi: state.updateAddApi,
    }
  });
  const [form] = Form.useForm();
  form.setFieldsValue( (apisGlobal && apisGlobal.length > 0) ? {api: apisGlobal} : {api: [{id: "",params: [{}]}]} );
  useEffect(() => {
    updateAddApi((apis: any = []) => {
      const _apis = form.getFieldsValue().api;
      const _ids = _apis.map((item: any) => item.id);
      apis.forEach((api: any) => {
        if(_ids.indexOf(api) == -1){
          _apis.push(api)
        }
      })
      form.setFieldsValue(_apis);
    })
  }, [])
  // 防抖
  const { run } = useDebounceFn(
    (api: any, apis) => {
      updateApi(apis.api);
    },
    { wait: 800 }
  )

  const userInfo = crossApiUserInfo((state: any) => state.userInfo);
  const apiList = apiListInfo((state: any) => state.apiList);
  const updateApi = (api: any = []) => {
    updateApiConfig({
      api,
      apiOutParam,
      addApiOutParam,
      apiOutData,
      editApiOutData,
      handleApi,
      _state,
      userInfo,
      apiList
    })
    updateApiGlobal(JSON.parse(JSON.stringify(api)));
  }
  const addApi = (add: any) => {
    add({id: "",params: [{}]})
  }
  const deleteApi = (api: any, remove: any) => {
    remove(api.name)
  }
  return (
    <>
      <Form form={form} onValuesChange={run}  className={styles.apiConfigListform}>
        <Form.List name="api">
          {(apis: any, {add: addOuter, remove: removeOuter}) =>
            apis.map((api: any, _index: number) => (
              <div className={styles.apiItem} key={`api_${_index}`}>
                <Form.Item label="请求地址" name={[api.name, "id"]}>
                  <ApiInput />
                </Form.Item>
                <Form.Item label="发送参数">
                    <Form.List name={[api.name, "params"]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((param, index) => (
                                    <Space
                                        align="baseline"
                                        style={{ marginBottom: fields.length === index + 1 ? 0 : 10, alignItems: 'center' }}
                                        key={`header-${index}`}
                                    >
                                        <Form.Item name={[param.name, 'key']} noStyle>
                                            <Input placeholder="请输入参数名" />
                                        </Form.Item>
                                        <Form.Item name={[param.name, 'value']} noStyle>
                                            <VariableBind placeholder="请输入参数值" />
                                        </Form.Item>
                                        <PlusOutlined onClick={() => add({ key: '', value: '' })} />
                                        {index > 0 && (
                                            <MinusCircleOutlined
                                                onClick={() => {
                                                    remove(param.name);
                                                }}
                                            />
                                        )}
                                    </Space>
                                ))}
                            </>
                        )}
                    </Form.List>
                </Form.Item>
                {apis.length > 1 && <Button type="primary" className="apiOperate"
                  onClick={() => {deleteApi(api, removeOuter)}}>删除</Button>}
                <Button type="primary" className="apiOperate"
                  onClick={() => {addApi(addOuter)}}>新增</Button>
              </div>
            ))
          }
        </Form.List>
      </Form>
    </>
  );
};
/**
 * 接口输入框
 */
function ApiInput({ value, onChange }: any) {
    const apiList = apiListInfo((state: any) => state.apiList);
    return (
        <>
            <TreeSelect
                className={styles.apiTreeData}
                showSearch
                treeNodeFilterProp="title"
                treeDefaultExpandAll
                value={value}
                placeholder="请选择接口"
                allowClear
                treeData={apiList}
                onChange={(val: string) => onChange(val)}
            ></TreeSelect>
        </>
    );
}
