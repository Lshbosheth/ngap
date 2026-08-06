import React, {  forwardRef, useImperativeHandle, useState, useEffect,useRef } from 'react';
import {Timeline, Tag, App, Drawer, Steps, Form, Input, Select, Button, Row, Col, Upload, Space, Progress } from 'antd';
import { useNavigate } from 'react-router-dom'
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import type { TimelineItemProps } from 'antd';
import {CheckCircleOutlined,CloseCircleOutlined,FileExcelOutlined} from '@ant-design/icons';
import './versionHost.less';
import Upcheckty from '..//applicationList/upcheckty'; //上架详情
interface FileInfo {
    nm: string;  // 文件名称
    url: string; // 文件链接
}
function versionHosts(_: any, ref: any) {
    const updeRefqw = useRef<{ open: (data: any) => void }>();
    const { message } = App.useApp();
    const reviewStateOpt: Record<string, string> = {
        pubSub: '应用发布提交',
        netSafe: '网络安全审核',
        dataSafe: '数据安全审核',
        app: '应用发布审核',
        once: '一致性确认',
        upSub: '应用上架提交',
        up: '上架审核',
        downSub: '应用下架提交',
        down: '下架审核',
        downNotice: '下架公示',
        rollbackSub: '应用回滚提交',
        rollback: '回滚审核'
    };
    // 状态映射
    const statusConfig: Record<string, any> = {
        '': { color: '#52c41a', text: '同意', icon: <CheckCircleOutlined /> },
        '0': { color: '#ff4d4f', text: '不同意', icon: <CloseCircleOutlined /> },
        '1': { color: '#52c41a', text: '同意', icon: <CheckCircleOutlined /> },
        '2': { color: '#1890ff', text: '转派', icon: null }
    };
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const [TenantList, statusOptions] = useState<any>([]);
    const [drawerOpens, setDrawerOpen] = useState(false);  // 详情抽屉显隐
    const { Step } = Steps;
    const [recodeList, setRecodeList] = useState<any>([]);  //  审核记录
    const queryAppReviewHisList = async (data:any) => {  // 获取审核记录数据
            try {
                request
                    .post('appReview/queryAppReviewHisList', { params: {
                        markId: data.id,    // 只传它 查该markId全部审核记录
                        markVersion: data.belongVersion
                    }})
                    .then((res) => {
                        setRecodeList(res.beans);
                    })
                    .catch((err) => { setRecodeList([]); });
            } catch (error) {
                console.error('获取审核记录数据失败:', error);
            } finally { }
        };
    useEffect(() => {
        TenantList?.id && queryAppReviewHisList(TenantList);
    }, [TenantList]);
     useImperativeHandle(ref, () => ({
            open: (data: any) => {
                data.markType = '123456'
                setDrawerOpen(true);
                statusOptions(data)
            },
        }));
    const downloadUploadedFile = (fileInfo: FileInfo) => {
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = fileInfo.url;
            document.body.appendChild(iframe);
            // 下载完成后移除 iframe
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 3000); // 给予足够时间开始下载
        } catch (error) {
            message.error('文件下载失败');
        }
    };
    const timelineItems: TimelineItemProps[] = recodeList?.map((step:any) => {
        const config = statusConfig[step?.reviewResult || ''];
        return {
        color: config?.color,
        children: (
            <div className='versionHost'>
            {/* 标题 */}
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>
                {reviewStateOpt[step?.reviewState]}
            </div>

            {/* 操作人、用时、时间 */}
            <div style={{ display: 'flex', gap: 32, marginBottom: 8, color: '#666' }}>
                <span>
                {step.opeStaffNm} {step.opeStaffId}
                </span>
                <span>用时：{step.usedTime}</span>
                <span>{step.opeTime}</span>
            </div>

            {/* 审批意见 */}
            <div style={{ color: '#333' }}>
                <span>审批意见：</span>
                <span>
                    { step.reviewState === 'upSub' ? step.opeDesc.split(/(“菜单详情”按钮；)/g).map((str:any, stri: number) => {
                        if (str === '“菜单详情”按钮；') {
                        return (
                    <a
                            key={stri}
                            href="javascript:void(0)"
                            className="menu-detail-link"
                            onClick={() =>   updeRefqw.current?.open(TenantList)}
                    >
                            菜单详情
                    </a>
                        );
                        }
                        return <span key={stri}>{str}</span>;
                    }) : step.opeDesc}
                    {Object.keys(JSON.parse(step.uploadFiles)).map((key, keyi) => (
                        <div key={keyi}>
                            {key === 'netSafe' ? '网络安全检查附件：' : key === 'dataSafe' ? '数据安全检查附件：' : '附件：' }
                            {JSON.parse(step.uploadFiles)[key].length ? (JSON.parse(step.uploadFiles)[key][0].nm && (
                                <span
                                    style={{
                                        fontSize: 14,
                                        color: '#0085D0',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                    onClick={() => downloadUploadedFile(JSON.parse(step.uploadFiles)[key][0])}
                                >
                                    {JSON.parse(step.uploadFiles)[key][0].nm}
                                    {/* <img src={new URL(`../applicationList/asset/downloadIcon.png`, import.meta.url).href} alt="" /> */}
                                </span>
                            )) : null}
                        </div>
                    ))}
                </span>
                </div>
            </div>
        ),
        };
    });
    return (
         <>
         <Drawer
                width="45vw"
                title='审核记录'
                open={drawerOpens}
                onClose={() => {
                    setDrawerOpen(false);
                }}
                destroyOnClose={true}
                keyboard={false}
                maskClosable={false}
                rootClassName="custom-drawer-root"
                getContainer={false}
            >
                <div style={{ padding: 24, background: '#fff' }}>
                     <Timeline mode="left" items={timelineItems} />
                </div>
            </Drawer>
            <Upcheckty
                onrefFun={() => {
                }}
                ref={updeRefqw}
            />
         </>
  );
};

export default forwardRef(versionHosts);
