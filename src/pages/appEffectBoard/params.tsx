import {RESULT_ARR} from "@/pages/evaluateRecord/params";
import {publictData} from "@/utils/appMenuData";
import {Button, Input, Space} from "antd";
import {SearchOutlined} from "@ant-design/icons";

interface FilterDropProps{
    setSelectedKeys:any,
    selectedKeys:any[],
    confirm:()=>void,
    clearFilters:()=>void
}

export const getColumns = (res: any, showDetail: any, jump2Record: any,search:any):any => {

    const handleSearch = (selectedKeys:any, confirm:any, dataIndex:any) => {
        confirm()
        search(dataIndex,selectedKeys[0])
    }

    const handleReset = (clearFilters:any,selectedKeys:any)=>{
        clearFilters()
        selectedKeys[0] = ''
    }

    const getRange = (currentItem:any)=>{
        return `${currentItem?.startTime || ''}-${currentItem?.endTime || ''}`
    }

    const getProvName = (provId: string) => {
        if (provId === '0000') {
            return '总部'
        }
        return publictData.provId2provName[provId] || '--'
    }

    const getColumnSearchProps = (dataIndex: string, title: string) => ({

        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}:FilterDropProps) => {
            return <div style={{padding: 8}} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    placeholder={`请输入${title}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{marginBottom: 8, display: 'block'}}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        size="small"
                        style={{width: 90}}
                    >搜索</Button>

                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters,selectedKeys)}
                        size="small"
                        style={{width: 90,marginLeft:10}}
                    >重置</Button>
                </Space>
            </div>
        },
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{color: filtered ? '#1677ff' : undefined}}/>
        ),
    });


    if (res === '0') {
        //未评估应用
        return [
            {
                title: '应用名称',
                dataIndex: 'appNm',
                key: 'appNm',
                ellipsis: true,
                ...getColumnSearchProps('appNm', '应用名称')
            },
            {
                title: '应用状态',
                dataIndex: 'appStatus',
                key: 'appStatus',
                width: 100,
                render: (appStatus: string) => {
                    let color = '';
                    if (appStatus == '6') {
                        // 已上架
                        color = '#009944';
                    } else if (appStatus == '2') {
                        // 已发布
                        color = '#0085d0';
                    } else if (appStatus == '3' || appStatus == '5' || appStatus == '8' || appStatus == '10') {
                        // 发布审核、下架审核、上架审核、回滚审核
                        color = '#f38900';
                    } else if (appStatus == '11') {
                        // 下架公示
                        color = '#f65a56';
                    } else if (appStatus == '9' || appStatus == '12') {
                        // 已废弃、已下架
                        color = '#bfbfbf';
                    } else if (appStatus == '1' || appStatus == '7' || appStatus == '4') {
                        // 草稿、已停用、应用提交
                        color = '#595959';
                    }
                    return <div
                        style={{color: color}}>{publictData.schemeStateArr.find((item) => item.value == appStatus)?.label}</div>;
                },
            },
            {
                title: '版本',
                dataIndex: 'belongVersion',
                key: 'belongVersion',
                width: 100
            },
            {
                title: '评估状态',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: () => <div>未评估</div>
            },
            {
                title: '归属省份',
                dataIndex: 'provId',
                key: 'provId',
                width: 100,
                render: (provId: string) => <div>{getProvName(provId)}</div>
            },
            {
                title: '归属项目',
                dataIndex: 'projectNm',
                key: 'projectNm',
            },
            {
                title: '应用创建时间',
                dataIndex: 'creatTime',
                key: 'creatTime',
            },
            {
                title: '创建人工号',
                dataIndex: 'createStaffId',
                key: 'createStaffId',
            },
        ]
    }
    return [
        {
            title: '应用名称',
            dataIndex: 'appNm',
            key: 'appNm',
            ellipsis: true,
            ...getColumnSearchProps('appNm', '应用名称')
        },
        {
            title: '评估周期',
            dataIndex: 'range',
            key: 'range',
            width: 300,
            render: (_: string,record:any) => <div>{getRange(record)}</div>
        },
        {
            title: '评估依据',
            dataIndex: 'yj',
            key: 'yj',
            width: 100,
            render: (_: string, record: any) => <div className={'yypg-table-col-detail'} onClick={() => {
                showDetail(record)
            }}>
                查看详情
            </div>
        },
        {
            title: '评估结论',
            dataIndex: 'evaluateRes',
            key: 'evaluateRes',
            width: 100,
            render: (text: string) => <div>{RESULT_ARR.find(item => item.value === text)?.title}</div>
        },
        {
            title: '结论说明',
            dataIndex: 'resDesc',
            key: 'resDesc',
            width: 200,
            ellipsis: true,
        },
        {
            title: '评估状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: () => <div>已评估</div>
        },
        {
            title: '评估时间',
            dataIndex: 'evaluateTime',
            key: 'evaluateTime',
            width: 200,
        },
        {
            title: '评估工号',
            dataIndex: 'evaluateStaffId',
            key: 'evaluateStaffId',
            width: 100
        },
        {
            title: '评估记录',
            dataIndex: 'record',
            key: 'record',
            width: 100,
            render: (text: string, record: any) => <div>
                {text}
                <span style={{marginLeft: 10}} className={'yypg-table-col-detail'} onClick={() => {
                    jump2Record(record)
                }}>查看</span>
            </div>
        },
    ]
}

export interface ProvProps {
    label: string,
    value: string
}

export const appTypeArr = [
    {label: '一级应用', value: '1'},
    {label: '二级应用', value: '2'},
]
