import { Form, Divider, Input, TreeSelect, Select, FormInstance } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import SettingModal from './../../../components/ApiConfig/components/SettingModal';
import { useRef } from 'react';
import styles from './index.module.less';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { apiListInfo } from './../../../stores/apiListStore';

/**
 * 请求配置
 * @returns
 */
const RequestAction = ({ type }: { type: 'request' | 'download' }) => {
    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>文件下载时，后端接口必须返回Blob对象才可以。</p>
                <Divider />
            </div>
            <Form.Item label="配置请求" name="id" rules={[{ required: true, message: '请选择请求接口' }]}>
                <ReqInput />
            </Form.Item>
            {type === 'download' && (
                <Form.Item label="文件名称" name="filename" tooltip="优先从请求头获取filename作为文件名称，其次获取此处的文件名称">
                    <Input placeholder="eg: filename.xls" />
                </Form.Item>
            )}
        </>
    );
};

/**
 * 自定义一个输入框
 * 由于FormItem中的组件不可以用其他元素包裹，因此自定义一个
 */
const ReqInput = ({ value, onChange }: any) => {
    const { pageStore } = useAppContext();
    const apis = pageStore(useShallow((state: any) => state?.page?.pageData?.apis || {}));
    const modalRef = useRef<{ showModal: (url: string) => void }>();
    const handleClick = () => {
        modalRef.current?.showModal(value);
    };
    const apiList = apiListInfo((state: any) => state.apiList);
    return (
        <>
            <TreeSelect
                className={styles.apiTreeData}
                showSearch
                value={value}
                placeholder="请选择接口"
                allowClear
                treeNodeFilterProp="title"
                treeDefaultExpandAll
                treeData={apiList}
                onChange={(val: string) => onChange(val)}
            ></TreeSelect>
            {/* <Select placeholder="请选择接口" showSearch allowClear value={value} onChange={onChange} style={{ width: '90%' }}>
                {Object.values(apis).map((item: any) => {
                    return (
                        <Select.Option value={item.id} key={item.id}>
                            {item.name}
                        </Select.Option>
                    );
                })}
            </Select> */}
            {/* <SettingOutlined onClick={handleClick} style={{ marginLeft: 10 }} /> */}
            <SettingModal update={(id) => onChange(id)} ref={modalRef}></SettingModal>
        </>
    );
};
export default RequestAction;
