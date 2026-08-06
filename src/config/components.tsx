import { ReactNode } from 'react';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import { crossApiUserInfo } from '../stores/crossapiStore';
import IconBaseTable from './icons/IconBaseTable';
import IconTitle from './icons/IconTitle';
import IconCard from './icons/IconCard';
import IconForm from './icons/IconForm';
import IconDiv from './icons/IconDiv';
import IconFlex from './icons/IconFlex';
import IconSpace from './icons/IconSpace';
import IconDivider from './icons/IconDivider';
import IconRow from './icons/IconRow';
import IconColumn from './icons/IconColumn';
import IconFormInput from './icons/IconFormInput';
import IconFormInputNumber from './icons/IconFromInputNumber';
import IconFormInputPassword from './icons/IconFormInputPassword';
import IconFormSelect from './icons/IconFormSelect';
import IconFormDate from './icons/IconFormDate';
import IconFormDatepicker from './icons/IconFormDatepicker';
import IconFormRadio from './icons/IconFormRadio';
import IconFormCheckbox from './icons/IconFormCheckbox';
import IconFormSwitch from './icons/IconFormSwitch';
import IconFormTimepicker from './icons/IconFormTimePicker';
import IconFormCascader from './icons/IconFormCascader';
import IconFormSlider from './icons/IconFormSlider';
import IconImage from './icons/IconImage';
import IconIframe from './icons/IconIFrame';
import IconList from './icons/IconList';
import IconFormStatic from './icons/IconFormStatic';
import IconFormItem from './icons/IconFormItem';
import IconLink from './icons/IconLink';
import IconBasicStatistic from './icons/IconBasicStatistic';
import IconBasicIcon from './icons/IconBasicIcon';
import IconBasicAvatar from './icons/IconBasicAvatar';
import IconPieChart from './icons/IconPieChart';
import IconLineChart from './icons/IconLineChart';
import IconColumnChart from './icons/IconColumnChart';
import IconBarChart from './icons/IconBarChart';
import IconTinyColumn from './icons/IconTinyColumn';
import IconProgress from './icons/IconProgress';
import IconSteps from './icons/IconSteps';
import IconTinyLine from './icons/IconTinyLine';
import IconText from './icons/IconText';
import IconTime from './icons/IconFormTime';
import IconFormList from './icons/IconFormList';
import IconFormTextArea from './icons/IconFormTextArea';
import IconDescriptions from './icons/IconDescriptions';
import IconFunctionalTabs from './icons/IconFunctionalTabs';
import IconFeedBackModal from './icons/IconFeedBackModal';
import IconFeedBackDrawer from './icons/IconFeedBackDrawer';
import IconFeedBackResult from './icons/IconFeedBackResult';
import IconFeedBackEmpty from './icons/IconFeedBackEmpty';
import IconButton from './icons/IconButton';
import IconRate from './icons/IconRate';
import IconJson from './icons/IconJson';
import IconColorPicker from './icons/IconColorPicker';
import IconSearchForm from './icons/IconSearcFrom';
import IconRichText from './icons/IconRichText';
import IconCarousel from './icons/IconCarousel';
import IconRignProgress from './icons/IconRingProgress';
import IconCountDown from './icons/IconCountDown';
import IconTag from './icons/IconTag';
import IconDropdwon from './icons/IconDropdown';
import IconWatermark from './icons/IconWatermark';
import IconBadge from './icons/IconBadge';
import IconFile from './icons/IconFile';
import IconFileUpload from './icons/IconFileUpload';
import IconTimeLine from './icons/IconTimeLine';
import IconBottomBanner from './icons/IconBottomBanner';
import IconTree from './icons/IconTree';
import IconTimer from './icons/IconTimer';
import IconMenu from './icons/IconMenu';
import IconPagination from './icons/IconPagination';
import IconTransfer from './icons/IconTransfer';
import IconBarAndLine from './icons/IconBarAndLine';
import IconTreeSelect from './icons/IconTreeSelect';
import IconFloatingWindow from './icons/IconFloatingWindow';
import IconAIChat from './icons/IconAIChat';
import IconBreadcrumb from './icons/IconBreadcrumb';
import IconSpin from './icons/IconSpin';
import IconVideo from './icons/IconVideo';
import IconAudioPlayer from './icons/IconAudioPlayer';
import IconCounter from './icons/IconCounter';
import IconMapChart from './icons/IconMapChart';
import IconCollapse from './icons/IconCollapse';
import IconSpan from './icons/IconSpan';
import IconFunnelChart from './icons/IconFunnelChart'; //漏斗图
import IconCollapseBtn from './icons/IconCollapseBtn'
import IconCheckableTagGroup from './icons/IconCheckableTagGroup'
import IconBownloadButton from './icons/IconBownloadButton'
import IconGridForm from "./icons/IconGridForm";
import IconPopover from "./icons/IconPopover";
/**
 * 组件配置列表
 */
export interface SysComItem {
    type: string;
    title: string;
    hidden?: boolean;
    data: Array<{
        icon: ReactNode | string;
        name: string;
        type: string;
        hidden?: boolean;
    }>;
}

interface ComponentItem {
    icon: JSX.Element;
    name: string;
    type: string;
    description?: string;
}

interface ComponentCategory {
    type: string;
    title: string;
    data: ComponentItem[];
}

const userInfo = crossApiUserInfo.getState().userInfo;

let components: ComponentCategory[] = [
    // {
    //     type: 'Page',
    //     title: '页面组件',
    //     hidden: true,
    //     data: [],
    // },
    {
        type: 'Layout',
        title: '布局类容器',
        data: [
            {
                icon: <IconSpan />,
                name: '分栏',
                type: 'Span',
                description: '一种容器元素，将页面内容在水平方向进行分割为两栏或者多栏，每一栏都可以拖入其它组件。',
            },
            {
                icon: <IconFlex />,
                name: '弹性布局',
                type: 'Flex',
                description: '一种灵活的容器布局元素，实现垂直或水平方向上的子元素布局可灵活，可控制子元素的对齐、分布。',
            },
            {
                icon: <IconDiv />,
                name: 'Div容器',
                type: 'Div',
                description: '一种灵活的容器布局元素，实现垂直或水平方向上的子元素布局可灵活，可控制子元素的对齐、分布。',
            },
            {
                icon: <IconSearchForm />,
                name: '行内表单',
                type: 'SearchForm',
                description: '表单类容器元素，用于将表单元素（输入框、下拉框、复选框等）在水平方向行内排列，节省页面空间，并自带查询及重置等按钮设置，适用于表单元素较少的场景。',
            },
            {
                icon: <IconRow />,
                name: '行组件',
                type: 'Row',
                description: '布局基础组件，用于实现页面内容的水平行排列，常作为列组件的父容器，负责包裹和约束列组件，统一控制列的排列方式（横向排/换行规则）、列之间的间距、整体对齐方式（居中、靠左、靠右）等，相当于"布局的一行框架"。',
            },
            {
                icon: <IconColumn />,
                name: '列组件',
                type: 'Col',
                description: '作为行组件的子项，负责占据行内的指定宽度，承载具体的业务内容（文字、按钮、卡片等），相当于"一行框架内的具体分区"。',
            },
            {
                icon: <IconFunctionalTabs />,
                name: '选项卡',
                type: 'Tabs',
                description: '交互式容器组件，通过标签切换的方式展示不同的内容板块，可在有限空间内承载多个内容区域，提升页面空间利用率。',
            },
            // {
            //     icon: '',
            //     name: '子标签页',
            //     type: 'Tab',
            //     hidden: true,
            // },
            {
                icon: <IconForm />,
                name: '表单容器',
                type: 'Form',
                description: '表单容器是表单元素的管理者，它内部包裹各类表单控件（输入框、下拉框、单选框、复选框等，通常为 FormItem 表单项），负责将这些分散控件的数据整合、校验和提交。',
            },
            // {
            //     icon: <IconGridForm />,
            //     name: '网格表单',
            //     type: 'GridForm',
            //     description: '拖入画布即生成自带查询与重置按钮的规整栅格区域，后续拖入的所有表单项均自动按网格对齐排列，无需手动调整位置即可快速生成数据筛选面板。',
            // },
            {
                icon: <IconCard />,
                name: '卡片容器',
                type: 'Card',
                description: '卡片容器是内容的可视化载体与归类工具，像一个"电子卡片"，将相关联的业务内容（文字、列表、图表、表单、图片等）包裹在一起，形成一个独立的、规整的展示单元，适用于内容的分区展示和重点突出。',
            },
            {
                icon: <IconCollapse />,
                name: '折叠面板',
                type: 'Collapse',
                description: '交互式折叠容器组件，可通过点击标题展开或收起内容区域，用于隐藏非核心内容，节省页面空间，提升页面整洁度。',
            },
            {
                icon: <IconDivider />,
                name: '分割线',
                type: 'Divider',
                description: '用于视觉分隔与内容组织的基础组件，通过清晰的线条划分页面区域、区隔不同模块内容，提升界面层次感与可读性。',
            },
            {
                icon: <IconBottomBanner />,
                name: '底部通栏',
                type: 'BottomBanner',
                description: '固定或自适应于页面底部的通栏容器，用于展示页面底部信息（版权、联系方式、导航链接等），具有固定的展示位置。',
            },
            {
                icon: <IconBottomBanner />,
                name: '循环',
                type: 'Cycle',
                description: '用于绑定数据源并对数据项进行遍历渲染，可自动重复生成相同结构的子组件，适配列表展示、卡片组、选项组等需批量复现的场景。',
            },
            // {
            //     icon: <IconSpace />,
            //     name: '间距',
            //     type: 'Space',
            // },
        ],
    },
    {
        type: 'Base',
        title: '基础类元素',
        data: [
            {
                icon: <IconText />,
                name: '文本',
                type: 'Text',
                description: '基础展示类组件，用于在页面上显示静态文本内容，支持多种文本样式、格式调整，适配页面说明、提示、描述等各类文本展示场景。',
            },
            {
                icon: <IconBasicIcon />,
                name: '图标',
                type: 'Icon',
                description: '用于页面装饰、功能标识的小型视觉组件，可单独使用或配合按钮、文本等组件使用，提升页面的视觉层次感和操作辨识度。',
            },
            {
                icon: <IconTitle />,
                name: '标题',
                type: 'Title',
                description: '用于页面或组件标题展示的专用组件，视觉层级高于普通文本，用于区分页面模块、标识内容主题，提升页面层次感和可读性。',
            },
            {
                icon: <IconBasicAvatar />,
                name: '头像',
                type: 'Avatar',
                description: '用于展示用户头像、图标等小型图片的组件，支持文字头像和图片头像两种形式，适配用户中心、个人资料等场景。',
            },
            {
                icon: <IconButton />,
                name: '按钮',
                type: 'Button',
                description: '一种交互式组件，用于触发页面特定操作（如提交、删除、跳转等），是页面交互的核心元素，可配合图标、文本提升操作辨识度。',
            },
            {
                icon: <IconLink />,
                name: '超链接',
                type: 'Link',
                description: '用于实现页面跳转、外部链接跳转的交互式组件，可展示文本内容，点击后触发跳转操作，适配导航、关联内容跳转等场景。',
            },
            {
                icon: <IconFile />,
                name: '文件',
                type: 'File',
                description: '用于触发本地文件选择与上传，支持接收指定格式文件并暂存于服务端，适配附件提交、资料导入等场景。',
            },
            {
                icon: <IconIframe />,
                name: '内嵌页面',
                type: 'IFrame',
                description: '用于在当前页面中嵌入另一个页面（内部页面或外部页面）的容器组件，实现页面内容的嵌套展示，适配需要整合多个页面内容的场景。',
            },

            {
                icon: <IconBaseTable />,
                name: '基础表格',
                type: 'NgapTable',
                description: '用于展示结构化数据的容器组件，支持分页、选择等功能，可清晰呈现多行多列数据，适配数据展示、数据管理等场景。',
            },
            {
                icon: <IconBaseTable />,
                name: '复合表格',
                type: 'BusinessTable',
                description: '增强型数据陈列与操作组件，在基础表格之上集成排序、筛选、自定义列等复合功能，适配复杂数据管理及交互操作场景。',
            },
            {
                icon: <IconImage />,
                name: '图片',
                type: 'Image',
                description: '用于展示图片资源的组件，支持图片预览、尺寸调整，适配产品图、封面图、装饰图等各类图片展示场景。',
            },
            {
                icon: <IconBasicStatistic />,
                name: '统计数值',
                type: 'Statistic',
                description: '用于展示关键数据、统计信息的组件，视觉突出，可配合标题、前缀、后缀，清晰呈现数值类信息（如用户数量、销售额）。',
            },
            {
                icon: <IconTag />,
                name: '标签',
                type: 'Tag',
                description: '用于标识内容分类、状态的小型展示组件，可配合文本、卡片等组件使用，直观呈现内容的属性或状态（如标签"热门""已审核"）。',
            },
            {
                icon: <IconAudioPlayer />,
                name: '音频',
                type: 'AudioPlayer',
                description: '用于播放音频资源的组件，支持倍速播放、波形展示等功能，适配音频播放、语音提示等场景（如音乐播放、语音讲解）。',
            },
            {
                icon: <IconVideo />,
                name: '视频',
                type: 'Video',
                description: '用于播放视频资源的组件，支持封面设置、自动播放、静音等功能，适配视频展示、教程播放等场景（如产品介绍视频、操作教程视频）。',
            },
            {
                icon: <IconWatermark />,
                name: '水印',
                type: 'Watermark',
                description: '用于在页面或组件上添加水印内容（文字或图片）的组件，用于标识页面归属、防止内容盗用，适配系统页面、敏感内容展示等场景。',
            },
            {
                icon: <IconTimer />,
                name: '自动计时器',
                type: 'Timer',
                description: '用于实现自动计时功能的组件，支持设置初始时间、最大时间，可手动控制开始、重置，适配倒计时、计时统计等场景（如活动倒计时、操作计时）。',
            },
            {
                icon: <IconCarousel />,
                name: '轮播',
                type: 'Carousel',
                description: '用于循环展示多个内容（图片、卡片等）的组件，支持自动切换、动画效果，适配首页横幅广告、产品展示等场景，提升页面视觉吸引力。',
            },
            {
                icon: <IconBadge />,
                name: '徽标',
                type: 'Badge',
                description: '用于展示数字、状态提示的小型组件，常配合按钮、图标、头像等组件使用，用于标识未读消息数、状态等（如未读消息徽标"3"）。',
            },
            {
                icon: <IconCollapseBtn />,
                name: '折叠按钮',
                type: 'CollapseBtn',
                description: '用于控制指定区域内容的展开与收起状态，支持双向切换，适配筛选区、详情隐藏等需按需显隐的内容管理场景。',
            },
            {
                icon: <IconCheckableTagGroup />,
                name: '标签组',
                type: 'CheckableTagGroup',
                description: '用于集中呈现多个标签项，支持标签的动态增删与样式配置，适配信息分类、属性标记、选项筛选等场景。',
            },
            {
               icon: <IconBownloadButton />,
               name: '下载按钮',
               type: 'BownloadButton',
               description: '用于绑定下载事件并触发文件获取动作，支持配置下载链接、文件名称与格式，适配报表导出、资料下载、附件获取等场景。',
           },
        ],
    },
    {
        type: 'FormItems',
        title: '表单类元素',
        data: [
            {
                icon: <IconFormInput />,
                name: '单行输入',
                type: 'Input',
                description: '一种用于输入单行文本信息的基础表单组件，适用于输入简短、无需换行的内容，如姓名、手机号、邮箱等。',
            },
            {
                icon: <IconFormTextArea />,
                name: '多行输入',
                type: 'TextArea',
                description: '一种用于输入多行文本信息的表单组件，适用于输入较长、需要换行的内容，如备注、描述、意见反馈等。',
            },
            {
                icon: <IconFormSelect />,
                name: '下拉选择',
                type: 'Select',
                description: '一种用于从预设选项中选择单个或多个内容的表单组件，适用于选项固定、用户无需手动输入的场景，如性别、部门、学历等。',
            },
            {
                icon: <IconFormRadio />,
                name: '单选',
                type: 'Radio',
                description: '一种用于从多个选项中选择单个内容的表单组件，适用于只能选择一个选项的场景，如性别、是否同意、考试单选题等。',
            },
            {
                icon: <IconFormCheckbox />,
                name: '多选',
                type: 'CheckBox',
                description: '一种用于从多个选项中选择一个或多个内容的表单组件，适用于可选择多个选项的场景，如兴趣爱好、擅长技能、多选题目等。',
            },
            {
                icon: <IconFormDate />,
                name: '日期',
                type: 'DatePicker',
                description: '一种用于选择单个日期的表单组件，适用于需要输入具体日期的场景，如出生日期、入职日期、预约日期等。',
            },
            {
                icon: <IconFormDatepicker />,
                name: '日期范围',
                type: 'DatePickerRange',
                description: '一种用于选择两个日期（开始日期和结束日期）组成日期范围的表单组件，适用于需要输入时间段的场景，如查询时间范围、活动时间、请假时间等。',
            },
            {
                icon: <IconTime />,
                name: '时间选择',
                type: 'TimePicker',
                description: '一种用于选择单个具体时间的表单组件，适用于需要输入精确时间的场景，如会议时间、打卡时间、预约时间等。',
            },
            {
                icon: <IconFormTimepicker />,
                name: '时间范围框',
                type: 'TimePickerRange',
                description: '一种用于选择两个时间（开始时间和结束时间）组成时间范围的表单组件，适用于需要输入时间区间的场景，如工作时间段、活动时间段、监控时间范围等。',
            },
            {
                icon: <IconTreeSelect />,
                name: '弹出树',
                type: 'TreeSelect',
                description: '一种通过弹出面板展示树形结构、用于选择树形节点的表单组件，适用于选择具有层级关系的内容，如部门层级、分类层级、地区层级等。',
            },
            {
                icon: <IconCounter />,
                name: '步进器',
                type: 'Counter',
                description: '一种用于精确调整数字值的交互组件，通过点击增减按钮或直接输入，实现数字的步进式调整，支持单步进器和步进器组两种模式。',
            },
            {
                icon: <IconFormStatic />,
                name: '静态项',
                type: 'StaticItem',
                description: '一种用于展示静态信息的组件，不支持用户交互，仅用于呈现固定内容，可根据需求自定义展示格式和附加信息。',
            },
            {
                icon: <IconFormItem />,
                name: '表单项',
                type: 'FormItem',
                description: '一种用于表单场景的基础组件，用于承载表单中的输入、选择等交互元素，可统一控制表单元素的标题、样式和布局，实现表单的规范化展示。',
            },
            // {
            // name:'组合表单'
            // },
            {
                icon: <IconRate />,
                name: '星级',
                type: 'Rate',
                description: '一种用于评分或等级选择的交互组件，通过点击星级图标实现评分操作，支持半选、清除等功能，可自定义星级样式和数量。',
            },
            {
                icon: <IconFileUpload />,
                name: '上传',
                type: 'Upload',
                description: '一种用于上传文件的交互组件，支持选择本地文件并上传，可配置是否多选、是否禁用等属性，适用于图片、文档等文件的上传场景。',
            },
            {
                icon: <IconTransfer />,
                name: '穿梭框',
                type: 'Transfer',
                description: '一种用于在两个列表之间转移数据的交互组件，通过点击穿梭按钮实现数据的添加、移除，支持搜索、分页、全选等功能，适用于多选项的批量转移场景。',
            },
            {
                icon: <IconFormSlider />,
                name: '滑动条',
                type: 'Slider',
                description: '一种用于直观调整数值的交互组件，通过拖动滑块在指定范围内选择数值，支持单滑块、双滑块模式，可自定义数值范围和步长，适用于快速调整参数的场景。',
            },
            {
                icon: <IconFormSwitch />,
                name: '开关',
                type: 'Switch',
                description: '一种用于切换两种状态（开/关闭）的交互组件，通过点击开关按钮实现状态切换，支持自定义开关文案和加载状态，适用于简单的状态控制场景。',
            },
            {
                icon: <IconFormCascader />,
                name: '级联选择',
                type: 'Cascader',
                description: '一种用于多层级数据选择的交互组件，通过下拉列表展示层级关系，支持多选、搜索、清除等功能，适用于地区选择、分类选择等多层级场景。',
            },
            {
                icon: <IconFormInputNumber />,
                name: '数字输入',
                type: 'InputNumber',
                description: '一种用于输入数字的专用输入组件，仅允许输入数字相关内容，支持设置数值范围、前缀后缀，可自定义格式和样式，适用于需要精准输入数字的场景。',
            },
            {
                icon: <IconFormInputPassword />,
                name: '密码框',
                type: 'InputPassword',
                description: '一种用于输入密码的专用输入组件，输入内容默认隐藏（以星号或圆点显示），支持显示密码、删除内容、字数统计等功能，适用于密码输入、验证码输入等隐私场景。',
            },
            {
                icon: <IconFormInputPassword />,
                name: '分段选择',
                type: 'Segmented',
                description: '一种用于在多个选项中选择单个或多个的交互组件，以分段按钮的形式展示选项，点击选项可切换选中状态，适用于简单的多选项切换场景。',
            },

            // {
            //     icon: <IconColorPicker />,
            //     name: '颜色选择器',
            //     type: 'ColorPicker',
            // },

            // {
            //     icon: <IconJson />,
            //     name: 'Json',
            //     type: 'Json',
            // },
        ],
    },

    {
        type: 'Advanced',
        title: '高级组件',
        data: [
            {
                icon: <IconFloatingWindow />,
                name: '悬浮窗',
                type: 'FloatingWindow',
                description: '一种可悬浮于页面之上的独立容器元素，可自定义背景颜色，适用于快捷信息展示、悬浮操作入口等场景。',
            },
            {
                icon: <IconAIChat />,
                name: 'AI会话',
                type: 'AIChat',
                description: '用于对接灵运大模型提供自然语言对话交互能力，支持智能应答与意图识别，适配知识库查询、智能总结、客服辅助等AI会话场景。',
            },
            {
                icon: <IconList />,
                name: '列表组件',
                type: 'List',
                description: '一种用于批量展示多条结构化数据的列表元素，可配置头部、底部信息及数据展示样式，支持头像、标题、描述等内容展示，适用于各类数据列表、信息条目展示场景。',
            },
            {
                icon: <IconDescriptions />,
                name: '描述列表',
                type: 'Descriptions',
                description: '一种以键值对形式结构化展示详情数据的信息展示元素，可批量配置数据项，支持布局、样式与交互自定义，常用于页面详情、数据摘要、基础信息展示等场景。',
            },
            // {
            //     icon: <IconBaseTable />,
            //     name: '基础表格',
            //     type: 'NgapTable',
            // },
            {
                icon: <IconTree />,
                name: '目录树',
                type: 'Tree',
                description: '一种展示层级化树形结构数据的容器元素，支持节点展开/选中、异步加载子节点、复选框多选等功能，可配置节点样式与数据映射，适用于目录展示、权限选择、层级数据管理等场景。',
            },
            {
                icon: <IconSteps />,
                name: '步骤条',
                type: 'Steps',
                description: '一种用于展示多步骤流程节点、标识当前执行进度的导航元素，可清晰呈现步骤顺序与执行状态，适用于表单提交、业务办理、流程审批等分步操作场景。',
            },
            {
                icon: <IconPagination />,
                name: '分页',
                type: 'Pagination',
                description: '一种用于长列表数据分页浏览的控制元素，可实现页码切换、每页条数调整、页面快速跳转等功能，用于控制数据列表分页展示，提升大量数据的浏览体验。',
            },
            // {
            // name:'面包屑'
            // },
            {
                icon: <IconProgress />,
                name: '进度条',
                type: 'Progress',
                description: '一种用于直观展示任务完成比例、流程执行进度的可视化元素，支持普通进度条与仪表盘形态，可配置进度数值、状态、颜色及布局位置，适用于任务进度、流程节点、数据完成度展示场景。',
            },
            {
                icon: <IconTimeLine />,
                name: '时间轴',
                type: 'Timeline',
                description: '一种按时序或流程顺序展示节点内容的流式布局元素，以线性节点形式呈现内容先后次序，适用于流程展示、事件时序记录等场景。',
            },
            {
                icon: <IconBreadcrumb />,
                name: '面包屑',
                type: 'Breadcrumb',
                description: '展示当前页面在系统中的层级路径，支持点击返回上级页面，方便用户定位与导航，提升页面层级感知。',
            },
            // {
            // name:'标签筛选'
            // },
            {
                icon: <IconMenu />,
                name: '导航',
                type: 'Menu',
                description: '一种用于页面目录展示、路由跳转的菜单导航元素，支持多种布局展示形式，可配置菜单展开、选中、触发行为等交互能力，用于实现页面菜单切换与层级导航。',
            },
        ],
    },

    {
        type: 'Echart',
        title: '图表类',
        data: [
            {
                icon: <IconLineChart />,
                name: '折线图',
                type: 'LineChart',
                description: '一种以折线连接数据点展示数据连续变化趋势的可视化图表元素，可呈现数据波动与走向，支持图形样式、数据点、标签、图例及主题自定义配置，适用于数据趋势分析场景。',
            },
            {
                icon: <IconColumnChart />,
                name: '柱状图',
                type: 'ColumnChart',
                description: '一种以竖向柱形展示数据大小的可视化图表元素，用于多维度数据对比与统计分析，支持分组、堆叠展示，可自定义图形、标签、图例及主题样式。',
            },
            {
                icon: <IconBarAndLine />,
                name: '折柱组合图',
                type: 'BarAndLine',
                description: '一种同时以柱状、折线形式展示数据的组合可视化图表元素，可分别配置柱形与折线数据，兼顾数据大小对比与趋势变化展示，支持多维度样式自定义。',
            },
            {
                icon: <IconPieChart />,
                name: '饼状图',
                type: 'PieChart',
                description: '一种以扇形分割展示数据占比关系的可视化图表元素，通过扇形面积大小体现各分类数据在整体中的占比情况，适用于数据占比统计与分析场景。',
            },
            // {
            // name:'漏斗图'
            // },
            {
                icon: <IconMapChart />,
                name: '地图',
                type: 'MapChart',
                description: '一种用于展示地理信息、位置点位及空间数据的可视化元素，支持地图交互操作、点位选中控制，可配置标题、提示框、标签样式及主题，实现地理数据可视化展示。',
            },
            {
                icon: <IconBarChart />,
                name: '条形图',
                type: 'BarChart',
                description: '一种以横向条状展示数据大小的可视化图表元素，用于多维度数据对比分析，支持分组、堆叠展示，可自定义标签、图例、图形样式及主题风格。',
            },
        ],
    },
    {
        type: 'FeedBack',
        title: '提示类',
        data: [
            // {
            // name:'警告对话'
            // },
            // {
            // name:'警告提示'
            // },
            // {
            // name:'信息提示'
            // },
            {
                icon: <IconFeedBackModal />,
                name: '弹窗',
                type: 'Modal',
                description: '一种从页面中间弹出的交互容器元素，用于展示临时信息、承载用户操作，可配置标题、按钮及各类交互属性，内部可嵌入其他元素。',
            },
            {
                icon: <IconFeedBackResult />,
                name: '结果页',
                type: 'Result',
                description: '一种用于展示操作执行结果或系统异常状态的页面元素，通过状态样式、标题、子标题组合向用户反馈结果信息。',
            },
            {
                icon: <IconFeedBackEmpty />,
                name: '空状态',
                type: 'Empty',
                description: '一种用于页面无数据、无内容场景下展示的提示元素，通过图片与描述文字组合，向用户呈现空数据时的友好提示信息。',
            },
            {
                icon: <IconFeedBackDrawer />,
                name: '抽屉',
                type: 'Drawer',
                description: '一种侧滑弹出式容器元素，可从页面顶部、右侧、底部、左侧方位滑出展示内容，支持配置样式与交互属性，内部可嵌入其他元素。',
            },
            {
                icon: <IconSpin />,
                name: '加载提示',
                type: 'Spin',
                description: '数据请求、接口提交、页面渲染时显示的加载动画与提示，提升等待体验，避免重复操作。',
            },
            {
                icon: <IconPopover />,
                name: '气泡弹窗',
                type: 'Popover',
                description: '支持通过事件触发展示的轻量化容器，可承载任意子元素，当页面上其他元素事件设置触发气泡弹框时，气泡弹窗会自动定位在其旁侧展示预置的提示信息。',
            },
        ],
    },
    {
        type: 'Other',
        title: '其它类',
        data: [
            // {
            //     icon: <IconIframe />,
            //     name: '筛选区块',
            //     type: 'IFrame',
            // },
        ],
    },
];

// 元素分类查询
const queryElementTypeFun = (elementId: string) => {
    try {
        request
            .post('/element/queryElementTypeList', {
                params: {},
            })
            .then((res) => {
                queryElementFun(elementId, res.beans);
            })
            .catch((err) => {});
    } catch (error) {
        message.error('自定义元素分类查询失败');
    } finally {
    }
};

// 获取自定义元素
const queryElementFun = (elementId: string, appElementType: any) => {
    try {
        request
            .post('/element/queryElementList', {
                params: {
                    elementId: elementId,
                    provId: userInfo.provinceId,
                },
            })
            .then((res) => {
                const elementInfo = res.beans.filter((item: any) => item.elementStatus === '2'); // 已发布自定义元素
                if (elementInfo.length > 0) {
                    // 审核通过或者初始化加载，添加自定义元素
                    elementInfo.forEach((item: any) => {
                        // 要添加的新数据
                        const newItem = {
                            icon: item.elementIcon,
                            name: item.elementName,
                            type: item.elementId,
                            provId: item.provId,
                            description: item.elementDesc
                        };
                        const index = components.findIndex((items) => items.type === item.elementTypeId);
                        if (index !== -1) {
                            // 如果存在，直接添加到 data 数组
                            components[index].data.push(newItem);
                        } else {
                            // 如果不存在，新增一项
                            components.push({
                                type: item.elementTypeId,
                                title: appElementType.find((items: any) => items.elementTypeId === item.elementTypeId)?.elementTypeName,
                                data: [newItem],
                            });
                        }
                    });
                } else {
                    // 提交审核，移除自定义元素
                    components = components.map((item) => ({
                        ...item,
                        data: item.data.filter((subItem) => subItem.type !== elementId),
                    }));
                }
            })
            .catch((err) => {});
    } catch (error) {
        message.error('自定义元素查询失败');
    } finally {
    }
};
setTimeout(() => {
    queryElementTypeFun('');
}, 1000);

export default components;

// 更新画布中全局自定义元素菜单
export const updateCustomElementMenu = (elementId: string) => {
    queryElementTypeFun(elementId);
};

// 导出元素菜单
export const getComponentMenu = () => {
    return components;
};
