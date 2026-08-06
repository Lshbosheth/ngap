import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Button, Radio } from 'antd';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import { SearchOutlined } from '@ant-design/icons';
// import { debounce } from 'lodash-es';

const { TextArea } = Input;
const { Option } = Select;

interface TenantModalProps {
    type: string;
    visible: boolean;
    onCancel: () => void;
    editData: any;
    onConfirm: (type: string, values: any) => void;
}
interface OptionItem {
    value: string;
    label: string;
}
const stateOptions = [
    { value: '1', label: '启用' },
    { value: '0', label: '停用' },
];

const tenantModal: React.FC<TenantModalProps> = ({ type, visible, onCancel, editData, onConfirm }) => {
    const [form] = Form.useForm();
    const handleCancel = () => {
        onCancel();
        // form.resetFields();
        setAdminOptions([]);
        setOpen(false);
    };
    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onConfirm(type, editData ? { ...editData, ...values } : values);
            // form.resetFields();
        });
    };
    const [open, setOpen] = useState(false);
    const [adminOptions, setAdminOptions] = useState<OptionItem[]>([]);
    // 初始化
    useEffect(() => {
        setSearchText('');
        if (editData) {
            form.setFieldsValue({
                tenantName: editData?.tenantName || '',
                tenantCode: editData?.tenantCode || '',
                tenantUrl: editData?.tenantUrl || '',
                adminStaffId: editData?.adminStaffId || undefined,
                tenantState: editData?.tenantState || '',
                tenantDesc: editData?.tenantDesc || '',
            });
        } else {
            form.setFieldsValue({
                tenantName: '',
                tenantCode: '',
                tenantUrl: '',
                adminStaffId: undefined,
                tenantState: '1',
                tenantDesc: '',
            });
        }
    }, [type, editData, visible]);

    const [selectLoading, setSelectLoading] = useState(false);
    const [selectKey, setSelectKey] = useState(0);
    const [searchText, setSearchText] = useState(''); // 管理员搜索值
    const fetchData = (searchText: string) => {
        if (!searchText) {
            setAdminOptions([]);
            return;
        }
        setSelectLoading(true);
        try {
            request
                .post('/appTenant/queryAdminStaffInfo', { params: { phone: searchText } })
                .then((res) => {
                    const adminSatffIdList = res.beans.map((item: any) => {
                        return { label: Object.keys(item)[0], value: Object.keys(item)[0] };
                    });
                    setAdminOptions(adminSatffIdList);
                    setSelectKey((pre) => {
                        return pre + 1;
                    }); // 解决setAdminOptions异步导致下拉数据未更新的问题
                    setSearchText('');
                    setSelectLoading(false);
                })
                .catch((err) => {
                    setAdminOptions([]);
                    setSelectLoading(false);
                });
        } catch (err) {}
    };
    // 防抖处理，避免频繁请求
    // const debouncedSearch = debounce(fetchData, 500);

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
        // } else {
        //   setOpen(false);
        // }
    };

    return (
        <Modal
            title={type === 'add' ? '新增租户' : type === 'edit' ? '编辑租户' : '变更管理员'}
            open={visible}
            destroyOnClose={true}
            maskClosable={false} // 禁止点击遮罩关闭
            footer={null}
            onCancel={handleCancel}
            width={610}
        >
            <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} style={{ paddingTop: 20 }}>
                <Form.Item name="tenantName" label="名称" rules={[{ required: true, message: '请输入名称' },{ max: 30, message: '名称最多支持30个字符' }]}>
                    <Input placeholder="请输入" disabled={type === 'change'} />
                </Form.Item>
                <Form.Item name="tenantCode" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
                    <Input placeholder="请输入" disabled={type === 'change'} />
                </Form.Item>
                <Form.Item name="tenantUrl" label="租户路径前缀" rules={[{ required: true, message: '请输入租户路径前缀' }]}>
                    <Input placeholder="请输入" disabled={type === 'change'} />
                </Form.Item>
                <Form.Item name="adminStaffId" label="管理员" rules={[{ required: true, message: '请输入管理员' }]}>
                    <Select
                        options={adminOptions}
                        key={selectKey}
                        open={open}
                        onChange={(value) => {
                            form.setFieldsValue({
                                adminStaffId: value,
                            });
                            setOpen(false);
                        }}
                        onDropdownVisibleChange={() => {}}
                        onClick={() => {}} // 阻止点击展开
                        showSearch
                        placeholder="请输入手机号码进行查询"
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
                </Form.Item>
                <Form.Item name="tenantState" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                    <Radio.Group options={stateOptions} disabled={type === 'change'} />
                </Form.Item>
                <Form.Item name="tenantDesc" label="描述" rules={[{ required: true, message: '请输入描述'}, { max: 500, message: '描述不能超过500个字符' }]}>
                    <TextArea rows={4} placeholder="请输入" disabled={type === 'change'} />
                </Form.Item>
                <div style={{ textAlign: 'center', marginTop: 36 }}>
                    <Button type="primary" style={{ marginRight: 8, width: 80 }} onClick={handleSubmit}>
                        确定
                    </Button>
                    <Button onClick={handleCancel} style={{ width: 80 }}>
                        取消
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default tenantModal;
