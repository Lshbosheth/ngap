import React, { useState, useEffect } from 'react';
import { Select,Modal,Col,Card,Row} from 'antd';
import { message } from '@/utils/AntdGlobal';
import { useNavigate } from 'react-router-dom'
import styles from './index.module.less';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import {RightOutlined, PlusOutlined,TeamOutlined,UserAddOutlined,ClockCircleOutlined,CodeSandboxOutlined} from '@ant-design/icons';
import AddHtml from '../MyActivity/myActiviChild/activityAdd';
import blue from './img/bl.png';
import qblue from './img/qbl.png';
import orage from './img/og.png';
import yingy from './img/yy.png';
// 定义模板数据的接口
interface HotlineTemplate {
    "createStaffId": "",
    "tenantName": "",
    "projectCode": "",
    "createTime": "",
    "projectDesc": "",
    "updateStaffId": "",
    "updateTime": "",
    "tenantCode": "",
    "projectName": "",
    "projectId": "",
    "memberNums": number,
    "appNums":number
  }

const TenantManagePage: React.FC = () => {
    const navigate = useNavigate()
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const [TenantList, statusOptions] = useState([]);
    const [searList, setsearList] = useState('');
    const [isModel, setisModel] = useState(false);
    const [isEdit, setisEdit] = useState(false); //是否点击编辑
    const [isAddEdit, setisAddEdit] = useState(false); //是否点击成员编辑
    const [loading, setLoading] = useState(false); //
    const [editsData, seteditsData] = useState([]); //
    const [list, setList] = useState([]);
    const [formData, setFormData] = useState({
        projectName: '', // 项目名称
        tenantCode: '', // 归属租户ID
        projectDesc: '', // 项目描述,
        adminStaffId:'',//租户管理员
        staffId: userInfo.staffId,
        isAdmin: userInfo.isAdmin || '0',
        page: 1, // 当前页码
        start: 0,
        limit: 10,
    });

    useEffect(() => {
        let NewArr = userInfo?.tenantInfos?.map((item: any, index: number) => ({
            value: item.configId,
            label: item.tenantName,
            adminStaffId: item.adminStaffId,
        }));
        statusOptions(NewArr);
        // 设置默认租户为当前选中的租户
        const currentTenant = userInfo?.tenantInfos?.find((item: any) =>
            item.tenantCode === userInfo.selectedTenantId
        );
        if (currentTenant) {
            setFormData((prev:any)=>({
                ...prev,
                tenantCode: currentTenant.configId,
                adminStaffId: currentTenant.adminStaffId
            }));
        } else if (NewArr[0]?.value) {
            setFormData((prev:any)=>({
                ...prev,
                tenantCode:NewArr[0].value,
                adminStaffId: NewArr[0].adminStaffId
            }));
        }
    }, [userInfo.selectedTenantId, userInfo.tenantInfos]);
    
    useEffect(() => {
        formData.tenantCode && queryListTypeFun();
    }, [formData.tenantCode]);
     // 列表查询
     const queryListTypeFun = () => {
        setLoading(true);
        try {
            request
                .post('/appProject/queryAppProjectList', {
                    params: {
                        ...formData,
                    },
                })
                .then((res) => {
                    setList(res?.beans)
                })
                .catch((err) => {});
        } catch (error) {
            message.error('列表查询失败');
        } finally {
            setLoading(false);
        }
    };
   
    const onAddClick = (dats: boolean) => {
        setisEdit(false);
        setisAddEdit(false);
        seteditsData([]);
        setisModel(dats);
        !dats && queryListTypeFun();
    };
    const onEditClick = (index:number) => {
        seteditsData(list[index]);
        setisEdit(true);
        setisAddEdit(false);
        setisModel(true);
    };
     // 2. 渲染单个卡片模板
  const renderItem = (item: HotlineTemplate,index:number) => (
    
    <Col style={{minWidth:'300px'}} xs={24} sm={12} lg={8} xl={8}> 
      <Card 
        bodyStyle={{ padding: '12px' }}
        hoverable 
        style={{height: '100%' }} // 高度撑满
      >
        {/* 头部标题与操作 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',marginBottom:10 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#000',width:'73%',height:30,lineHeight:30 }}>
           {index == 0 && 
                <img 
                    style={{width:'30px',height:'30px',marginRight: 4 }}
                    src={blue} 
                />
            } 
            {index == 1 &&
                <img 
                    style={{width:'30px',height:'30px',marginRight: 4 }}
                    src={qblue} 
                />
            }
           {index == 2 &&
                <img 
                    style={{width:'30px',height:'30px',marginRight: 4 }}
                    src={orage} 
                />
            }
             {item.projectName}
          </div>
          <div>
            
            <a href="javaScript:;" onClick={()=>onEditClick(index)}>详情</a>
          </div>
        </div>

        {/* 描述文本 */}
        <p style={{ color: '#666', fontSize: 12,height:56,width:'100%',overflow:'hidden' }}>
          {item.projectDesc || '描述描述描述描述描述描述描述描述描述'}
        </p>

        {/* 底部信息栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#333' }}>
          <div>
            <div style={{ marginBottom: 8,marginLeft:2 }}>
              <TeamOutlined style={{ marginRight: 4 }} /> {item.memberNums}
            </div>
            <div style={{position:'relative'}}>
                <img 
                    style={{width:'20px',height:'20px',marginRight: 4,position:'relative',top:5 }}
                    src={yingy} 
                />
               {item.appNums}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: 8 }}>
            <UserAddOutlined style={{ marginRight: 4 }} /> {item.createStaffId}
            </div>
            <div>
              <ClockCircleOutlined style={{ marginRight: 4 }} /> {item.createTime}
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );

    return (
        <div style={{}}>
                <div style={{position:"relative",width:'100%',height: '25px'}}>
                    <div style={{position:'absolute'}} className={styles.tenantTitlefh}>我的项目
                        <Select
                            style={{ width: 120 ,marginLeft:'15px'}}
                            value={formData.tenantCode}
                            options={TenantList}
                            onChange={(value) => {
                                 const newTenant:any = TenantList?.find((item: any) =>
                                    item.value === value
                                );
                                setFormData((prev:any)=>({
                                ...prev,
                                    tenantCode:value,
                                    adminStaffId:newTenant?.adminStaffId
                                }))
                            }}
                        />
                    </div>
                    <span
                        style={{position:'absolute',right:'80px',top:3,zIndex:'20'}}
                        className={styles.backBtnfhi}
                        onClick={() => {
                            onAddClick(true);
                        }}
                    >
                        <PlusOutlined className={styles.backArrow} />
                        创建项目
                    </span>
                    <span
                        style={{position:'absolute',right:'0px',top:3,zIndex:'20'}}
                        className={styles.backBtnfhi}
                        onClick={() => {
                            navigate('MyActivity?tenantCode='+formData.tenantCode)
                        }}
                    >
                        查看更多
                        <RightOutlined className={styles.backArrow} />
                    </span>
                </div>
                <div style={{marginTop:'20px'}}>
                    <Row gutter={[16, 16]}> {/* gutter 是卡片间距 */}
                        {loading ? (
                        // 加载骨架屏
                        <div>加载中...</div> 
                        ) : (
                        list.slice(0, 3).map((item:any,index:number) => renderItem(item,index))
                        )}
                    </Row>
                </div>
                    <Modal
                        title={isEdit ? (isAddEdit ? '成员管理' : '编辑项目') : '新增项目'}
                        open={isModel}
                        mask={true}
                        maskClosable={false}
                        footer={null}
                        width={1000}
                        destroyOnClose={true}
                        closable={false}
                        >
                    <AddHtml 
                        isEdit={isEdit} 
                        tenantCode={formData.tenantCode}
                        isAddEdit={isAddEdit}
                        editsData={editsData} 
                        TenantLists={TenantList} 
                        onCancel={() => onAddClick(false)} 
                    />
                </Modal>
            </div>
    );
};

export default TenantManagePage;
