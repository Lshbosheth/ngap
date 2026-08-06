import { useEffect, useState, useRef } from 'react';
import { Form, Divider, Input, Switch, Radio, FormInstance, Select, Checkbox, TreeSelect, Modal } from 'antd';
import VariableBind from './../../../components/VariableBind/VariableBind';

import { crossApiUserInfo } from '../../../stores/crossapiStore';
import styles from './index.module.less';
// 业务逻辑枚举值与ngsh保持一致
// operContent: '应用矩阵', 金库操作内容
// operCode: 'RHKF_NGOS_00001', 金库操作编码



const GoldBankCheckAction = ({ form }: { form: FormInstance }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>
                    配置金库校验；
                </p>
                <Divider />
            </div>
            <Form.Item label="金库操作内容" name={'operContent'} tooltip='操作内容'>
                <VariableBind />
            </Form.Item>
            <Form.Item label="金库操作编码" name={'operCode'} tooltip='操作编码加密'>
                <VariableBind />
            </Form.Item>
            <Form.Item label="操作日志类型" name={'operateTypeCode'} tooltip='操作日志类型'>
                <Select>
                    <Select.Option value="1">增加</Select.Option>
                    <Select.Option value="2">删除</Select.Option>
                    <Select.Option value="3">修改</Select.Option>
                    <Select.Option value="4">查询</Select.Option>
                    <Select.Option value="5">导入(含上传)</Select.Option>
                    <Select.Option value="6">导出(含下载)</Select.Option>
                    <Select.Option value="7">登录</Select.Option>
                    <Select.Option value="8">登出</Select.Option>
                    <Select.Option value="99">其他</Select.Option>
                </Select>
            </Form.Item>
        </>
    );
};
export default GoldBankCheckAction;
