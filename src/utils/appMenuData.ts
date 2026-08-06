// 这里是应用平台菜单内应用的公共数据

interface publictData {
    label: string;
    value: string;
    id: string;
}
type StringMap = {
    [key: string]: string;
};
// 31个省份的省份数组
const provinceIntervalArr: string[] = [
    '00030001',
    '00030002',
    '00030003',
    '00030004',
    '00030005',
    '00030006',
    '00030007',
    '00030008',
    '00030009',
    '00030010',
    '00030011',
    '00030012',
    '00030013',
    '00030014',
    '00030015',
    '00030016',
    '00030017',
    '00030018',
    '00030019',
    '00030020',
    '00030021',
    '00030022',
    '00030023',
    '00030024',
    '00030025',
    '00030026',
    '00030027',
    '00030028',
    '00030029',
    '00030030',
    '00030031',
];

// 省份下拉框对应值
const provinceSelectValue: publictData[] = [
    { label: '北京', value: '00030001', id: '00030001' },
    { label: '天津', value: '00030002', id: '00030002' },
    { label: '内蒙古', value: '00030003', id: '00030003' },
    { label: '河北', value: '00030004', id: '00030004' },
    { label: '黑龙江', value: '00030005', id: '00030005' },
    { label: '辽宁', value: '00030006', id: '00030006' },
    { label: '吉林', value: '00030007', id: '00030007' },
    { label: '山东', value: '00030008', id: '00030008' },
    { label: '河南', value: '00030009', id: '00030009' },
    { label: '山西', value: '00030010', id: '00030010' },
    { label: '陕西', value: '00030011', id: '00030011' },
    { label: '甘肃', value: '00030012', id: '00030012' },
    { label: '宁夏', value: '00030013', id: '00030013' },
    { label: '新疆', value: '00030014', id: '00030014' },
    { label: '西藏', value: '00030015', id: '00030015' },
    { label: '云南', value: '00030016', id: '00030016' },
    { label: '四川', value: '00030017', id: '00030017' },
    { label: '重庆', value: '00030018', id: '00030018' },
    { label: '湖北', value: '00030019', id: '00030019' },
    { label: '湖南', value: '00030020', id: '00030020' },
    { label: '江苏', value: '00030021', id: '00030021' },
    { label: '江西', value: '00030022', id: '00030022' },
    { label: '浙江', value: '00030023', id: '00030023' },
    { label: '福建', value: '00030024', id: '00030024' },
    { label: '广东', value: '00030025', id: '00030025' },
    { label: '广西', value: '00030026', id: '00030026' },
    { label: '贵州', value: '00030027', id: '00030027' },
    { label: '上海', value: '00030028', id: '00030028' },
    { label: '海南', value: '00030029', id: '00030029' },
    { label: '安徽', value: '00030030', id: '00030030' },
    { label: '青海', value: '00030031', id: '00030031' },
];
// 组件状态下拉框数据
const auditStatusArr: publictData[] = [
    { label: '无需审核', value: '0', id: '0' },
    { label: '待审核', value: '1', id: '1' },
    { label: '审核通过', value: '2', id: '2' },
    { label: '审核不通过', value: '3', id: '3' },
];
// 0：无需审核;1：待审核、2：审核通过、3：审核不通过
const auditStatusMap = {
    '0': '无需审核',
    '1': '待审核',
    '2': '审核通过',
    '3': '审核不通过',
};

const schemeTypeArr: publictData[] = [
    { label: '向导式页面', value: 'process', id: 'process' },
    { label: '装配式页面', value: 'base', id: 'base' },
    // {label: '工具菜单', value: 'tool', id: 'tool'},
    // {label: '信息组合卡片', value: 'card', id: 'card'},
];
const schemeTypeMap: StringMap = {
    process: '向导式页面',
    base: '装配式页面',
    tool: '工具菜单',
    card: '信息组合卡片',
};

// // 展示形式
// const showFormArr = [
//     {label: '步骤引导页面', value: 'process', id: 'process'},
//     {label: '一屏通览页面', value: 'base', id: 'base'},
// ]

const schemeStateArr: publictData[] = [
    { label: '请选择', value: '-1', id: '-1' },
    { label: '删除', value: '0', id: '0' },
    { label: '草稿态', value: '1', id: '1' },
    { label: '已发布', value: '2', id: '2' },
    { label: '发布审核', value: '3', id: '3' },
    { label: '应用提交', value: '4', id: '4' },
    { label: '上架审核', value: '5', id: '5' },
    { label: '已上架', value: '6', id: '6' },
    { label: '已停用', value: '7', id: '7' },
    { label: '回滚审核', value: '8', id: '8' },
    { label: '已废弃', value: '9', id: '9' },
    { label: '下架审核', value: '10', id: '10' },
    { label: '下架公示', value: '11', id: '11' },
    { label: '已下架', value: '12', id: '12' },
];

// 分类标签复选下拉框 1生产效能2服务质量3营销提升
const classifyLabelData: publictData[] = [
    { label: '生产效能', value: '1', id: '1' },
    { label: '服务质量', value: '2', id: '2' },
    { label: '营销提升', value: '3', id: '3' },
];

// 适用渠道
const channelArr: publictData[] = [
    { label: '热线语音', value: '1', id: '1' },
    { label: '热线视频', value: '2', id: '2' },
    { label: '互联网语音', value: '3', id: '3' },
    { label: '互联网视频', value: '4', id: '4' },
    { label: '互联网IM', value: '5', id: '5' },
];
// 模拟数据
const simulatedData: publictData[] = [
    { label: '模拟数据1', value: '1', id: '1' },
    { label: '模拟数据2', value: '2', id: '2' },
    { label: '模拟数据3', value: '3', id: '3' },
    { label: '模拟数据4', value: '4', id: '4' },
    { label: '模拟数据5', value: '5', id: '5' },
];
// 审核方式
const auditWayArr: publictData[] = [
    { label: '手动审核', value: '1', id: '1' },
    { label: '自动审核', value: '2', id: '2' },
];
// 审核结果
const auditResultArr: publictData[] = [
    { label: '审核通过', value: '1', id: '1' },
    { label: '审核不通过', value: '2', id: '2' },
];
// 审核类型
const auditTypeArr: publictData[] = [{ label: '通用组件', value: '1', id: '1' }];

// 白名单类型
const whitelistTypeArr: publictData[] = [
    { label: '场景', value: '1', id: '1' },
    { label: '敏感数据', value: '2', id: '2' },
    { label: '人员', value: '3', id: '3' },
];
// 白名单状态
const whitelistStatusArr: publictData[] = [
    { label: '开启', value: '1', id: '1' },
    { label: '关闭', value: '0', id: '0' },
];

// 服务环节数据源
// 前情总结、服务提醒、问题诊断、知识查证、服务话术、产品推荐、营销话术、办理工具，
const serviceLinkArr: publictData[] = [
    { label: '前情总结', value: '前情总结', id: '前情总结' },
    { label: '服务提醒', value: '服务提醒', id: '服务提醒' },
    { label: '问题诊断', value: '问题诊断', id: '问题诊断' },
    { label: '知识查证', value: '知识查证', id: '知识查证' },
    { label: '服务话术', value: '服务话术', id: '服务话术' },
    { label: '产品推荐', value: '产品推荐', id: '产品推荐' },
    { label: '营销话术', value: '营销话术', id: '营销话术' },
    { label: '办理工具', value: '办理工具', id: '办理工具' },
];

// 服务环节图标对应关系
const serviceLinkIconMap: StringMap = {
    意图识别: 'intentRecognition',
    问题诊断: 'problemDiagnosis',
    产品推荐: 'marketingRecommendations',
    前情总结: 'antecedentSummary',
    知识查证: 'knowledgeVerification',
    营销话术: 'marketingSkills',
    服务提醒: 'serviceReminders',
    服务话术: 'serviceSkills',
    办理工具: 'handlingTools',
};

// AI能力类型：非必填下拉选择框，枚举值为AI预测意图、AI实时意图、AI服务总结、AI服务营销话术，默认“请选择”
const aiPowerTypeArr: publictData[] = [
    { label: 'AI预测意图', value: 'AI预测意图', id: 'AI预测意图' },
    { label: 'AI实时意图', value: 'AI实时意图', id: 'AI实时意图' },
    { label: 'AI服务总结', value: 'AI服务总结', id: 'AI服务总结' },
    { label: 'AI服务营销话术', value: 'AI服务营销话术', id: 'AI服务营销话术' },
];
// 场景管理的场景级别
const sceneLevelArr: publictData[] = [
    { label: '一级', value: '1', id: '1' },
    { label: '二级', value: '2', id: '2' },
    { label: '三级', value: '3', id: '3' },
    { label: '四级', value: '4', id: '4' },
    { label: '五级', value: '5', id: '5' },
    { label: '六级', value: '6', id: '6' },
    { label: '七级', value: '7', id: '7' },
    { label: '八级', value: '8', id: '8' },
    { label: '九级', value: '9', id: '9' },
    { label: '十级', value: '10', id: '10' },
];

const appStatusArr: publictData[] = [
    // {label: "请选择", value: "-1", id: "-1"},
    { label: '草稿', value: '1', id: '1' },
    { label: '已发布', value: '2', id: '2' },
    { label: '待审核', value: '3', id: '3' },
    { label: '审核不通过', value: '4', id: '4' },
];

const appStatusMap: StringMap = {
    '1': '草稿',
    '2': '已发布',
    '3': '待审核',
    '4': '审核不通过',
};
const appCategoryMap: StringMap = {
    '1': '生产应用',
    '2': '运营应用',
};
const appLevelMap: StringMap = {
    '1': '中心一级',
    '2': '分中心二级',
};
const showRegionMap: StringMap = {
    '1': '主工作区域',
    '2': '辅助工作区域',
};
const showFormMap: StringMap = {
    process: '步骤引导页面',
    base: '一屏通览页面',
    card: '信息卡片',
};

// 应用类别
const appCategoryArr: publictData[] = [
    { label: '生产应用', value: '1', id: '1' },
    { label: '运营应用', value: '2', id: '2' },
];

// 应用级别
const appPlatLevelArr: publictData[] = [
    { label: '全网通用', value: '1', id: '1' },
    { label: '属地个性', value: '2', id: '2' },
];

// 应用级别(应用列表页)
const appListLevelArr: publictData[] = [
    { label: '请选择', value: '-1', id: '-1' },
    { label: '中心一级', value: '1', id: '1' },
    { label: '分中心二级', value: '2', id: '2' },
];
// 展示区域
const showRegionArr: publictData[] = [
    { label: '主工作区域', value: '1', id: '1' },
    { label: '辅助工作区域', value: '2', id: '2' },
];

// 展示形式
const showFormArr: publictData[] = [
    { label: '一屏通览页面', value: 'base', id: 'base' },
    { label: '步骤引导页面', value: 'process', id: 'process' },
    // { label: '信息卡片', value: 'card', id: 'card' },
];

const defaultCheckArr: publictData[] = [
    { label: '是', value: '1', id: '1' },
    { label: '否', value: '0', id: '0' },
];

// 应用归属模块
const appBelongModuleArr: publictData[] = [
    {
        label: '请选择',
        value: '',
        id: '',
    },
    {
        label: '辅助视图',
        value: '辅助视图',
        id: '辅助视图',
    },
    {
        label: '预处理',
        value: '预处理',
        id: '预处理',
    },
    {
        label: '用户中心',
        value: '用户中心',
        id: '用户中心',
    },
    {
        label: '业务受理',
        value: '业务受理',
        id: '业务受理',
    },
];

// 应用服务环节
const appServiceLinkArr: publictData[] = [
    {
        label: '前情总结',
        value: '前情总结',
        id: '前情总结',
    },
    {
        label: '服务提醒',
        value: '服务提醒',
        id: '服务提醒',
    },
    {
        label: '问题诊断',
        value: '问题诊断',
        id: '问题诊断',
    },
    {
        label: '知识查证',
        value: '知识查证',
        id: '知识查证',
    },
    {
        label: '服务话术',
        value: '服务话术',
        id: '服务话术',
    },
    {
        label: '产品推荐',
        value: '产品推荐',
        id: '产品推荐',
    },
    {
        label: '营销话术',
        value: '营销话术',
        id: '营销话术',
    },
    {
        label: '办理工具',
        value: '办理工具',
        id: '办理工具',
    },
];

const provId2provName: StringMap = {
    '00030001': '北京',
    '00030002': '天津',
    '00030003': '内蒙古',
    '00030004': '河北',
    '00030005': '黑龙江',
    '00030006': '辽宁',
    '00030007': '吉林',
    '00030008': '山东',
    '00030009': '河南',
    '00030010': '山西',
    '00030011': '陕西',
    '00030012': '甘肃',
    '00030013': '宁夏',
    '00030014': '新疆',
    '00030015': '西藏',
    '00030016': '云南',
    '00030017': '四川',
    '00030018': '重庆',
    '00030019': '湖北',
    '00030020': '湖南',
    '00030021': '江苏',
    '00030022': '江西',
    '00030023': '浙江',
    '00030024': '福建',
    '00030025': '广东',
    '00030026': '广西',
    '00030027': '贵州',
    '00030028': '上海',
    '00030029': '海南',
    '00030030': '安徽',
    '00030031': '青海',
    '00030100': '重客',
    '00030113': '国漫',
};

const serviceTypeId2ProvId: StringMap = {
    bjytck: '00030001',
    gdytck: '00030025',
    shytck: '00030028',
    tjytck: '00030002',
    cqytck: '00030018',
    jsytck: '00030021',
    hbytck: '00030019',
    lnytck: '00030006',
    scytck: '00030017',
    snytck: '00030011',
    heytck: '00030004',
    sxytck: '00030010',
    haytck: '00030009',
    jlytck: '00030007',
    hlytck: '00030005',
    nmytck: '00030003',
    sdytck: '00030008',
    ahytck: '00030030',
    zjytck: '00030023',
    fjytck: '00030024',
    hnytck: '00030020',
    gxytck: '00030026',
    jxytck: '00030022',
    gzytck: '00030027',
    ynytck: '00030016',
    xzytck: '00030015',
    hiytck: '00030029',
    gsytck: '00030012',
    nxytck: '00030013',
    qhytck: '00030031',
    xjytck: '00030014',
    zkytck: '00030100',
    tycpzxytck: '00036001', //统一专席平台
    lyzyczx: '00030112', //洛阳资源池
    gjzxytck: '00030113', //国漫专席
    '0000':'0000'//全国省份
};

//业务组件类别
const componentTypeInfo: publictData[] = [
    { label: '生产组件', value: '1', id: '1' },
    { label: '运营组件', value: '2', id: '2' },
];

// 事件监听下拉框数据
const crossApiEventFlow: publictData[] = [
    { label: '受理号码变更事件', value: 'acceptNumberChange', id: '0' },
    { label: '进话事件', value: 'startTalkingEvent', id: '1' },
    { label: '主辅联动事件', value: 'masterAuxLinkage', id: '2' },
    { label: '任务单信息传递事件', value: 'transferTaskEvent', id: '3' },
    { label: '实时推荐营销活动事件', value: 'getRecoRuleMarket', id: '4' },
];
//测试环境本地测试数据使用
const moIdArrs: string[] = [
    "000199015","000199005","000199016",
    "000199005001","000199005002","000199005003",
    "000199005004","000199005005","000199016001","000199016002","000199016003","000199016004","000199016005",
    "000199005001001","000199005001002","000199005002001",
    "000199005002002","000199005002003","000199005002004","000199005002005","000199005002006",
    "000199005002007","000199005002008","000199005003001","000199005003002","000199005003003",
    "000199005003004","000199005003005","000199005003006","000199005003007","000199005003008",
    "000199005004001","000199005004002","000199005004003","000199005005001","000199005005002","000199016003001"
]
//  展示区域
const showAreaArr: publictData[] = [
    { label: '请选择', value: '', id: '' },
    { label: '主视图', value: '1', id: '1' },
    { label: '辅助视图', value: '2', id: '2' },
];

export const publictData = {
    moIdArrs: moIdArrs,
    provId2provName: provId2provName, // 31个省份的省份编码转换
    serviceTypeId2ProvId: serviceTypeId2ProvId, // 业务系统转换省份编码
    provinceIntervalArr: provinceIntervalArr, // 31个省份的省份数组
    provinceSelectValue: provinceSelectValue, // 省份下拉框对应值
    schemeTypeArr: schemeTypeArr, // 方案类型下拉选择框数据
    showFormArr: showFormArr, // 展示形式
    showAreaArr: showAreaArr, // 展示区域
    showRegionArr: showRegionArr, // 展示区域
    appStatusArr: appStatusArr, // 应用状态
    componentTypeInfo: componentTypeInfo, //业务组件类别
    appStatusMap: appStatusMap,
    appCategoryMap: appCategoryMap,
    appLevelMap: appLevelMap,
    showRegionMap: showRegionMap,
    showFormMap: showFormMap,
    appCategoryArr: appCategoryArr,
    appPlatLevelArr: appPlatLevelArr, // 应用级别
    appListLevelArr: appListLevelArr, // 应用级别2
    appBelongModuleArr: appBelongModuleArr, // 应用归属模块
    appServiceLinkArr: appServiceLinkArr, // 应用服务环节
    defaultCheckArr: defaultCheckArr, // 默认是否数据
    schemeTypeMap: schemeTypeMap, // 方案类型映射数据
    schemeStateArr: schemeStateArr, // 方案状态下拉选择框数据
    classifyLabelData: classifyLabelData, // 场景标签下拉框数据源
    channelArr: channelArr, // 适用渠道
    simulatedData: simulatedData, // 模拟数据
    auditWayArr: auditWayArr, // 审核方式
    auditResultArr: auditResultArr, // 审核结果
    whitelistTypeArr: whitelistTypeArr, // 白名单类型
    whitelistStatusArr: whitelistStatusArr, // 白名单状态
    auditTypeArr: auditTypeArr, // 审核类型
    auditStatusArr: auditStatusArr, // 组件状态下拉框数据
    auditStatusMap: auditStatusMap, // 组件状态对应关系
    serviceLinkArr: serviceLinkArr, // 服务环节数据源
    serviceLinkIconMap: serviceLinkIconMap, // 服务环节图标对应关系
    aiPowerTypeArr: aiPowerTypeArr, // AI能力类型数据源
    sceneLevelArr: sceneLevelArr, // 场景管理的场景级别
    crossApiEventFlow: crossApiEventFlow, //事件监听下拉框数据
};
