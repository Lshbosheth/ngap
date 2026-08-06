import './index.less'
import '../index.less'
import {Button, Modal} from "antd";
import {PlusOutlined, RightOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import Item from "@/pages/Workbench/createRecent/item";
import {useNavigate} from "react-router-dom";
import {hasPermission} from "@/config/permissionConfig";
import AddHtml from "@/pages/MyActivity/myActiviChild/activityAdd";
import {crossApiUserInfo} from "@/stores/crossapiStore";
import request from "@/utils/request";

const CreateRecent = () => {
    const navigate = useNavigate()
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);

    const [showModal, setShowModal] = useState(false)

    const [tenantCode, setTenantCode] = useState('')

    const [tenantList, setTenantList] = useState([])

    const [dataSource, setDataSource] = useState([
        {title: '--', desc: '--', online: '--', total: '--'},
        {title: '--', desc: '--', online: '--', total: '--'},
        {title: '--', desc: '--', online: '--', total: '--'},
    ])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const params = {
                provId: userInfo.provinceId
            }
            const resp = await request.post('/appConsole/queryAppCountCard', {params})
            const arr = resp.beans.map((item: any) => ({
                title: item.projectNm,
                desc: item.projectDesc,
                online: resp.bean?.[`${item.projectId}_online`]?.length || 0,
                total: resp.bean?.[`${item.projectId}_all`]?.length || 0,
            }))
            setDataSource(arr)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        const currentTenant = userInfo?.tenantInfos?.find((item: any) =>
            item.tenantCode === userInfo.selectedTenantId
        )
        setTenantCode(currentTenant?.configId)

        let NewArr = userInfo?.tenantInfos?.map((item: any) => ({
            value: item.configId,
            label: item.tenantName,
            adminStaffId: item.adminStaffId,
        }))
        setTenantList(NewArr);

    }, [userInfo.selectedTenantId, userInfo.tenantInfos])

    const onMore = () => {
        navigate(`MyActivity?tenantCode=${tenantCode || ''}`)
    }

    const onCreateApp = () => {
        navigate('build', {state: {path: 'applicationOrchestration'}})
    }

    const onCreateProject = () => {
        setShowModal(true)
    }

    return <div className={'create-recent-wrap'}>
        <div className={'create-recent-top'}>
            <div>
                <span className={'work-bench-title'}>最新创建</span>&nbsp;
                {hasPermission('项目管理') &&
                    <Button style={{marginRight: 10}} type={'primary'} ghost onClick={onCreateProject}><PlusOutlined/>创建项目</Button>}
                {hasPermission('应用创建') &&<Button type={'primary'} ghost onClick={onCreateApp}><PlusOutlined/>创建应用</Button>}
            </div>
            {hasPermission('项目管理') &&<div className={'create-recent-top-more'} onClick={onMore}>查看更多<RightOutlined/></div>}
        </div>

        <div className={'create-recent-data-wrap'}>
            {dataSource.map((item: any, index: number) => <Item index={index} data={item}/>)}
        </div>

        <Modal
            title={'新增项目'}
            open={showModal}
            mask={true}
            maskClosable={false}
            footer={null}
            width={1000}
            destroyOnClose={true}
            closable={false}
        >
            <AddHtml
                isEdit={false}
                tenantCode={tenantCode}
                isAddEdit={false}
                editsData={[]}
                TenantLists={tenantList}
                onCancel={() => setShowModal(false)}
            />
        </Modal>
    </div>
}

export default CreateRecent
