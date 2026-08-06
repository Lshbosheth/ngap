import { Outlet, Link, useNavigate } from 'react-router-dom';
import styles from './index.module.less';
import {RightOutlined } from '@ant-design/icons';
import TaskCnSm from './taskCnSm';
import {Row,Col} from 'antd'
import MyAcSm from './MyAcSm';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import DataIndicator from "@/pages/Workbench/dataIndicator";
import CreateRecent from "@/pages/Workbench/createRecent";
import FreUse from "@/pages/Workbench/freUse";
import WarnNotice from "@/pages/Workbench/warnNotice";
import './index.less'
export default function Workbench() {
    const navigate = useNavigate();
    const userInfo = crossApiUserInfo((state) => state.userInfo);

    // 使用租户ID作为key，确保租户切换时强制重新渲染组件
    return <div style={{height:850,overflowY:'auto'}} className={styles.topbox}>
        <div className={styles.leftBox}>
            <div style={{display:'none'}} className={styles.leftbox1}>
                统计参数
            </div>
            <Row style={{marginBottom:10}}>
                <Col span={10}>
                    <DataIndicator key={`indicator-0-${userInfo.selectedTenantId}`} index={0}/>
                </Col>

                <Col span={14} style={{paddingLeft:10}}>
                    <DataIndicator key={`indicator-1-${userInfo.selectedTenantId}`} index={1}/>
                </Col>
            </Row>

            <CreateRecent key={`create-recent-${userInfo.selectedTenantId}`}/>

            <Row>
                <Col span={16}>
                    <div className={styles.leftbox2}>
                        <div className={styles.tenantBox}>
                            <TaskCnSm key={`task-${userInfo.selectedTenantId}`} />
                        </div>
                    </div>
                </Col>

                <Col span={8} style={{paddingLeft:10}}>
                    <FreUse/>

                    <WarnNotice/>
                </Col>
            </Row>

            {/*<div className={styles.leftbox3}>*/}
            {/*    <div className={styles.tenantBox}>*/}
            {/*        <MyAcSm key={`myac-${userInfo.selectedTenantId}`} />*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div style={{display:'none'}} className={styles.leftbox4}>
                运行态势
            </div>
        </div>
        <div  style={{display:'none'}} className={styles.rightBox}>
            <div style={{display:'none'}} className={styles.rightBox1}>常用功能</div>
            <div style={{display:'none'}} className={styles.rightBox2}>热门应用</div>
            <div style={{display:'none'}} className={styles.rightBox3}>资产中心</div>
            <div style={{display:'none'}} className={styles.rightBox4}>帮助文档</div>
        </div>
        {/* 👇 核心：渲染子路由对应的组件（必填） */}
        <div style={{position:'absolute',width:'100%',top:'40px'}}>
            <Outlet />
        </div>
    </div>;
}
