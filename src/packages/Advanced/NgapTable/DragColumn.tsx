import { memo, useRef } from 'react';
import { Form, Input, Space, Select } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { EditOutlined, HolderOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useDrag, useDrop } from 'react-dnd';
import { createId } from './../../utils/util';
/**
 * 表格配置
 */
const DragColumn = memo(({ index, move, handleOpen, add, remove, Len, form, options, onRemove }: any) => {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop<{ index: number }>({
        accept: 'card',

        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            move(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag, preview] = useDrag({
        type: 'card',
        item: () => {
            return { index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));
    const key = createId('C', 5);
    return (
        <>
            <Space style={{ display: 'flex', marginBottom: 15, padding: '0 10px', opacity }} align="baseline" ref={preview}>
                <HolderOutlined style={{ cursor: 'grab' }} ref={ref} />
                <Form.Item wrapperCol={{ span: 22 }} name={[index, 'title']} noStyle>
                    <Input placeholder="列名称" style={{ width: '80px' }} />
                </Form.Item>
                <Form.Item wrapperCol={{ span: 22 }} name={[index, 'dataIndex']} noStyle>
                    <Select
                        placeholder="请选择列"
                        options={options}
                        onChange={(option) => {
                            // 当选中一个选项时，更新对应的 dataIndex
                            form.setFieldsValue({
                                [index]: {
                                    dataIndex: option?.value,
                                },
                            });
                        }}
                        // 从表单中读取 dataIndex 字段
                        value={form.getFieldValue([index, 'dataIndex'])}
                        style={{ width: '90px' }}
                    />
                </Form.Item>
                <Form.Item wrapperCol={{ span: 22 }} name={[index, 'dataIndex']} hidden noStyle>
                    <Input placeholder="列字段" style={{ width: '100%' }} />
                </Form.Item>
                <EditOutlined onClick={() => handleOpen(index)} />
                <PlusOutlined onClick={() => add({ title: key, dataIndex: key, width: 120 }, index + 1)} />
                <MinusOutlined
                    onClick={() => {
                        if (Len === 1) {
                            message.error('基础表格至少存在一列');
                        } else {
                            if (onRemove) {
                                onRemove(index);
                            }
                            remove(index);
                        }
                    }}
                />
            </Space>
        </>
    );
});
export default DragColumn;
