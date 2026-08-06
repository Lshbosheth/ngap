export interface IAchievementsListItem {
    appId: string;
    relationNm: string;
    appPovcode: string;
    projectNm: string;
    likeCount: number;
    feedRate?: number;
    disLikeCount: number;
    disLikeRate?: number;
    totalCount: number;
    relationId: string;
}
export interface IAchievementsDetailItem {
    appId: string
    projectId: string
    relationId: string;
    relationNm: string;
    enumType: string;
    enumResult: string;
    enumTime: string;
    staffId: string;
    staffProvCode: string;
    staffType: string;
}

export interface IEvaluationDetailItem {
    appName: string;
    evaluateType: string;
    evaluateResult: string;
    evaluateTime: string;
    employeeId: string;
    province: string;
    employeeType: string;
}
