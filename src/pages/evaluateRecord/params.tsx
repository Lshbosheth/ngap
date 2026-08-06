export interface ItemProps {
    evaluateId: string,
    appNm: string,
    evaluateStaffNm: string,
    evaluateStaffId: string,
    startTime: string,
    endTime: string,
    evaluateRes: string,
    resDesc: string,
}

export const getColumns = (setShowModal:(record:ItemProps)=>void)=>{
    return [
        {
            title: '应用名称',
            dataIndex: 'appNm',
            key: 'appNm',
            ellipsis: true
        },
        {
            title: '评估周期',
            dataIndex: 'range',
            key: 'range',
            width: 300,
            render:(_:string,record:ItemProps)=><div>{record.startTime} - {record.endTime}</div>
        },
        {
            title: '评估依据',
            dataIndex: 'depend',
            key: 'depend',
            width: 100,
            render: (_:string,record:ItemProps) => <div className={'col-detail'} onClick={()=>{setShowModal(record)}}>查看详情</div>
        },
        {
            title: '评估结论',
            dataIndex: 'evaluateRes',
            key: 'evaluateRes',
            width:100,
            render:(text:string)=><div>{RESULT_ARR.find(item=>item.value === text)?.title}</div>
        },
        {
            title: '结论说明',
            dataIndex: 'resDesc',
            key: 'resDesc',
            ellipsis: true
        },
        {
            title: '评估状态',
            dataIndex: 'evaluateStatus',
            key: 'evaluateStatus',
            render:()=><div>已评估</div>
        },
        {
            title: '评估时间',
            dataIndex: 'evaluateTime',
            key: 'evaluateTime',
            width: 200
        },
        {
            title: '评估工号',
            dataIndex: 'evaluateStaffId',
            key: 'evaluateStaffId',
            width: 120
        },
    ]
}

export const enum RESULT {
   WPG='0', WJJ = '1', GJJ='2', XXJ='3'
}

export const RESULT_ARR = [
    {title: '稳健级', value: RESULT.WJJ},
    {title: '改进级', value: RESULT.GJJ},
    {title: '下线级', value: RESULT.XXJ},
    {title: '未评估', value: RESULT.WPG},
]

export const FILTER_OPTS = [
    {type: 'select', label: '评估结论', key: 'evaluateRes', opts: RESULT_ARR},
    {type: 'input', label: '评估工号', key: 'evaluateStaffId'},
    {
        type: 'dateRangePicker',
        label: '评估时间范围',
        showTime: true,
        key: 'evaluateTime',
        keyStart: 'evaluateStartTime',
        keyEnd: 'evaluateEndTime'
    },
]

export enum EVALUATE_INDICATOR {
    VISIT = 'appVisits', SEATS = 'appSeats'
}

export const evaluateIndicatorArr = [
    {title: '应用访问量', value: EVALUATE_INDICATOR.VISIT},
    {title: '覆盖坐席数', value: EVALUATE_INDICATOR.SEATS},
]
