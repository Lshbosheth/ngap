import { Form,  Button, Table, Input,TreeSelect, FormInstance,Tooltip} from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { PlusOutlined, DeleteOutlined,QuestionCircleOutlined  } from '@ant-design/icons';
import { useShallow } from 'zustand/react/shallow';
import styles from './index.module.less';
import VariableBind from './../../../components/VariableBind/VariableBind';
import { useAppContext } from './../../../utils/AppProvider';
import request from '@/utils/request';
import { crossApiUserInfo } from '../../../stores/crossapiStore';
import dealPageData, { dealPageDataId } from '@/utils/dataToCanvas';
import { set } from 'lodash';
/**
 * 调用各个组件暴露的方法
 * @returns
 */
const Componentlinkage = ({ form }: { form: FormInstance }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const { pageStore } = useAppContext();
    const baseInfo = pageStore((state: any) => state.config);
    const { updateCrossApisGlobal, crossApisGlobal,currentCrossApiRow,pageName,elements} = pageStore((state?: any) => {
        return {
            updateCrossApisGlobal: state.updateCrossApisGlobal,
            crossApisGlobal: state.page.pageData.crossApisGlobal,
            currentCrossApiRow:state.currentCrossApiRow,
            pageName: state?.config?.appName || state?.config?.componentName || '',
            elements: state?.page?.pageData?.elements || [],
        };
    });
    const evenData = form.getFieldValue('actionType');
    const [appDatas,setappDatas] = useState<any>([]);
    const [selectDataAll,setselectDataAll] = useState<any>([]);
   
    // ========== 核心改动：将 elements 树转换为 Select 的下拉树格式 ==========
    const triggerOptions = useMemo(() => {
        const processNode = (node: any, level: number = 0): any => {
            const label = node.elementAlias || node.name || node.type || '未命名';
            const result: any = {
                title: label, // 缩进展示层级
                value: node.id,
                key: node.id,
            };
            // 一级节点（level === 0）禁用选择
            if (level === 0) {
                result.disabled = true;
            }
            if (node.elements && node.elements.length > 0) {
                result.children = node.elements.map((child: any) => processNode(child, level + 1));
            }
            return result;
        };

        // 根节点为页面
        return [
            processNode({
                elementAlias: `页面【${pageName}】`,
                type: 'page',
                id: 'page',
                elements,
            }),
        ];
    }, [elements, pageName]);
     // ========== 核心改动：将 elements 树转换为 Select 的下拉树格式 ==========
    const sectOptions = (elements:any,pageNamea:string) => {
        const processNode = (node: any, level: number = 0): any => {
            const label = node.elementAlias || node.name || node.type || '未命名';
            const result: any = {
                title: label, // 缩进展示层级
                value: node.id,
                key: node.id,
            };
            // 一级节点（level === 0）禁用选择
            if (level === 0) {
                result.disabled = true;
            }
            if (node.elements && node.elements.length > 0) {
                result.children = node.elements.map((child: any) => processNode(child, level + 1));
            }
            return result;
        };

        // 根节点为页面
        return [
            processNode({
                elementAlias: `页面【${pageNamea}】`,
                type: 'page',
                id: 'page',
                elements,
            }),
        ];
    };
    // 页面组件

    const linkOptions = triggerOptions;

    interface Rule {
        key: string;
        triggerElement: string;
        linkElement: string;
        linkName:string
    }
    const selectApp = function(){
        if(!appDatas[0]){
            return
        }
        const params = {
            provId: userInfo.provinceId,
            serviceTypeId: userInfo.serviceTypeId,
            id: appDatas[0]
        };
        request
        .post('/app/queryAppAndNodeInfo',  { params: params })
        .then((res) => {
            if (res?.bean?.atomList?.length > 0) {
                const pageDataPlus  = dealPageData(res.bean);
                setselectDataAll(sectOptions(pageDataPlus?.pageData?.elements,appDatas[1]))
            } else {
            }
        })
        .catch((err) => {
        });
    };
    useEffect(() => {
        selectApp();
    }, [appDatas]);
    useEffect(() => {
    // 从 form 读取已有的 linkRules
    const existingRules = form.getFieldValue('linkRules');
    if (existingRules && Array.isArray(existingRules) && existingRules.length > 0) {
        // 回显已有数据
        setRules(existingRules.map((item: any, index: number) => ({
            key: item.key || `row-${index}-${Date.now()}`,
            triggerElement: item.triggerElement || '',
            linkElement: item.linkElement || '',
            linkName:item.linkName || ''
        })));
    } else if (!currentCrossApiRow?.appAction) {
        // 没有数据时初始化一条空规则
        setRules([{ key: Date.now().toString(), triggerElement: '', linkElement: '',linkName:'' }]);
    }
}, [form, currentCrossApiRow]);
    const [rules, setRules] = useState<Rule[]>([
        {
            key: '1',
            triggerElement: '',
            linkElement: '',
            linkName:''
        },
    ]);
    useEffect(() => {
        if(currentCrossApiRow?.appAction){
            setappDatas(currentCrossApiRow?.appAction.split('@#'))
        }
    }, [rules,currentCrossApiRow?.appAction]);

    

  // 新增一条规则
  const handleAdd = () => {
    const newKey = Date.now().toString();
    setRules([
      ...rules,
      {
        key: newKey,
        triggerElement: '',
        linkElement: '',
        linkName:''
      },
    ]);
  };

  // 删除一条规则
  const handleDelete = (key: string) => {
        setRules(rules.filter((item) => item.key !== key));
  };

  // 更新触发元素
  const handleTriggerChange = (value: string, key: string) => {
    setRules(rules.map((item) => (item.key === key ? { ...item, triggerElement: value } : item)));

  };

  // 更新联动元素
  const handleLinkChange = (value: string, key: string) => {
    setRules(rules.map((item) => (item.key === key ? { ...item, linkElement: value } : item)));
  };

  const columns = [
    {
      title:  (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        触发元素
        <Tooltip title="发起联动页面中的被点击的元素">
          <QuestionCircleOutlined style={{ color: '#999' }} />
        </Tooltip>
      </div>
    ),
      dataIndex: 'triggerElement',
      key: 'triggerElement',
      width: '40%',
      render: (value: string, record: Rule,index: number) => (
        <Form.Item name={['linkRules', index, 'triggerElement']} style={{ marginBottom: 0 }}>
            <TreeSelect
                style={{ width: '100%' }}
                dropdownStyle={{ minWidth: 400 }}
                value={value || undefined}
                placeholder="请选择触发元素"
                treeData={selectDataAll}
                treeDefaultExpandAll
                allowClear
                onChange={(val) => handleTriggerChange(val, record.key)}
            />
        </Form.Item>
      ),
    },
    {
      title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        联动元素
        <Tooltip title="接收联动页面中的目标元素">
          <QuestionCircleOutlined style={{ color: '#999' }} />
        </Tooltip>
      </div>
    ),
      dataIndex: 'linkElement',
      key: 'linkElement',
      width: '40%',
      render: (value: string, record: Rule, index: number) => (
        
        <Form.Item name={['linkRules', index, 'linkElement']} style={{ marginBottom: 0 }}>
            <TreeSelect
                style={{ width: '100%' }}
                dropdownStyle={{ minWidth: 400 }}
                value={value || undefined}
                placeholder="请选择联动元素"
                treeData={linkOptions}
                treeDefaultExpandAll
                allowClear
                onChange={(val) => handleLinkChange(val, record.key)}
            />
        </Form.Item>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (_: unknown, record: Rule,index:number) => (
        <><Form.Item
            name={['linkRules', index, 'linkName']}
            initialValue={baseInfo.appName}
            hidden
        >
            <Input />
        </Form.Item>
        <Button
          danger
          type="link"
          onClick={() => handleDelete(record.key)}
        >
          删除
        </Button></>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: 0, padding: 14 }}>
      {/* 标题 + 新增按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{width: '80%',overflow: 'hidden',textOverflow: 'ellipsis',whiteSpace: 'nowrap'}}>
          联动页面：
          <span style={{ fontSize: 14, fontWeight: 600 }}>{appDatas[1]}</span>
        </div>
        <Button
          type="primary"
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加
        </Button>
      </div>

      {/* 规则表格 */}
      <Table
        dataSource={rules}
        columns={columns}
        pagination={false}
        bordered
        size="small"
      />
    </div>
  );
};
export default Componentlinkage;
