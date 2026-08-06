import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Input, Button, Select } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
import styles from './index.module.less';
import AddElementModal from './AddElementModal';
import ElementDetail from './elementDetail';
import request from '@/utils/request';
import { updateCustomElementMenu } from '../../config/components';
import { updateComponent } from '../../packages/index';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { publictData } from '@/utils/appMenuData';
import recodeLog from '../../utils/operLog';
import IconSpan from '../../config/icons/IconSpan.png';
import IconBaseTable from '../../config/icons/IconBaseTable.png';
import IconTitle from '../../config/icons/IconTitle.png';
import IconCard from '../../config/icons/IconCard.png';
import IconForm from '../../config/icons/IconForm.png';
import IconGridForm from '../../config/icons/IconGridForm.png';
import IconDiv from '../../config/icons/IconDiv.png';
import IconFlex from '../../config/icons/IconFlex.png';
import IconSpace from '../../config/icons/IconSpace.png';
import IconDivider from '../../config/icons/IconDivider.png';
import IconRow from '../../config/icons/IconRow.png';
import IconColumn from '../../config/icons/IconColumn.png';
import IconFormInput from '../../config/icons/IconFormInput.png';
import IconFormInputNumber from '../../config/icons/IconFormInputNumber.png';
import IconFormInputPassword from '../../config/icons/IconFormInputPassword.png';
import IconFormSelect from '../../config/icons/IconFormSelect.png';
import IconFormDate from '../../config/icons/IconFormDate.png';
import IconFormDatepicker from '../../config/icons/IconFormDatepicker.png';
import IconFormRadio from '../../config/icons/IconFormRadio.png';
import IconFormCheckbox from '../../config/icons/IconFormCheckbox.png';
import IconFormSwitch from '../../config/icons/IconFormSwitch.png';
import IconFormTimepicker from '../../config/icons/IconFormTimepicker.png';
import IconFormCascader from '../../config/icons/IconFormCascader.png';
import IconFormSlider from '../../config/icons/IconFormSlider.png';
import IconImage from '../../config/icons/IconImage.png';
import IconIframe from '../../config/icons/IconIframe.png';
import IconList from '../../config/icons/IconList.png';
import IconFormStatic from '../../config/icons/IconFormStatic.png';
import IconFormItem from '../../config/icons/IconFormItem.png';
import IconLink from '../../config/icons/IconLink.png';
import IconBasicStatistic from '../../config/icons/IconBasicStatistic.png';
import IconBasicIcon from '../../config/icons/IconBasicIcon.png';
import IconBasicAvatar from '../../config/icons/IconBasicAvatar.png';
import IconPieChart from '../../config/icons/IconPieChart.png';
import IconLineChart from '../../config/icons/IconLineChart.png';
import IconColumnChart from '../../config/icons/IconColumnChart.png';
import IconBarChart from '../../config/icons/IconBarChart.png';
import IconTinyColumn from '../../config/icons/IconTinyColumn.png';
import IconProgress from '../../config/icons/IconProgress.png';
import IconSteps from '../../config/icons/IconSteps.png';
import IconTinyLine from '../../config/icons/IconTinyLine.png';
import IconText from '../../config/icons/IconText.png';
import IconTime from '../../config/icons/IconTime.png';
import IconFormList from '../../config/icons/IconFormList.png';
import IconFormTextArea from '../../config/icons/IconFormTextArea.png';
import IconDescriptions from '../../config/icons/IconDescriptions.png';
import IconFunctionalTabs from '../../config/icons/IconFunctionalTabs.png';
import IconFeedBackModal from '../../config/icons/IconFeedBackModal.png';
import IconFeedBackDrawer from '../../config/icons/IconFeedBackDrawer.png';
import IconFeedBackResult from '../../config/icons/IconFeedBackResult.png';
import IconFeedBackEmpty from '../../config/icons/IconFeedBackEmpty.png';
import IconButton from '../../config/icons/IconButton.png';
import IconRate from '../../config/icons/IconRate.png';
import IconJson from '../../config/icons/IconJson.png';
import IconColorPicker from '../../config/icons/IconColorPicker.png';
import IconSearchForm from '../../config/icons/IconSearchForm.png';
import IconRichText from '../../config/icons/IconRichText.png';
import IconCarousel from '../../config/icons/IconCarousel.png';
import IconRignProgress from '../../config/icons/IconRingProgress.png';
import IconCountDown from '../../config/icons/IconCountDown.png';
import IconTag from '../../config/icons/IconTag.png';
import IconDropdwon from '../../config/icons/IconDropdown.png';
import IconWatermark from '../../config/icons/IconWatermark.png';
import IconBadge from '../../config/icons/IconBadge.png';
import IconFile from '../../config/icons/IconFile.png';
import IconFileUpload from '../../config/icons/IconFileUpload.png';
import IconTimeLine from '../../config/icons/IconTimeLine.png';
import IconBottomBanner from '../../config/icons/IconBottomBanner.png';
import IconTree from '../../config/icons/IconTree.png';
import IconTimer from '../../config/icons/IconTimer.png';
import IconMenu from '../../config/icons/IconMenu.png';
import IconPagination from '../../config/icons/IconPagination.png';
import IconTransfer from '../../config/icons/IconTransfer.png';
import IconBarAndLine from '../../config/icons/IconBarAndLine.png';
import IconTreeSelect from '../../config/icons/IconTreeSelect.png';
import IconFloatingWindow from '../../config/icons/IconFloatingWindow.png';
import IconAIChat from '../../config/icons/IconAIChat.png';
import IconBreadcrumb from '../../config/icons/IconBreadcrumb.png';
import IconSpin from '../../config/icons/IconSpin.png';
import IconVideo from '../../config/icons/IconVideo.png';
import IconAudioPlayer from '../../config/icons/IconAudioPlayer.png';
import IconCounter from '../../config/icons/IconCounter.png';
import IconMapChart from '../../config/icons/IconMapChart.png';
import IconCollapse from '../../config/icons/IconCollapse.png';
import IconDownloadButton from '../../config/icons/IconDownloadButton.png';
import IconPopover from '../../config/icons/IconPopover.png';
import SingleFunctionUploadModal from './SingleFunctionUploadModal';
import { isLocalMockMode } from '@/mock/localMock';

import IconFunnelChart from '../../config/icons/IconFunnelChart'; //漏斗图
/****************** 类型定义 ******************/
type PageLayoutType = 'all' | '1' | '2'; // 页面布局：全部 标准页面 大屏页面
type ScopeType = 'all' | '0000' | '1111'; // 归属范围：全部 全网 当前租户
type BlockStatus = '' | '2' | '1' | '3' | '4' | '5'; // 审核状态：已发布 草稿 待审核 审核驳回 已下线

interface AppElementType {
    elementTypeId: string; // 元素分类ID
    elementTypeName: string; // 元素分类名称
    elementTypeIcon: string; // 元素分类图标
    updateStaffId: string; // 修改人工号
    updateTime: string; // 修改时间
    createStaffId: string; // 创建人工号
    createTime: string; // 创建时间
    cmosModifyTime: string; // 双中心同步时间
}

interface BlockElement {
    static?: boolean;
    elementId: string; // 元素ID
    elementName: string; // 元素名称
    elementStatus: string; // 元素状态
    elementIcon: string; // 元素图标
    elementJsDemo: string; // 元素源文件tsx组件逻辑代码
    elementCssDemo: string; // 元素源文件css组件样式代码
    elementConfigDemo: string; // 元素源文件ts组件配置文件
    elementTypeId: string; // 元素分类ID
    elementVersion: string; // 元素版本
    provId: string; // 归属范围
    elementPageType: string; // 页面布局
    elementDesc: string; // 元素说明
    updateStaffId: string; // 更新人工号
    updateTime: string; // 修改时间
    createStaffId: string; // 创建人工号
    createTime: string; // 创建时间
    cmosModifyTime: string; // 双中心同步时间
}

const layoutTypeOptions = [
    { value: 'all', label: '全部页面布局' },
    { value: '1', label: '标准页面元素' },
    { value: '2', label: '大屏页面元素' },
];

const statusOptions = [
    { value: '', label: '全部状态' },
    { value: '1', label: '草稿' },
    { value: '3', label: '待审核' },
    { value: '2', label: '已发布' },
    { value: '4', label: '审核驳回' },
    { value: '5', label: '已下线' },
    { value: '6', label: '原生' },
];

/****************** 样式常量 ******************/
const statusStyles = {
    classifyBadge: (active: boolean) => ({
        backgroundColor: active ? '#FFF' : '#F2F9FF',
    }),
    filterButton: (active: boolean) => ({
        padding: '7px 14px',
        border: 'none',
        backgroundColor: active ? '#e6f7ff' : '#fff',
        color: active ? '#0085D0' : '#595959',
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '13px',
    }),
    statusBadge: (status: string): React.CSSProperties => ({
        padding: '1px 7px',
        borderRadius: '2px',
        fontSize: '11px',
        backgroundColor:
            status === '2' ? '#E9FAF2' : status === '1' ? '#ECF6FF' : status === '3' ? '#FFF7EC' : status === '4' ? '#FFF0ED' : '#F2F2F2',
        color: status === '2' ? '#2DD18A ' : status === '1' ? '#36A8FF' : status === '3' ? '#FFB138' : status === '4' ? '#F65A56' : '#999999',
    }),
};

/****************** 主组件 ******************/
const PageManagementSystem: React.FC = () => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const scopeOptions = [
        { value: 'all', label: '全部归属范围' },
        { value: '0000', label: '全网' },
    ];
    const targetItem = publictData.provinceSelectValue.find((item) => item.value === userInfo.provinceId);
    targetItem && scopeOptions.push(targetItem);
    const [loading, setLoading] = useState<boolean>(false);
    const [appElementType, setAppElementType] = useState<AppElementType[]>([]); // 元素分类数据
    const [blocks, setBlocks] = useState<BlockElement[]>([]); // 元素数据
    // 筛选状态
    const [classify, setClassify] = useState(''); // 选中的元素分类id
    const [status, setStatus] = useState<BlockStatus>(''); // 选中的元素审核状态
    const [pageLayout, setPageLayout] = useState<PageLayoutType>('all'); // 选中的页面布局
    const [scope, setScope] = useState<ScopeType>('all'); // 选中的归属范围
    const [isClassify, setIsClassify] = useState(false); // 是否点击元素分类
    const [isEdit, setIsEdit] = useState(false); // 是否点击编辑
    const [appElementTypeEdit, setAppElementTypeEdit] = useState<AppElementType>(); // 编辑的分类信息
    const [modalVisible, setModalVisible] = useState(false); // 弹窗显隐
    const [searchValue, setSearchValue] = useState<string>(''); // 元素搜索内容
    const [showDetail, setShowDetail] = useState(false); // 详情页面显隐
    const [elementInfo, setElementInfo] = useState<BlockElement>(); // 点击的元素信息
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
    const [activeElementType, setActiveElementType] = useState<AppElementType>(); // 删除的元素分类
    const [singleUploadVisible, setSingleUploadVisible] = useState(isLocalMockMode('element'));

    useEffect(() => {
        queryElementTypeFun();
        queryElementFun();
    }, []);

    // 元素分类查询
    const queryElementTypeFun = () => {
        if (isLocalMockMode('element')) {
            const beans: any[] = [{ elementTypeId: 'all', elementTypeName: '全部', elementTypeIcon: './imgs/icon-all.png' }];
            setAppElementType(beans);
            setClassify('all');
            return;
        }
        try {
            request
                .post('/element/queryElementTypeList', {
                    params: {},
                })
                .then((res) => {
                    console.log(res.beans, 'res.beans');

                    const beans = [{
                        elementTypeId:'all',
                        elementTypeName:'全部',
                        elementTypeIcon: `./imgs/icon-all.png`
                    },...res.beans]

                    setAppElementType(beans);
                    setClassify(beans[0]?.elementTypeId);
                })
                .catch((err) => {});
        } catch (error) {
            message.error('元素分类查询失败');
        } finally {
        }
    };

    // 元素查询
    const queryElementFun = () => {
        if (loading) return;
        if (isLocalMockMode('element')) {
            setBlocks([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setBlocks([]);
        try {
            request
                .post('/element/queryElementList', {
                    params: {
                        provId: userInfo.provinceId,
                    },
                })
                .then((res) => {
                    const eleArr = [
                        {
                            elementName: '分栏',
                            elementStatus: '6',
                            elementIcon: IconSpan,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '弹性布局',
                            elementStatus: '6',
                            elementIcon: IconFlex,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: 'Div容器',
                            elementStatus: '6',
                            elementIcon: IconDiv,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '行内表单',
                            elementStatus: '6',
                            elementIcon: IconSearchForm,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '行组件',
                            elementStatus: '6',
                            elementIcon: IconRow,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '列组件',
                            elementStatus: '6',
                            elementIcon: IconColumn,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '选项卡',
                            elementStatus: '6',
                            elementIcon: IconFunctionalTabs,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '表单容器',
                            elementStatus: '6',
                            elementIcon: IconForm,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        // {
                        //     elementName: '网格表单',
                        //     elementStatus: '6',
                        //     elementIcon: IconGridForm,
                        //     elementTypeId: '2602111021580100004',
                        //     static: true,
                        //     elementPageType: '1',
                        //     provId: '0000',
                        // },
                        {
                            elementName: '卡片容器',
                            elementStatus: '6',
                            elementIcon: IconCard,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '折叠面板',
                            elementStatus: '6',
                            elementIcon: IconCollapse,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '分割线',
                            elementStatus: '6',
                            elementIcon: IconDivider,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '底部通栏',
                            elementStatus: '6',
                            elementIcon: IconBottomBanner,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '循环',
                            elementStatus: '6',
                            elementIcon: IconBottomBanner,
                            elementTypeId: '2602111021580100004',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '文本',
                            elementStatus: '6',
                            elementIcon: IconText,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '图标',
                            elementStatus: '6',
                            elementIcon: IconBasicIcon,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '标题',
                            elementStatus: '6',
                            elementIcon: IconTitle,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '头像',
                            elementStatus: '6',
                            elementIcon: IconBasicAvatar,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '按钮',
                            elementStatus: '6',
                            elementIcon: IconButton,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '超链接',
                            elementStatus: '6',
                            elementIcon: IconLink,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '文件',
                            elementStatus: '6',
                            elementIcon: IconFile,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '内嵌页面',
                            elementStatus: '6',
                            elementIcon: IconIframe,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '基础表格',
                            elementStatus: '6',
                            elementIcon: IconBaseTable,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '图片',
                            elementStatus: '6',
                            elementIcon: IconImage,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '统计数值',
                            elementStatus: '6',
                            elementIcon: IconBasicStatistic,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '标签',
                            elementStatus: '6',
                            elementIcon: IconTag,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '音频',
                            elementStatus: '6',
                            elementIcon: IconAudioPlayer,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '视频',
                            elementStatus: '6',
                            elementIcon: IconVideo,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '水印',
                            elementStatus: '6',
                            elementIcon: IconWatermark,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '自动计时器',
                            elementStatus: '6',
                            elementIcon: IconTimer,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '轮播',
                            elementStatus: '6',
                            elementIcon: IconCarousel,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '徽标',
                            elementStatus: '6',
                            elementIcon: IconBadge,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '下载按钮',
                            elementStatus: '6',
                            elementIcon: IconDownloadButton,
                            elementTypeId: '2603131733520100008',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        //表单类元素
                        {
                            elementName: '单行输入',
                            elementStatus: '6',
                            elementIcon: IconFormInput,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '多行输入',
                            elementStatus: '6',
                            elementIcon: IconFormTextArea,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '下拉选择',
                            elementStatus: '6',
                            elementIcon: IconFormSelect,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '单选',
                            elementStatus: '6',
                            elementIcon: IconFormRadio,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '多选',
                            elementStatus: '6',
                            elementIcon: IconFormCheckbox,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '日期',
                            elementStatus: '6',
                            elementIcon: IconFormDate,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '日期范围',
                            elementStatus: '6',
                            elementIcon: IconFormDatepicker,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '时间选择',
                            elementStatus: '6',
                            elementIcon: IconTime,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '时间范围框',
                            elementStatus: '6',
                            elementIcon: IconFormTimepicker,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '弹出树',
                            elementStatus: '6',
                            elementIcon: IconTreeSelect,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '步进器',
                            elementStatus: '6',
                            elementIcon: IconCounter,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '静态项',
                            elementStatus: '6',
                            elementIcon: IconFormStatic,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '星级',
                            elementStatus: '6',
                            elementIcon: IconRate,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        // {
                        //     elementName: '上传',
                        //     elementStatus: '6',
                        //     elementIcon: IconFileUpload,
                        //     elementTypeId: '2603131733130100007',
                        //     static: true,
                        //     elementPageType: '1',
                        //     provId: '0000',
                        // },
                        {
                            elementName: '穿梭框',
                            elementStatus: '6',
                            elementIcon: IconTransfer,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '滑动条',
                            elementStatus: '6',
                            elementIcon: IconFormSlider,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '开关',
                            elementStatus: '6',
                            elementIcon: IconFormSwitch,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '级联选择',
                            elementStatus: '6',
                            elementIcon: IconFormCascader,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '数字输入',
                            elementStatus: '6',
                            elementIcon: IconFormInputNumber,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '密码框',
                            elementStatus: '6',
                            elementIcon: IconFormInputPassword,
                            elementTypeId: '2603131733130100007',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        //高级组件
                        {
                            elementName: '悬浮窗',
                            elementStatus: '6',
                            elementIcon: IconFloatingWindow,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: 'AI会话',
                            elementStatus: '6',
                            elementIcon: IconAIChat,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '列表组件',
                            elementStatus: '6',
                            elementIcon: IconList,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '描述列表',
                            elementStatus: '6',
                            elementIcon: IconDescriptions,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '目录树',
                            elementStatus: '6',
                            elementIcon: IconTree,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '步骤条',
                            elementStatus: '6',
                            elementIcon: IconSteps,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '分页',
                            elementStatus: '6',
                            elementIcon: IconPagination,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '进度条',
                            elementStatus: '6',
                            elementIcon: IconProgress,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '时间轴',
                            elementStatus: '6',
                            elementIcon: IconTimeLine,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '面包屑',
                            elementStatus: '6',
                            elementIcon: IconBreadcrumb,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '导航',
                            elementStatus: '6',
                            elementIcon: IconMenu,
                            elementTypeId: '2603131734250100009',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        //图标类
                        {
                            elementName: '折线图',
                            elementStatus: '6',
                            elementIcon: IconLineChart,
                            elementTypeId: '2602111149490100006',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '柱状图',
                            elementStatus: '6',
                            elementIcon: IconColumnChart,
                            elementTypeId: '2602111149490100006',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '折柱混合图',
                            elementStatus: '6',
                            elementIcon: IconBarAndLine,
                            elementTypeId: '2602111149490100006',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '饼状图·',
                            elementStatus: '6',
                            elementIcon: IconPieChart,
                            elementTypeId: '2602111149490100006',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '地图',
                            elementStatus: '6',
                            elementIcon: IconMapChart,
                            elementTypeId: '2602111149490100006',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '条形图',
                            elementStatus: '6',
                            elementIcon: IconBarChart,
                            elementTypeId: '2602111149490100006',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        //提示类
                        {
                            elementName: '弹窗',
                            elementStatus: '6',
                            elementIcon: IconFeedBackModal,
                            elementTypeId: '2603131734550100010',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '结果页',
                            elementStatus: '6',
                            elementIcon: IconFeedBackResult,
                            elementTypeId: '2603131734550100010',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '空状态',
                            elementStatus: '6',
                            elementIcon: IconFeedBackEmpty,
                            elementTypeId: '2603131734550100010',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '抽屉',
                            elementStatus: '6',
                            elementIcon: IconFeedBackDrawer,
                            elementTypeId: '2603131734550100010',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '加载提示',
                            elementStatus: '6',
                            elementIcon: IconSpin,
                            elementTypeId: '2603131734550100010',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                        {
                            elementName: '气泡弹窗',
                            elementStatus: '6',
                            elementIcon: IconPopover,
                            elementTypeId: '2603131734550100010',
                            static: true,
                            elementPageType: '1',
                            provId: '0000',
                        },
                    ];
                    res.beans.push(...eleArr);
                    setBlocks(res.beans);
                })
                .catch((err) => {});
        } catch (error) {
            message.error('元素查询失败');
        } finally {
            setLoading(false);
        }
    };

    // 元素分类点击确定，新增、编辑
    const handleSure = (values: BlockElement) => {
        try {
            request
                .post('/element/saveElementTypeInfo', {
                    params: {
                        elementTypeId: isEdit ? values.elementId : '',
                        elementTypeName: values.elementName,
                        elementTypeIcon: values.elementIcon,
                        staffId: userInfo.staffId,
                    },
                })
                .then((res) => {
                    setModalVisible(false);
                    message.success(`${isEdit ? '编辑' : '新增'}元素${isClassify ? '分类' : ''}成功`);
                    queryElementTypeFun();
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: `元素${isClassify ? '分类' : ''}`, // 数据类型（应用、元素、组件、接口）
                        operType: isEdit ? '编辑' : '新增', // 操作类型（新增/编辑/删除/导入）
                        dataId: isEdit ? values.elementId : '', // 操作数据ID
                        dataName: values.elementName, // 操作数据名称
                        editContent: `${(isEdit ? '编辑' : '新增') + values.elementName + '元素' + (isClassify ? '分类' : '')}`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                })
                .catch((err) => {});
        } catch (error) {
            message.success(`${isEdit ? '编辑' : '新增'}元素${isClassify ? '分类' : ''}失败`);
        } finally {
        }
    };

    // 处理表单提交提交审核
    const handleCreate = (values: BlockElement) => {
        elementPreservation(values, '3');
    };

    // 处理表单提交保存草稿
    const handleSaveDraft = (values: BlockElement) => {
        elementPreservation(values, '1');
    };

    // 元素保存：提交审核、保存草稿
    const elementPreservation = (values: BlockElement, elementStatus: string) => {
        try {
            request
                .post('/element/saveElementInfo', {
                    params: {
                        elementId: isEdit ? values.elementId : '',
                        elementName: values.elementName,
                        elementStatus: elementStatus,
                        elementIcon: values.elementIcon,
                        elementJsDemo: values.elementJsDemo,
                        elementCssDemo: values.elementCssDemo,
                        elementConfigDemo: values.elementConfigDemo,
                        elementTypeId: values.elementTypeId,
                        provId: values.provId,
                        elementPageType: values.elementPageType,
                        elementDesc: values.elementDesc,
                        staffId: userInfo.staffId,
                    },
                })
                .then((res) => {
                    setModalVisible(false);
                    message.success(`${elementStatus === '1' ? '保存草稿' : '提交审核'}成功`);
                    queryElementFun();
                    if (elementStatus == '3') {
                        updateCustomElementMenu(res?.bean?.elementId); // 更新画布中全局自定义元素菜单
                        updateComponent(res?.bean?.elementId); // 更新画布中全局自定义元素
                        elementReview(values, res?.bean?.elementId); // 同步数据到审核管理
                    }
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: '元素', // 数据类型（应用、元素、组件、接口）
                        operType: isEdit ? '编辑' : '新增', // 操作类型（新增/编辑/删除/导入）
                        dataId: isEdit ? values.elementId : '', // 操作数据ID
                        dataName: values.elementName, // 操作数据名称
                        editContent: `${(isEdit ? '编辑' : '新增') + values.elementName}元素`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                })
                .catch((err) => {});
        } catch (error) {
            message.success(`${elementStatus === '1' ? '保存草稿' : '提交审核'}失败`);
        } finally {
        }
    };

    // 同步审核管理
    const elementReview = (values: BlockElement, newElementId: string) => {
        try {
            const provName = scopeOptions.find((item) => item.value === values.provId)?.label; // 归属省份
            const elementTypeName = appElementType.find((item) => item.elementTypeId === values.elementTypeId)?.elementTypeName; // 分类名称
            const elementPageName = layoutTypeOptions.find((item) => item.value === values.elementPageType)?.label; // 布局类型
            const dataDesc = provName + ',' + elementTypeName + ',' + elementPageName;
            request
                .post('/solutionAudit/insertSolutionAudit', {
                    params: {
                        provId: values.provId,
                        serviceTypeId: values.provId,
                        createStaffId: userInfo.staffId,
                        dataSource: '3',
                        relationId: isEdit ? values.elementId : newElementId,
                        dataName: values.elementName,
                        dataType: '1', // 1 发布，2 下线，3 回滚版本
                        dataDesc: dataDesc,
                    },
                })
                .then((res) => {})
                .catch((err) => {});
        } catch (error) {
        } finally {
        }
    };

    // 添加分类
    const addCategory = () => {
        setIsEdit(false);
        setIsClassify(true);
        setModalVisible(true);
    };

    // 编辑分类
    const editCategory = (category: AppElementType) => {
        setIsEdit(true);
        setIsClassify(true);
        setModalVisible(true);
        setAppElementTypeEdit(category);
    };

    // 删除分类
    const deleteCategory = (category: AppElementType) => {
        const hasStatus = blocks.some((item) => item.elementTypeId === category.elementTypeId);
        if (hasStatus) {
            message.warning('该分类下存在元素，无法删除该元素分类。');
            return;
        }
        // const hasStatusTwo = blocks.some((item) => item.elementTypeId === elementTypeId && item.elementStatus === '2');
        // if (hasStatusTwo) {
        //     message.warning('存在可用元素，无法删除该元素分类，请下线元素后重试。');
        //     return;
        // }
        setActiveElementType(category);
        setDeleteVisible(true);
    };

    // 删除接口
    const deleteFun = () => {
        try {
            request
                .post('/element/deleteElementType', {
                    params: {
                        elementTypeId: activeElementType?.elementTypeId,
                        staffId: userInfo.staffId,
                    },
                })
                .then((res) => {
                    setDeleteVisible(false);
                    message.success(`删除元素${isClassify ? '分类' : ''}成功`);
                    queryElementTypeFun();
                    queryElementFun();
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: `元素${isClassify ? '分类' : ''}`, // 数据类型（应用、元素、组件、接口）
                        operType: '删除', // 操作类型（新增/编辑/删除/导入）
                        dataId: activeElementType?.elementTypeId, // 操作数据ID
                        dataName: activeElementType?.elementTypeName, // 操作数据名称
                        editContent: `${'删除' + activeElementType?.elementTypeName + '元素' + (isClassify ? '分类' : '')}`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                })
                .catch((err) => {});
        } catch (error) {
            message.success(`删除元素${isClassify ? '分类' : ''}失败`);
        } finally {
        }
    };

    // 添加块元素
    const addBlock = () => {
        setIsEdit(false);
        setIsClassify(false);
        setModalVisible(true);
    };

    // 过滤显示的块元素
    const filteredBlocks = useMemo(() => {
        return blocks.filter((block) => {
            const classifyMatch = classify === 'all' || block.elementTypeId === classify;
            const statusMatch = status === '' || block.elementStatus === status;
            const searchValueMatch = searchValue === '' || block.elementName.toLowerCase().includes(searchValue.toLowerCase());
            const layoutMatch = pageLayout === 'all' || block.elementPageType === pageLayout;
            const scopeMatch = scope === 'all' || block.provId === scope;
            return classifyMatch && statusMatch && searchValueMatch && layoutMatch && scopeMatch;
        });
    }, [blocks, classify, status, searchValue, pageLayout, scope]);

    // 元素详情
    const elementDetail = (block: BlockElement) => {
        if (block.static) {
            return;
        }
        setElementInfo(block);
        setShowDetail(true);
    };

    // 返回按钮点击事件
    const handleBack = () => {
        setShowDetail(false);
        // 重新查询元素数据
        queryElementFun();
    };

    return (
        <div style={{ height: '100%' }}>
            {!showDetail ? (
                <div className={styles.container}>
                    {/* 左侧分类栏 */}
                    <div className={styles.sidebar}>
                        <div className={styles.categoryBox}>
                            {appElementType.map((category, index) => (
                                <div
                                    key={category.elementTypeId || `category-${index}`}
                                    className={styles.categoryItem}
                                    style={statusStyles.classifyBadge(category.elementTypeId === classify)}
                                    onClick={() => {
                                        console.log(category.elementTypeId, 'category.elementTypeId)');

                                        setClassify(category.elementTypeId);
                                        setSearchValue('');
                                        setStatus('');
                                        setPageLayout('all');
                                        setScope('all');
                                    }} // 模拟刷新右侧内容
                                >
                                    <div className={styles.categoryIcon}>
                                        <span style={{ fontSize: '16px' }}>
                                            {category.elementTypeId === 'all'?<img src={new URL(`./imgs/icon-all.png`, import.meta.url).href} alt="" style={{ width: 16 ,marginTop:5}} />:
                                                <img src={new URL(category.elementTypeIcon, import.meta.url).href} alt="" style={{ width: 16 ,marginTop:5}} />
                                            }
                                        </span>
                                    </div>
                                    <span className={styles.categoryName}>{category.elementTypeName}</span>
                                    {category.elementTypeId !== 'all' && category.elementTypeId === classify && (<div className={styles.categoryActions}>
                                        <button
                                            className={styles.actionButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                editCategory(category);
                                            }}
                                            title="编辑"
                                        >
                                            <span style={{ fontSize: '16px' }}>
                                                <img src={new URL(`./imgs/editIcon.png`, import.meta.url).href} alt="" />
                                            </span>
                                        </button>
                                        <button
                                            className={styles.actionButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteCategory(category);
                                            }}
                                            title="删除"
                                        >
                                            <span style={{ fontSize: '16px' }}>
                                                <img src={new URL(`./imgs/deleteIcon.png`, import.meta.url).href} alt="" />
                                            </span>
                                        </button>
                                    </div>)}
                                </div>
                            ))}
                        </div>
                        <button className={styles.addCategoryBtn} onClick={() => addCategory()}>
                            +新增分类
                            {/* <span style={{ margin: '5px 0 0 12px' }}>
                                <img src={new URL(`./imgs/addIcon.png`, import.meta.url).href} alt="" />
                            </span> */}
                        </button>
                    </div>

                    {/* 右侧主内容区 */}
                    <div className={styles.mainContent}>
                        {/* 顶部操作栏 */}
                        <div className={styles.topBar}>
                            <div>
                                <Select // 页面布局
                                    placeholder="请选择"
                                    className={styles.dropdown1}
                                    value={pageLayout}
                                    onChange={(value) => setPageLayout(value as PageLayoutType)}
                                    options={layoutTypeOptions}
                                />
                                <Select // 归属范围
                                    placeholder="请选择"
                                    className={styles.dropdown1}
                                    value={scope}
                                    onChange={(value) => setScope(value as ScopeType)}
                                    options={scopeOptions}
                                />
                                <Select // 审核状态
                                    placeholder="请选择"
                                    className={styles.dropdown}
                                    value={status}
                                    onChange={(value) => setStatus(value as BlockStatus)}
                                    options={statusOptions}
                                />
                                <Input
                                    placeholder="请输入元素名称"
                                    className={styles.searchInput}
                                    allowClear
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                                <button className={styles.addBlockBtn} onClick={addBlock}>
                                    <span style={{ marginRight: '4px', height: '13px' }}>
                                        <img src={new URL(`./imgs/addIcon1.png`, import.meta.url).href} alt="" />
                                    </span>
                                    新增元素
                                </button>
                                <button className={styles.addBlockBtn} onClick={() => setSingleUploadVisible(true)}>
                                    上传函数组件
                                </button>
                                <button
                                    className={styles.queryBlockBtn}
                                    onClick={() => {
                                        queryElementFun();
                                    }}
                                >
                                    查询
                                </button>
                            </div>
                        </div>

                        {/* 块状元素展示区 */}
                        <div className={styles.blocksContainer}>
                            {!loading &&
                                (filteredBlocks.length > 0 ? (
                                    filteredBlocks.map((block, index) => (
                                        <div
                                            key={block.elementId || `block-${index}`}
                                            className={`${styles.blockCard} ${block.elementStatus !== '6' ? styles.blockCardStatus6 : ''}`}
                                            onClick={() => elementDetail(block)}
                                        >
                                            {block.elementStatus === '6' && (
                                                <span className={styles.yuansheng}>
                                                    <img src={new URL(`./imgs/yuansheng.png`, import.meta.url).href} alt="" />
                                                </span>
                                            )}
                                            <div className={styles.blockIcon}>
                                                <span>
                                                    <img style={{ width: '48px', height: '48px' }} src={new URL(block.elementIcon, import.meta.url).href} alt="" />
                                                </span>
                                            </div>
                                            <div className={styles.blockName} title={block.elementName}>{block.elementName}</div>
                                            <div className={styles.blockInfo}>
                                                <span>{block.elementVersion}</span>
                                                {block.elementStatus !== '6' && (
                                                    <span style={statusStyles.statusBadge(block.elementStatus)}>
                                                        {block.elementStatus === '2'
                                                            ? '已发布'
                                                            : block.elementStatus === '1'
                                                            ? '草稿'
                                                            : block.elementStatus === '3'
                                                            ? '待审核'
                                                            : block.elementStatus === '4'
                                                            ? '审核驳回'
                                                            : block.elementStatus === '5'
                                                            ? '已下线'
                                                            : '--'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.searchResultVoid}>
                                        <div className={styles.nodataCont}>
                                            <div className={styles.nodataImg}></div>
                                            <span className={styles.nodataTitle}>暂无匹配数据</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                    {/* 新增弹窗 */}
                    <AddElementModal
                        visible={modalVisible}
                        isClassify={isClassify}
                        isEdit={isEdit}
                        appElementTypeEdit={appElementTypeEdit}
                        appElementType={appElementType}
                        onSure={handleSure}
                        onCreate={handleCreate}
                        onSaveDraft={handleSaveDraft}
                        onCancel={() => {
                            setModalVisible(false);
                            setAppElementTypeEdit(undefined);
                        }}
                    />
                    <SingleFunctionUploadModal open={singleUploadVisible} onCancel={() => setSingleUploadVisible(false)} />
                    {/* 删除弹窗 */}
                    <Modal
                        // wrapClassName={styles.modal}
                        open={deleteVisible}
                        closable={false}
                        maskClosable={false}
                        onCancel={() => setDeleteVisible(false)}
                        width={420}
                        footer={null} // 移除默认底部按钮
                        destroyOnClose // 关闭时销毁子元素
                    >
                        <div style={{ marginTop: 36 }}>
                            <div style={{ display: 'inline-block', margin: '0px 20px 116px 15px' }}>
                                <ExclamationCircleTwoTone twoToneColor="#FFAB00" style={{ fontSize: '48px' }} />
                            </div>
                            <div style={{ display: 'inline-block', width: 'calc(100% - 85px)', verticalAlign: 'top' }}>
                                <div style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>提示</div>
                                <div style={{ fontSize: '13px', color: '#666666' }}>即将删除该元素分类，同步删除其下元素信息，是否继续？</div>
                            </div>
                        </div>
                        <div
                            style={{
                                height: '60px',
                                width: '420px',
                                background: '#F9FAFC',
                                position: 'absolute',
                                bottom: '0px',
                                left: '0px',
                                borderTop: '1px solid #D0D6D9',
                                textAlign: 'center',
                                paddingTop: '10px',
                            }}
                        >
                            <Button type="primary" onClick={() => deleteFun()} style={{ marginRight: 17, width: '140px', height: '40px' }}>
                                确定
                            </Button>
                            <Button onClick={() => setDeleteVisible(false)} style={{ width: '140px', height: '40px' }}>
                                取消
                            </Button>
                        </div>
                    </Modal>
                </div>
            ) : (
                // 元素详情
                <ElementDetail elementInfos={elementInfo} appElementType={appElementType} onBack={handleBack} />
            )}
        </div>
    );
};

export default PageManagementSystem;
