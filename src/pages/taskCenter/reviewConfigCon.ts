export interface ReviewProcessChild {
    name: string,
    reviewState: string,
    staffWay: string,
    reviewWay: string,
    reviewStaffIds: string[],
    reviewStaffId: string,
    reviewStaffNm?: string,
    open?: boolean,
    options?: any[],  // 项目成员对应的下拉
    options2?: any[],  // 指定成员对应的下拉
    searchText?: string,
    noData?: string,
    selectLoading?: boolean,
    selectkey: number,
}
export interface ReviewProcess {
    name: string,
    child: ReviewProcessChild[],
}

export const appReviewProcessArr: ReviewProcess[] = [
    {
        name: '发布审核',
        child: [
            {
                name: '网络安全检查审核',
                reviewState: 'netSafe',
                staffWay: '1',  // 审核人员方式 1项目2指定0需求提交人
                reviewWay: '2', //审核方式  暂时固定为 2或签    1为会签
                reviewStaffIds: [],
                reviewStaffId: '',   // reviewStaffIds.join()
                reviewStaffNm: '',
                open: false,
                options: [],
                options2: [],
                noData: '点击查找获取数据',
                selectkey: 0,
            },
            {
                name: '数据安全检查审核',
                reviewState: 'dataSafe',
                staffWay: '1',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                reviewStaffNm: '',
                open: false,
                options: [],
                options2: [],
                searchText: '',
                noData: '点击查找获取数据',
                selectkey: 0,
                selectLoading: false,
            },
            {
                name: '应用发布审核',
                reviewState: 'app',
                staffWay: '1',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
            {
                name: '一致性确认审核',
                reviewState: 'once',
                staffWay: '0',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                selectkey: 0,
            },
        ]
    },
    {
        name: '上架审核',
        child: [
            {
                name: '上架审核',
                reviewState: 'up',
                staffWay: '1',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
        ]
    },
    {
        name: '回滚审核',
        child: [
            {
                name: '回滚审核',
                reviewState: 'rollback',
                staffWay: '1',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
        ]
    },
    {
        name: '下架审核',
        child: [
            {
                name: '下架审核',
                reviewState: 'down',
                staffWay: '1',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
        ]
    },
];
export const tempReviewProcessArr: ReviewProcess[] = [
    {
        name: '发布审核',
        child: [
            {
                name: '发布审核',
                reviewState: 'app',
                staffWay: '1',  // 审核人员方式 1项目2指定0需求提交人
                reviewWay: '2', //审核方式  暂时固定为 2或签    1为会签
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
        ]
    },
];
export const compReviewProcessArr: ReviewProcess[] = [
    {
        name: '发布审核',
        child: [
            {
                name: '发布审核',
                reviewState: 'app',
                staffWay: '1',  // 审核人员方式 1项目2指定0需求提交人
                reviewWay: '2', //审核方式  暂时固定为 2或签    1为会签
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
        ]
    },
];
export const eleReviewProcessArr: ReviewProcess[] = [
    {
        name: '发布审核',
        child: [
            {
                name: '发布审核',
                reviewState: 'app',
                staffWay: '1',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
        ]
    },
    {
        name: '回滚审核',
        child: [
            {
                name: '回滚审核',
                reviewState: 'rollback',
                staffWay: '1',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
        ]
    },
    {
        name: '下线审核',
        child: [
            {
                name: '下线审核',
                reviewState: 'down',
                staffWay: '1',
                reviewWay: '2',
                reviewStaffIds: [],
                reviewStaffId: '',
                noData: '点击查找获取数据',
                selectkey: 0,
            },
        ]
    },
];
export const treeDataBase = [
    {
        id: '1',
        name: '全网',
        pId: '0',
        rangeType: 'all',
    },  
];
