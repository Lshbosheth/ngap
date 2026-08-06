import { useRef } from 'react';
import { Button, Flex, List } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import VariableSetting from './VariableSetting';
import { PageVariable } from '@/packages/types';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import styles from '../Menu/index.module.less';

export default () => {
    const variableRef = useRef<{ open: (type: 'add' | 'edit', variable?: PageVariable) => void }>();
    // 页面组件
    const { pageStore } = useAppContext();
    const { variables, removeVariable } = pageStore((state: any) => ({
        variables: state?.page?.pageData?.variables || [],
        removeVariable: state.removeVariable,
    }));


    // 新增变量
    const handleAdd = () => {
        variableRef.current?.open('add');
    };

    // 修改变量
    const handleEdit = (event: React.MouseEvent, item: PageVariable) => {
        event.preventDefault();
        variableRef.current?.open('edit', item);
    };

    // 删除变量
    const handleRemove = (event: React.MouseEvent, name: string) => {
        event.preventDefault();
        removeVariable(name);
    };

    return (
        <>
            <Flex justify="space-between" align="center" style={{ borderBottom: '1px solid var(--mars-theme-card-border-color)' }}>
                <Button type="link" icon={<PlusOutlined />} onClick={() => handleAdd()}>
                    新增
                </Button>
            </Flex>
                    {/* 普通变量分组 */}
            {/* <div style={{ margin: '12px 0 4px', fontWeight: 600 }}>普通变量</div> */}

            <List
                className={styles.variableListCont}
                itemLayout="horizontal"
                dataSource={variables}
                renderItem={(item:any) => (
                    <List.Item
                        actions={[
                            <a onClick={(e) => handleEdit(e, item)}>修改</a>,
                            <a onClick={(e) => handleRemove(e, item.name)}>删除</a>
                        ]}
                    >
                        <List.Item.Meta title={item.name} description={item.remark} />
                    </List.Item>
                )}
            />
      
           
            
            <VariableSetting ref={variableRef} />
        </>
    );
};
