import { useState } from 'react';
import { Form, Switch, InputNumber, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './index.module.less';

/**
 * 自定义渲染
 */
export default function CounterDouble({ labelSpan }: { labelSpan?: number }) {
    const [show, setShow] = useState(false);
    const change = (checked: boolean) => {
        setShow(checked);
    };
    return (
        <>
            <Form.Item labelCol={{ span: 8 }} name={['formWrap', 'isDouble']} label={`步进器组`}>
                <Switch onChange={change} />
            </Form.Item>
            {show && (
                <>
                    <h2 className={styles.title}>
                        <span style={{ marginRight: 10 }}>{'步进器组-2'}</span>
                        <Tooltip title={'以下配置只对第二个步进器生效'}>{<QuestionCircleOutlined />}</Tooltip>
                    </h2>
                    {/* <Form.Item labelCol={{ span: labelSpan || 8 }} label={`步进器组-2`}></Form.Item> */}
                    <Form.Item
                        labelCol={{ span: labelSpan || 8 }}
                        name={['formWrap', 'step2']}
                        label={`数字间隔`}
                        tooltip="默认为第一个步进器的 step"
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        labelCol={{ span: labelSpan || 8 }}
                        name={['formWrap', 'max2']}
                        label={`最大值`}
                        tooltip="默认无，仅在第一个步进器的 max 存在时生效"
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        labelCol={{ span: labelSpan || 8 }}
                        name={['formWrap', 'min2']}
                        label={`最小值`}
                        tooltip="默认为第一个步进器的min，最小值为第一个步进器的 min"
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </>
            )}
        </>
    );
}
