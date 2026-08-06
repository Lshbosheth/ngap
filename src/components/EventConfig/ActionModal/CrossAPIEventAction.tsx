import { useEffect, useState, useRef, useCallback } from 'react';
import { Form, Divider, Input, Select, Switch, Radio, FormInstance, Checkbox, TreeSelect, Modal } from 'antd';
import { crossApiUserInfo } from '../../../stores/crossapiStore';
import CrossAPI from '../../../utils/crossAPI';
import request from '../../../utils/request';
import { proid8to3 } from '../../../utils/ProvinceIdCon';
import { baseApiConvert } from '../../../utils/util';
import useMessageListener from '../../../utils/useMessageListener';
import VariableBind from './../../../components/VariableBind/VariableBind'; // 逻辑编译器
import styles from './index.module.less';
// 业务逻辑枚举值与ngsh保持一致
// { name: '转接专席类', value: '4' },
// { name: '一键甩单类', value: '5' },
// { name: '下发短信类', value: '6' },
// { name: '多媒体协同邀请短信', value: '15' },
// { name: '一键立单类', value: '7' },
// { name: '一键办理类', value: '8' },
// { name: '功能调用类', value: '9' },
// { name: '一键同屏类', value: '10' },
// { name: '知识详情类', value: '11' },
// { name: '一键拉铃类', value: '12' },
// { name: '服务助手类', value: '13' },
// { name: '转自助流程类', value: '14' }
// { name: '自助托管类', value: '16' }
// { name: '用后即评类', value: '17' }
interface publictData {
    label: string;
    value: string;
}

const CrossAPIEventAction = ({ form }: { form: FormInstance }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const iframeName = userInfo.iframeName ? userInfo.iframeName : '应用集成平台';
    const [dialogIsShow, setDialogIsShow] = useState<boolean>(false);
    const [orderDialogIsShow, setOrderDialogIsShow] = useState<boolean>(false);
    const [cardChooseData, setCardChooseData] = useState<boolean>(false);
    // 转接专席数据
    const [transferAgentData, setTransferAgentData] = useState<publictData[]>([]);
    // 一键甩单数据
    const [businessTypeTreeBeans, setBusinessTypeTreeBeans] = useState<any[]>([]);
    const [oneKeyOrdersLeafValues, setOneKeyOrdersLeafValues] = useState<string[]>([]);
    // 同屏卡片链接
    const province = proid8to3(userInfo.provinceId); // 三位省份编码
    const url = window.location.href;
    let cardScreenUrl = 'http://ngcard.cs.cmos:31213/ngcardma/v2/dist/glkpSetting.html';
    if (url.indexOf('cs.cmos:8080') > -1) {
        // 测试环境
        cardScreenUrl = 'http://ngcard-test.cs.cmos:8080/ngcardma/v2/dist/glkpSetting.html';
    }
    const screenCardUrl = cardScreenUrl + '?provCode=' + province + '&channelId=ngsh&pageName=23'; // 拼接同屏卡片打开链接
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // 工具函数：提取所有叶子节点
    const getLeafNodes = (nodes: any) => {
        let leafNodes: any[] = [];
        nodes.forEach((node: any) => {
            if (!node.children || node.children.length === 0) {
                leafNodes.push({ ...node });
            } else {
                leafNodes = leafNodes.concat(getLeafNodes(node.children));
            }
        });
        return leafNodes;
    };

    // 一键甩单数据处理
    const oneKeyOrdersDataHandle = (list: any, item: any) => {
        for (let i = 0; i < list.length; i++) {
            list[i].title = list[i].name;
            list[i].key = list[i].id;
            const vals = item + list[i].value + ',';
            if (list[i].children && list[i].children.length > 0) {
                // list[i].disable
                oneKeyOrdersDataHandle(list[i].children, vals);
            } else {
                list[i].value = vals;
            }
        }
        return list;
    };

    // 获取转接专席数据
    const getTransferAgentData = async () => {
        const params = {
            provId: userInfo.provinceId || '00030021',
        };
        const transferAgentData = await request.post('/csf/call/getSpecialSkillsNotLimit', { params: params });
        const transferAgentBeans = transferAgentData.beans
            .filter((item: any) => item.trstchDestEqupNm)
            .map((item: any) => {
                if (item.trstchDestEqupNm) {
                    return {
                        label: item.trstchDestEqupNm,
                        value: item.trstchTypeDtId + '#' + item.trstchTypeId,
                    };
                }
            });
        setTransferAgentData(transferAgentBeans);
    };

    // 一键甩单类型
    const getBusinessTypeTreeData = async () => {
        const params = {
            provId: userInfo.provinceId || '00030021',
            channelCd: '100010001',
        };
        const businessTypeTreeData: any = await request.post('/csf/call/queryBusinessTypeTree', { params: params });
        const businessTypeTreeRes = oneKeyOrdersDataHandle(businessTypeTreeData.beans, '');
        setBusinessTypeTreeBeans(businessTypeTreeRes);
        // 一键甩单数据所有叶子节点用于限制选择
        const oneKeyOrdersLeafNodes = getLeafNodes(businessTypeTreeRes);
        setOneKeyOrdersLeafValues(oneKeyOrdersLeafNodes.map((node: any) => node.value));
    };

    // 一键甩单下拉框更改
    const oneKeyOrderChange = (value: string) => {
        form.setFieldsValue({
            oneKeyOrderId: value,
        });
    };

    // 初始化时请求接口
    useEffect(() => {
        getTransferAgentData();
        getBusinessTypeTreeData();
    }, []);

    // 使用自定义hook监听message事件
    useMessageListener((event: MessageEvent) => {
        // 获取message返回的数据
        let returnData: any;
        if (typeof event.data === 'string') {
            try {
                returnData = JSON.parse(event.data);
            } catch (e) {
                returnData = event.data;
            }
        } else {
            returnData = event.data;
        }
            // const returnData = JSON.parse(event.data);
        // 监听同屏卡片关闭事件
        if (form.getFieldValue('eventNm') === '10') {
            // 先判断是否是辅助视图场景，唯一值
            if (returnData.rtnCode == '0' && returnData.pageName == '23') {

                const cardContent = returnData.cardContent;
                form.setFieldsValue({
                    cardName: cardContent.cardName, // 同屏卡片名称
                    cardId: cardContent.cardId, // 卡片id
                });
            }
            // 如果点击的是确定按钮
            setCardChooseData(false);
        } else if (form.getFieldValue('eventNm') === '11') {
            const relateKnowledgeData = returnData.param.knwlgs[0]; // 获取选中的知识和原子信息数据
            let atomId = '',
                atomNm = ''; //原子id 原子名称
            if (relateKnowledgeData.atoms && relateKnowledgeData.atoms[0]) {
                atomId = relateKnowledgeData.atoms[0].knwlgAttrAtomId ? relateKnowledgeData.atoms[0].knwlgAttrAtomId : '';
                atomNm = relateKnowledgeData.atoms[0].paraNm ? relateKnowledgeData.atoms[0].paraNm : '';
            }
            form.setFieldsValue({
                knwlgAtomNm: atomNm ? (relateKnowledgeData.knwlgNm + '-' + atomNm).slice(0, 100) : relateKnowledgeData.knwlgNm, // 知识名称
                knwlgAtomId: atomId ? (relateKnowledgeData.knwlgId + '#' + atomId).slice(0, 100) : relateKnowledgeData.knwlgId, // 知识id
            });

            //销毁弹框
            CrossAPI.destroyDialog('relateKnowledge');
        } else if (form.getFieldValue('eventNm') === '8') {
            // 一键办理
            if (returnData.name === 'ngshToNgapDealGeneration') {
                const item = JSON.parse(returnData.param.item);
                form.setFieldsValue({
                    mcdsNm: item.mcdsNm ? item.mcdsNm : '', // 商品名称
                    suplerProdCode: item.suplerProdCode ? item.suplerProdCode : '', // 供应商编码
                    provinceOfferType: item.provinceOfferType ? item.provinceOfferType : '', // 省端商品类型
                    categoryCode: item.categoryCode ? item.categoryCode : '', // 后台类目编码
                });
                CrossAPI.destroyDialog('ngshToNgapDealGeneration');
            }
        }
    });

    const openDialog = async () => {
        if (form.getFieldValue('eventNm') === '7') {
            // 一键立单类
            const url = window.location.href;

            let srvReqstType = 'http://ngwf.cs.cmos/ngwf/src/module/basesr/v4new/srServiceRequestType.html';
            if (url.indexOf('cs.cmos:8080') > -1) {
                // 测试环境
                srvReqstType = 'http://ngwf.cs.cmos:8080/ngwf/src/module/basesr/v4new/srServiceRequestType.html';
            }

            CrossAPI.showDialog({
                id: 'selectSrAcceptServiceRequest',
                title: '服务请求类型', //弹出窗标题
                url: baseApiConvert(srvReqstType),
                param: {
                    canSelectParent: true, //是否可以选择父节点
                    showIndividuation: true, //是否显示个性化按钮
                    fillWorkOrder: false, //控制是否显示填单按钮，直接答复按钮
                    leafOpenWorkPage: false, //子节点点击是否可以打开立单页面
                    maxSelected: 50, //最多可选择服务请求个数
                    needAcptFlag: false, //从立单打开服务请求选择页面，该值需要传递为false。
                }, //要传递的参数，可以是json对象
                modal: true,
                width: '840', //对话框宽度
                height: '580', //对话框高度
            });
            setOrderDialogIsShow(true);
        } else if (form.getFieldValue('eventNm') === '6') {
            // 下发短信类
            const url = window.location.href;
            let commonSmsUrl = 'http://ngms.cs.cmos/ngms/src/modules/smsMms/smsSend/commonSms.html';
            if (url.indexOf('cs.cmos:8080') > -1) {
                // 测试环境
                commonSmsUrl = 'http://ngms.cs.cmos:8080/ngms/src/modules/smsMms/smsSend/commonSms.html';
            }
            const params = {
                staffId: userInfo.staffId,
                sysNo: userInfo.sysNo,
                operType: 'NGSH',
            };
            CrossAPI.showDialog({
                id: 'ngshSelectSmsModuleFunDialog',
                title: '常用短信',
                // 洛阳测试环境
                url: baseApiConvert(commonSmsUrl),
                param: params,
                modal: true,
                width: '860',
                height: '590',
            });
            setDialogIsShow(true);
        } else if (form.getFieldValue('eventNm') === '8') {
            // 一键办理类
            // 一键办理商品选择链接
            let ngshToNgapDealGenerationUrl =
                'http://ngsh.cs.cmos/ngsh/src/js/tools/toolsScenePreview/oneKeyHandlePage/oneKeyHandlePage.html?sysName='+iframeName;
            if (url.indexOf('cs.cmos:8080') > -1) {
                // 测试环境
                ngshToNgapDealGenerationUrl =
                    'http://ngsh.cs.cmos:8080/ngsh/src/js/tools/toolsScenePreview/oneKeyHandlePage/oneKeyHandlePage.html?sysName='+iframeName;
            }
            //打开弹框
            CrossAPI.showDialog({
                id: 'ngshToNgapDealGeneration',
                title: '商品选择',
                url: baseApiConvert(ngshToNgapDealGenerationUrl),
                param: { tabName: iframeName },
                modal: true,
                width: '1200',
                height: '580',
            });
        } else if (form.getFieldValue('eventNm') == '10') {
            // 一键同屏类
            setCardChooseData(true);
        } else if (form.getFieldValue('eventNm') == '11') {
            // 知识详情类
            const province = proid8to3(userInfo.provinceId); // 三位省份编码
            //从配置中心获取知识库弹框地址
            const configParams = {
                configKey: 'KNOWLEDGEPAGEURL',
            };
            const knowLedgeData: any = await request.post('/csf/call/getConfigValue', { params: configParams });
            const knowledgePageUrl = knowLedgeData.bean.configValue;
            //打开知识库页面入参
            const knowledgePageParams = {
                province: province,
                tabName: iframeName,
                funName: 'radioComponentKnowledgeInfoGet',
                sysCode: 'ngsh',
                smsFlag: '',
            };
            //打开弹框
            CrossAPI.showDialog({
                id: 'relateKnowledge',
                title: '关联知识',
                url: baseApiConvert(knowledgePageUrl),
                param: knowledgePageParams,
                modal: true,
                width: '1200',
                height: '580',
            });
        }
    };

    // 监听短信和一键立单弹窗关闭
    CrossAPI.on('dialogClose', function (data: any) {
        if (dialogIsShow) {
            setDialogIsShow(false);
            CrossAPI.get('NGSH_NGMS_SMSModuleIds', function (result: any) {
                form.setFieldsValue({
                    smsnodePath: result[0].nodePath,
                    smsId: result[0].id,
                    smsNm: result[0].name,
                });
            });
        }

        if (orderDialogIsShow) {
            setOrderDialogIsShow(false);
            form.setFieldsValue({
                srvReqstTypeId: data[0].srvReqstTypeId,
                srvReqstTypeNm: data[0].srvReqstTypeNm,
                srvReqstTypeFullNm: data[0].srvReqstTypeFullNm,
                verno: data[0].verno,
            });
        }
    });

    // 业务类型勾选
    const [businessType, setBusinessType] = useState(form.getFieldValue("businessTypeId") && ["1", "2", "3", "4", "5", "6", "7", "8", "12"].indexOf(form.getFieldValue("businessTypeId")) == -1);
    const businessTypeIdChecked = useCallback((value: boolean) => {
        setBusinessType(value);
        form.setFieldValue("businessTypeId", "");
    }, [setBusinessType]);
    const businessTypeIdChange = useCallback((value: any) => {
        console.log("业务类型变更", value?.target?.value ?? value)
        form.setFieldValue("businessTypeId", value?.target?.value ?? value);
    }, [form])
    useEffect(() => {
        form.setFieldValue("eventNm", form.getFieldValue("eventNm"))
    }, [])
    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>
                    配置框架方法打开，例如：下发短信类、转接专席类、打开负一屏等；
                    {/* 跳转到指定页面。1. 系统内跳转会通过自身路由实现；2.
                    跨服务跳转主要是基于microApp的父子应用通信方式，主应用需要监听数据，并添加跳转代码；3.
                    超链接跳转通过window.open或location方式实现； */}
                </p>
                <Divider />
            </div>
            <Form.Item label="跳转方式" name={'eventNm'}>
                <Select
                    options={[
                        {
                            label: <span>消息/工单流转</span>,
                            title: "消息/工单流转",
                            options: [
                                {label: <span style={{paddingLeft: "15px"}}>下发短信类</span>, value: "6"},
                                {label: <span style={{paddingLeft: "15px"}}>互联网视频邀请短信</span>, value: "224"},
                                {label: <span style={{paddingLeft: "15px"}}>一键甩单类</span>, value: "5"},
                                {label: <span style={{paddingLeft: "15px"}}>一键立单类</span>, value: "7"},
                                {label: <span style={{paddingLeft: "15px"}}>用户即评类</span>, value: "17"},
                                {label: <span style={{paddingLeft: "15px"}}>发送消息到交谈区</span>, value: "18"},
                            ]
                        },{
                            label: <span>话务转接</span>,
                            title: "话务转接",
                            options: [
                                {label: <span style={{paddingLeft: "15px"}}>转接专席类</span>, value: "4"},
                                {label: <span style={{paddingLeft: "15px"}}>转自助流程</span>, value: "14"},
                                {label: <span style={{paddingLeft: "15px"}}>音视频转归属地</span>, value: "24"},
                            ]
                        },{
                            label: <span>身份/权限认证</span>,
                            title: "身份/权限认证",
                            options: [
                                {label: <span style={{paddingLeft: "15px"}}>转密码认证（他机）</span>, value: "26"},
                                {label: <span style={{paddingLeft: "15px"}}>转密码认证（本机）</span>, value: "25"},
                            ]
                        },{
                            label: <span>协同辅助</span>,
                            title: "协同辅助",
                            options: [
                                {label: <span style={{paddingLeft: "15px"}}>一键同屏类</span>, value: "10"},
                                {label: <span style={{paddingLeft: "15px"}}>知识详情类</span>, value: "11"},
                                {label: <span style={{paddingLeft: "15px"}}>一键办理类</span>, value: "8"},
                                {label: <span style={{paddingLeft: "15px"}}>语音转文本</span>, value: "31"},
                                {label: <span style={{paddingLeft: "15px"}}>打开负一屏</span>, value: "33"},
                                { label: <span style={{ paddingLeft: '15px' }}>受理号码变更</span>, value: '34' },
                            ]
                        }
                    ]}>
                </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '6' ? (
                        <>
                            <Form.Item label="选择短信目录" name={'smsnodePath'} rules={[{ required: true, message: '请选择短信节点' }]}>
                                <Input
                                    onClick={() => {
                                        openDialog();
                                    }}
                                    placeholder="请选择1个短信目录叶子节点"
                                />
                            </Form.Item>
                            <Form.Item hidden={true} label="选择短信目录" name={'smsId'}>
                                <Input placeholder="请选择1个短信目录叶子节点" />
                            </Form.Item>
                            <Form.Item hidden={true} label="选择短信目录" name={'smsNm'}>
                                <Input placeholder="请选择1个短信目录叶子节点" />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '4' ? (
                        <>
                            <Form.Item label="选择专席" name={'transferAgentVal'}>
                                <Select>
                                    {transferAgentData.map((item: any) => (
                                        <Select.Option key={item.value} value={item.value}>
                                            {`${item.label}`}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="转接信息" name={'transferInfo'}>
                                <Input placeholder="请输入转接信息备注（最多可录入30字）" />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '7' ? (
                        <>
                            <Form.Item label="选择立单节点" name={'srvReqstTypeFullNm'} rules={[{ required: true, message: '请选择立单节点' }]}>
                                <Input
                                    onClick={() => {
                                        openDialog();
                                    }}
                                    placeholder="请选择叶子节点"
                                />
                            </Form.Item>
                            <Form.Item
                                label="填单类型"
                                name={'fillFormType'}
                                valuePropName="checked"
                                rules={[{ required: true, message: '请选择至少一个填单类型' }]}
                            >
                                <Checkbox.Group defaultValue={form.getFieldValue('fillFormType')}>
                                    <Checkbox value="1">填单</Checkbox>
                                    <Checkbox value="2">直接答复</Checkbox>
                                </Checkbox.Group>
                            </Form.Item>
                            <Form.Item hidden={true} label="立单节点id" name={'srvReqstTypeId'}>
                                <Input placeholder="srvReqstTypeId" />
                            </Form.Item>
                            <Form.Item hidden={true} label="立单节点Name" name={'srvReqstTypeNm'}>
                                <Input placeholder="srvReqstTypeNm" />
                            </Form.Item>
                            <Form.Item hidden={true} label="立单节点verno" name={'verno'}>
                                <Input placeholder="verno" />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '8' ? (
                        <>
                            <Form.Item label="选择商品" name={'mcdsNm'} rules={[{ required: true, message: '请选择商品信息' }]}>
                                <Input
                                    onClick={() => {
                                        openDialog();
                                    }}
                                    placeholder="请选择商品信息"
                                />
                            </Form.Item>
                            <Form.Item hidden={true} label="供应商编码" name={'suplerProdCode'}>
                                <Input placeholder="suplerProdCode" />
                            </Form.Item>
                            <Form.Item hidden={true} label="省端商品类型" name={'provinceOfferType'}>
                                <Input placeholder="provinceOfferType" />
                            </Form.Item>
                            <Form.Item hidden={true} label="后台类目编码" name={'categoryCode'}>
                                <Input placeholder="categoryCode" />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '10' ? (
                        <>
                            <Form.Item label="选择同屏卡片" name={'cardName'} rules={[{ required: true, message: '请选择同屏卡片' }]}>
                                <Input
                                    onClick={() => {
                                        openDialog();
                                    }}
                                    placeholder="请选择同屏卡片"
                                />
                            </Form.Item>
                            <Form.Item label="是否预览" tooltip="说明：默认为是，先预览再同屏；选择否时，可跳过预览直接同屏" name={'isPreview'}>
                                <Radio.Group
                                    value={form.getFieldValue('isPreview')}
                                    defaultValue={form.getFieldValue('isPreview') ? form.getFieldValue('isPreview') : '1'}
                                    options={[
                                        { value: '1', label: '是' },
                                        { value: '2', label: '否' },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item hidden={true} label="卡片ID" name={'cardId'}>
                                <Input placeholder="cardId" />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '11' ? (
                        <>
                            <Form.Item label="请选择知识" name={'knwlgAtomNm'} rules={[{ required: true, message: '请选择知识' }]}>
                                <Input
                                    onClick={() => {
                                        openDialog();
                                    }}
                                    placeholder="选择知识"
                                />
                            </Form.Item>
                            <Form.Item hidden={true} label="知识ID" name={'knwlgAtomId'}>
                                <Input placeholder="cardId" />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '5' ? (
                        <>
                            <Form.Item label="选择业务类型" name={'oneKeyOrderId'} rules={[{ required: true, message: '请选择业务类型' }]}>
                                <TreeSelect
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    value={form.getFieldValue('oneKeyOrderId')}
                                    treeData={businessTypeTreeBeans}
                                    onChange={oneKeyOrderChange}
                                    placeholder="请选择业务类型"
                                    treeDefaultExpandAll
                                    showSearch
                                    allowClear
                                    treeNodeFilterProp="title"
                                    showCheckedStrategy="SHOW_PARENT"
                                    onSelect={(value) => {
                                        // 如果选择了非叶子节点，则取消选择
                                        if (!oneKeyOrdersLeafValues.includes(value)) {
                                            setTimeout(() => {
                                                form.setFieldsValue({ oneKeyOrderId: undefined });
                                            }, 0);
                                        }
                                    }}
                                />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '14' ? (
                        <>
                            <Form.Item label="选择业务类型" name={'businessTypeId'} rules={[{ required: true, message: '请选择业务类型' }]}>
                                {!businessType && <Select
                                    style={{width: "calc(100% - 60px)", display: "inline-block"}}
                                    showSearch={true}
                                    allowClear={true}
                                    placeholder="请选择业务类型"
                                    value={form.getFieldValue("businessTypeId")}
                                    onChange={businessTypeIdChange}
                                    options={[
                                        {value: "1", label: "修改服务密码"},
                                        {value: "2", label: "修改服务密码-直接重置"},
                                        {value: "3", label: "重置服务密码"},
                                        {value: "4", label: "身份证获取"},
                                        {value: "5", label: "客户编码获取"},
                                        {value: "6", label: "宽带初始密码设置"},
                                        {value: "7", label: "营销助手自动办理"},
                                        {value: "8", label: "告知类流程备注"},
                                        {value: "12", label: "人工转置顶IVR流程"},
                                    ]}
                                    >
                                </Select>}
                                {businessType && <Input
                                    placeholder='请选择业务类型'
                                    style={{width: "calc(100% - 60px)", display: "inline-block"}}
                                    value={form.getFieldValue("businessTypeId")}
                                    onChange={businessTypeIdChange} >
                                </Input>}
                                <Switch
                                    style={{"marginLeft": "10px"}}
                                    onChange={businessTypeIdChecked}
                                    value={businessType} />
                            </Form.Item>
                            <Form.Item label="场景分类" name={"sceneType"} rules={[{ required: ["8", "12"].indexOf(form.getFieldValue("businessTypeId") + "") > -1, message: "请输入场景分类"}]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="转接方式类型" name={"transferMode"} rules={[{ required: true, message: "请选择转接方式类型"}]}>
                                <Select
                                    options={[
                                        {value: "0", label: "释放转"},
                                        {value: "1", label: "挂起转"},
                                    ]} />
                            </Form.Item>
                            <Form.Item label="转出类型" name={"transferType"} rules={[{ required: true, message: "请选择转出类型"}]}>
                                <Select
                                    options={[
                                        {value: "IVR", label: "转IVR流程"},
                                        {value: "IVVR", label: "转IVVR流程"},
                                    ]} />
                            </Form.Item>
                            <Form.Item label="接入码" name={"accessCode"} rules={[{ required: false }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="鉴权码" name={"authenticationCode"} rules={[{ required: false }]}>
                                <Input />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '31' ? (
                        <>
                            <Form.Item label="开始/结束" name={"imMessageType"} rules={[{required: true, message: "请选择开始/结束"}]}>
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value="0">开始</Radio.Button>
                                    <Radio.Button value="1">结束</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '17' ? (
                        <>
                            <Form.Item label="服务ID" name={'serviceId'} tooltip='使用用后即评功能需要申请该应用对应的服务ID'>
                                <Input placeholder="使用用后即评功能需要申请该应用对应的服务ID" />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '18' ? (
                        <>
                            <Form.Item label="文本内容" name={'receiveSendMsgContent'} tooltip='发送到交谈区的文本内容，不支持富文本'>
                                <VariableBind />
                            </Form.Item>
                            <Form.Item label="发送类型" name={'receiveSendMsgType'} tooltip='选择发送到编辑区或者交谈区'>
                                <Radio.Group
                                    value={form.getFieldValue('receiveSendMsgType')}
                                    defaultValue={form.getFieldValue('receiveSendMsgType') ? form.getFieldValue('receiveSendMsgType') : '1'}
                                    options={[
                                        { value: '1', label: '编辑区' },
                                        { value: '2', label: '交谈区' },
                                    ]}
                                />

                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return ["25", "26"].indexOf(form.getFieldValue("eventNm") + "") > -1 ? (<>
                        <Form.Item label="信息验证类型" name={"validationTypeId"} rules={[{ required: true, message: "请选择信息验证类型"}]}>
                            <Select
                                options={[
                                    {value: "ownId", label: "身份证验证"},
                                    {value: "faceCheck", label: "人脸认证"},
                                    {value: "cipher", label: "服务密码验证"},
                                ]} />
                        </Form.Item>
                    </>) : null
                }}
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {() => {
                    return form.getFieldValue('eventNm') === '34' ? (
                        <>
                            <Form.Item label="受理号码字段" name={'acceptTelphoneField'} rules={[{ required: true, message: '请输入受理号码字段' }]} tooltip="请输入受理号码字段">
                                <Input placeholder="请输入受理号码字段" />
                            </Form.Item>
                        </>
                    ) : null;
                }}
            </Form.Item>
            <Modal
                title="同屏卡片 "
                open={cardChooseData}
                onCancel={() => {
                    setCardChooseData(false);
                }}
                footer={null} // 移除默认底部按钮
                width={1255}
                height={600}
                maskClosable={false} // 设置为false，点击遮罩不关闭
                destroyOnClose // 关闭时销毁子元素
            >
                <div className={styles.serviceOrchestrationPage}>
                    <div className={styles.dataSourceManage}>
                        <iframe ref={iframeRef} className={styles.dataSourcePage} src={baseApiConvert(screenCardUrl)} frameBorder={'0'}></iframe>
                    </div>
                </div>
            </Modal>
        </>
    );
};
export default CrossAPIEventAction;
