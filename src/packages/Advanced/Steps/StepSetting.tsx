import { memo, useState } from 'react';
import { Form, Button, FormInstance } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import StepSetting from './stepSettingRow';
/**
 * 操作栏配置
 */

const ActionSetting = memo(({ form }: { form: FormInstance }) => {
    const [showMoreNum, setShowMoreNum] = useState<number | null>(null);
    // 创建新步骤
    const handleCreate = (add: any, index: number) => {
        add({});
    };
    // // 删除批量操作按钮
    // const handleDelete = (remove: any, name: number) => {
    //     remove(name);
    // };
    const toggleMore = (index: number) => {
        if (showMoreNum === index) {
            setShowMoreNum(null);
        } else {
            setShowMoreNum(index);
        }
    };
    return (
        <>
            <Form.List name={['items']}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map((fields: any, index: number) => (
                            <StepSetting {...fields} index={index} remove={remove} showMore={showMoreNum === index} onChange={toggleMore} />
                        ))}
                        <div style={{ padding: '0 10px 10px' }}>
                            <Button type="primary" block ghost onClick={() => handleCreate(add, fields.length + 1)} icon={<PlusOutlined />}>
                                新增
                            </Button>
                        </div>
                    </>
                )}
            </Form.List>
        </>
    );
});
export default ActionSetting;
