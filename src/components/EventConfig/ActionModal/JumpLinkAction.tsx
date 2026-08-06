import { Form, Input, Select,FormInstance, Modal, Radio, Divider,Switch,Tooltip } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { memo, useCallback, useRef, useState, useEffect } from 'react';
import request from '../../../utils/request';
import VariableBind from './../../../components/VariableBind/VariableBind';
import styles from './index.module.less';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import CascadeSelect from '@/packages/Basic/Link/CascadeSelect';
import { QuestionCircleOutlined } from '@ant-design/icons';

const OpenModalAction = ({ form }: { form: FormInstance }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    //弹框
    const [linkModalVisible, setlinkModalVisible] = useState(false);
    // 左侧下拉框选中值
    const [leftValue, setLeftValue] = useState('l');
    // 右侧类型：select 或 input
    const [treeData, settreeData] = useState([]);
    //页面类型弹框状态
    const [showdiofla, setshowdiofla] = useState(false);
    const [SelectOptions, setSelectOptions] = useState([{ label: '请选择', value: '' }]);
    // 左侧下拉选项
    const leftOptions = [
        { label: '链接', value: 'l' },
        { label: '菜单', value: 'c' },
        { label: '应用', value: 'y' },
    ];
    // 给平级菜单自动添加 level 字段，从 1 开始
    function addLevelToFlatData(flatList: any) {
        // 1. 先拷贝数据，避免污染原数组
        const result = JSON.parse(JSON.stringify(flatList));
        // 2. 遍历每一项：从原有字段 封装 新字段 + 计算 level
        result.forEach((item: any) => {
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
        function setChildLevel(parentId: any, parentLevel: any) {
            result.forEach((item: any) => {
                if (item.parentId === parentId) {
                    item.typeLevel = String(parentLevel + 1);
                    setChildLevel(item.menuId, parentLevel + 1);
                }
            });
        }

        // 从根节点开始遍历
        result
            .filter((it: any) => it.typeLevel === '1')
            .forEach((root: any) => setChildLevel(root.menuId, 1));

        return result;
    }
    useEffect(() => {
        const openTypes = form.getFieldValue('openType');
        if(openTypes === '2'){
            setshowdiofla(true)
        }
        form.setFieldsValue({
            jumpType: 'crossAPI',
            // linkParamType: '1',
        });
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
    // 关闭链接弹窗
    const linkModalVisibleClose = () => {
        setlinkModalVisible(false);
    };
    const charPool = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    function randomStr(length:number) {
        let str = '';
        for (let i = 0; i < length; i++) {
            // 随机下标取字符
            const index = Math.floor(Math.random() * charPool.length);
            str += charPool[index];
        }
        return str;
    }
    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>
                    打开链接:使用crossApi打开客服系统页面
                    {/* 跳转到指定页面。1. 系统内跳转会通过自身路由实现；2.
                    跨服务跳转主要是基于microApp的父子应用通信方式，主应用需要监听数据，并添加跳转代码；3.
                    超链接跳转通过window.open或location方式实现； */}
                </p>
                <Divider />
            </div>
            <Form.Item label="跳转方式" name={'jumpType'}>
                <Radio.Group buttonStyle="solid">
                    {/* <Radio.Button value="route">系统内跳转</Radio.Button>
                    <Radio.Button value="micro">跨服务跳转</Radio.Button>
                    <Radio.Button value="link">超链接跳转</Radio.Button> */}
                    <Radio.Button value="crossAPI">打开链接</Radio.Button>
                </Radio.Group>
            </Form.Item>
            {/* <Form.Item label="页面地址" name={'url'} rules={[{ required: true, message: '请输入跳转地址' }]}>
                <Input.TextArea placeholder="请输入页面地址" rows={4} />
            </Form.Item> */}
            <div className={styles.containerbox}>
                <div className={styles.labelwrapperbox}>
                    <label><span style={{color:'red'}}>*</span>跳转链接</label>
                     <Tooltip
                        title="支持选择链接、菜单、应用，默认链接类型；选链接可手动输入地址，选菜单可点击按钮选择系统菜单，选应用可下拉搜索选择当前项目下已上架应用"
                        placement="top" // 提示框位置：top/right/bottom/left
                        arrow={true} // 显示小箭头
                        >
                        <QuestionCircleOutlined style={{ color: '#ccc',fontSize: 14, marginLeft: 1 }} />
                    </Tooltip>:
                </div>
                <div className={styles.leftwrapperbox}>
                    <select
                        className={styles.leftselectbox}
                        value={leftValue}
                        onChange={(e) => {
                            setLeftValue(e.target.value);
                            form.setFieldValue('url', '');
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
                            name="url"
                            style={{ marginBottom: 0, width: '100%' }}
                            noStyle
                        >
                            <select
                                className={styles.rightselectbox}
                                onChange={(e) => {
                                    form.setFieldValue('url', e.target.value);
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
                            name="url"
                            tooltip
                            style={{ marginBottom: 0, width: '100%' }}
                            noStyle
                        >
                            <VariableBind className={styles.rightVBbox} placeholder="请输入"  onChange={(data:any)=> {
                                form.setFieldValue('url', data);
                                form.setFieldValue('hrefname', '')
                            }}  />
                        </Form.Item > : (
                            <span>
                                <Form.Item
                                    name="hrefname"
                                    style={{ marginBottom: 0, width: '100%' }}
                                    noStyle
                                >
                                    <input
                                        type="text"
                                        className={styles.rightinputbox}
                                        disabled
                                        placeholder="请选择"
                                    />
            </Form.Item>
                                <Form.Item
                                    name="url"
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
                                <span className={styles.rightinput2box} onClick={() => { setlinkModalVisible(true) }}>选择</span>
                            </span>)

                    )}
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
                        form.setFieldValue('url', data.appTypeId);
                        form.setFieldValue('hrefname', data.appTypeName);
                        linkModalVisibleClose();
                    }}
                />
            </Modal>
            </div>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('jumpType') === 'link' ? (
                        <Form.Item label="新窗口" name={'isNewWindow'}>
                            <Switch />
                        </Form.Item>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('jumpType') === 'crossAPI' ? (
                        <>
                            <Form.Item label="打开类型" name={'openType'} initialValue="1">
                                <Select
                                    onChange={(value) => {
                                            if(value === '2'){
                                                setshowdiofla(true)
                                            }else{
                                                setshowdiofla(false)
                                            }
                                        }
                                    }
                                >
                                    <option value="1" >页签打开</option>
                                    <option value="2" >弹框打开</option>
                                </Select>
                            </Form.Item>
                            {showdiofla &&
                                (<>
                                    <Form.Item
                                        label="弹框ID标识"
                                        name={'showDialogId'}
                                        initialValue={randomStr(7)}
                                        tooltip="弹框ID标识用来关闭当前弹框页面,不配置会关闭页面中所有弹框,枚举值可随意组合不可重复"
                                    >
                                        <Input placeholder="请输入唯一的弹框ID标识,可自定义" />
                                    </Form.Item>
                                    <Form.Item label="弹框宽度" name={'showDialogW'}>
                                        <Input placeholder="请输入弹框宽度" suffix="px"/>
                                    </Form.Item>
                                    <Form.Item label="弹框高度" name={'showDialogH'}>
                                        <Input placeholder="请输入弹框高度" suffix="px"/>
                                    </Form.Item>
                                    </>
                                )
                            }

                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('jumpType') === 'crossAPI' ? (
                        <>
                            <Form.Item label={showdiofla?'弹框名称':'页面名称'} name={'tabName'}>
                                <VariableBind placeholder="请输入页面名称"/>
                            </Form.Item>
                            <Form.Item label="链接入参传递方式" name={'linkParamType'}>
                                <Radio.Group
                                    value={form.getFieldValue('linkParamType')}
                                    options={[
                                        { value: '1', label: '链接后缀加参数' },
                                        { value: '2', label: 'json对象传参' },
                                    ]}
                                />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
        </>
    );
};
export default OpenModalAction;
