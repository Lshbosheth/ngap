import { Form,Input , FormInstance, Modal,Tooltip } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { memo, useCallback, useRef, useState, useEffect } from 'react';
import request from '../../../utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import CascadeSelect from '@/packages/Basic/Link/CascadeSelect';
import VariableBindInput from '../../../components/VariableBind/VariableBind';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { QuestionCircleOutlined } from '@ant-design/icons';
import './iFramecss.css';
/**
 * 表格配置
 */
const IFrameSetting = memo(({ form, config }: { form: FormInstance; config: any }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const _state = useAppContext();
    const { pageStore } = _state;
    const { selectedElement, editElement } = pageStore(
        useShallow((state: any) => ({
            selectedElement: state.selectedElement,
            editElement: state.editElement,
        }))
    );
    //弹框
    const [linkModalVisible, setlinkModalVisible] = useState(false);
    // 左侧下拉框选中值
    const [leftValue, setLeftValue] = useState('l');
    // 右侧类型：select 或 input
    const [treeData, settreeData] = useState([]);

    // 左侧下拉选项
    const leftOptions = [
        { label: '链接', value: 'l' },
        { label: '菜单', value: 'c' },
        { label: '应用', value: 'y' }
    ];
    const [SelectOptions, setSelectOptions] = useState([{ label: '请选择', value: '' }]);

    // 给平级菜单自动添加 level 字段，从 1 开始
    function addLevelToFlatData(flatList:any) {
         // 1. 先拷贝数据，避免污染原数组
        const result = JSON.parse(JSON.stringify(flatList));
        // 2. 遍历每一项：从原有字段 封装 新字段 + 计算 level
        result.forEach((item:any) => {
            // ======================
            // 👇 你要的【新参数】从这里封装
            // ======================
            item.pId = item.parentId; // 从原字段取
            item.appTypeId = item.menuId; // 深层取值
            item.appTypeName = item.menuName;
            // 想加多少就加多少...

            // 根节点默认 level = 1
            if (item.parentId === '000') {
                item.typeLevel = '1';
            }
        });

        // 第二步：递归给子节点加 level
        function setChildLevel(parentId:any, parentLevel:any) {
            result.forEach((item:any) => {
                if (item.parentId === parentId) {
                    item.typeLevel = String(parentLevel + 1);
                    setChildLevel(item.menuId, parentLevel + 1);
                }
            });
        }

        // 从根节点开始遍历
        result
            .filter((it:any) => it.typeLevel === '1')
            .forEach((root:any) => setChildLevel(root.menuId, 1));

        return result;
    }
    useEffect(() => {
        request
            .post('/csf/call/sysMenuPermNewRest',
                { params: { serviceTypeId: userInfo.serviceTypeId, staffId: userInfo.staffId, viewId: '0' } }
            )
            .then((data: any) => {
                settreeData(addLevelToFlatData(data.beans));
            })
            .catch(() => {
            });
        request
            .post('/app/queryListedAppAll',
                { params: { provId: userInfo.provinceId, appStatusStr: '6,10,11' } }
            )
            .then((data: any) => {
                const options = data.beans.map((item: any) => {
                    return { label: item.appName, value: item.appUrl };
                });
                setSelectOptions(options);
            })
            .catch(() => {
            });
    }, []);
     const onchangeFun = (value: string) => {
       const valls = form.getFieldsValue()
       if (selectedElement?.id) {
            editElement({
                id: selectedElement.id,
                type: 'props',
                props: valls,
            });
        }
    }
    // 关闭链接弹窗
    const linkModalVisibleClose = () => {
        setlinkModalVisible(false);
    };
    return (
        <>
            <div className="container">
                <div className="label-wrapper">
                    <label>跳转链接</label>
                    <Tooltip
                    title="支持选择链接、菜单、应用，默认链接类型；选链接可手动输入地址，选菜单可点击按钮选择系统菜单，选应用可下拉搜索选择当前项目下已上架应用"
                    placement="top" // 提示框位置：top/right/bottom/left
                    arrow={true} // 显示小箭头
                    >
                        <QuestionCircleOutlined style={{ color: '#ccc',fontSize: 14, marginLeft: 1 }} />
                    </Tooltip>:
                </div>
                <div className="left-wrapper">
                    <select
                        className="left-select"
                        value={leftValue}
                        onChange={(e) => {
                            setLeftValue(e.target.value);
                            form.setFieldValue('src', '');
                            form.setFieldValue('hrefname', '');
                        }}
                    >
                        {leftOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {leftValue === 'y' ? (
                        <Form.Item
                            name="src"
                            style={{ marginBottom: 0, width: '100%' }}
                            noStyle
                        >
                            <select
                                className="right-select"
                                onChange={(e) => {
                                    form.setFieldValue('hrefname', '');
                                }
                                }
                            >
                                <option value="" disabled>
                                    请选择
                                </option>
                                {SelectOptions.map(SelectOptions => {
                                    if (SelectOptions.label.length > 20) {
                                        return <option key={SelectOptions.value} title={SelectOptions.label} value={SelectOptions.value}>
                                            {SelectOptions.label.substring(0, 20) + '...'}
                                        </option>
                                    } else {
                                        return <option key={SelectOptions.value} title={SelectOptions.label} value={SelectOptions.value}>
                                            {SelectOptions.label}
                                        </option>
                                    }
                                })}
                            </select>
                        </Form.Item>
                    ) : (
                        leftValue === 'l' ? <Form.Item
                            name="src"
                            tooltip
                            style={{ marginBottom: 0, width: '100%' }}
                            noStyle
                         >
                            <VariableBindInput
                                style={{ width: '61%' }}
                                onChange={(e:any) => {form.setFieldValue('hrefname', '');}}
                                 placeholder="请输入"
                            />
                         </Form.Item > : (
                            <span>
                                <Form.Item
                                    name="hrefname"
                                    style={{ marginBottom: 0, width: '100%' }}
                                    noStyle
                                >
                                    <input
                                        type="text"
                                        className="right-input"
                                        disabled
                                        placeholder="请选择"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="src"
                                    style={{ display: 'none' }}
                                    noStyle
                                >
                                    <input
                                        type="text"
                                        disabled
                                        style={{ display: 'none' }}
                                        placeholder="请选择"
                                    />
                                </Form.Item>
                                <span className='right-input2' onClick={() => { setlinkModalVisible(true) }}>选择</span>
                            </span>)

                    )}
                </div>

            </div>
            <Modal
                title="跳转菜单配置"
                open={linkModalVisible}
                onCancel={linkModalVisibleClose}
                width={800}
                footer={null} // 移除默认底部按钮
                destroyOnClose
            >
                <CascadeSelect
                    appCategory={''}
                    appTypeId={''}
                    appTypeList={treeData}
                    onCancel={() => linkModalVisibleClose()}
                    onSure={(data) => {
                        form.setFieldValue('src', data.appTypeId);
                        form.setFieldValue('hrefname', data.appTypeName);
                        onchangeFun(data.appTypeId)
                        linkModalVisibleClose();
                    }}
                />
            </Modal>
        </>
    );
});
export default IFrameSetting;
