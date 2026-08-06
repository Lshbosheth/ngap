import './index.less'
import {Button, DatePicker, message, Pagination, Radio, Select, Table} from 'antd'
import {useEffect, useRef, useState} from "react";
import request from "@/utils/request";
import {QuestionCircleOutlined} from "@ant-design/icons";
import { baseApiConvert } from '../../utils/util';
import CrossApi from "@/utils/crossAPI"
import dayjs from 'dayjs'

import Map from './china-map/index'

import BarChart from './bar-chart/index'
import RingChart from './ring-chart/index'

import {appTypeArr, getColumns} from './params'
import {getKey, isEmpty, isTest} from "@/utils/util";
import CommonEmpty from "@/widget/commonEmpty";
import {RadioChangeEvent} from "antd/es/radio/interface";
import {publictData} from "@/utils/appMenuData";
import {RESULT} from "@/pages/evaluateRecord/params";
import DependModal, {DependModalRef} from "@/pages/evaluateRecord/DependModal";
import {menu} from "@/stores/menuStore";

const {RangePicker} = DatePicker


const AppEffectBoard = () => {
    const menuStore = menu((state) => state)

    const modalRef = useRef<DependModalRef>()

    const [hxzbArr, setHXZBArr] = useState([
        {label: '应用总数', icon: 'icon-app-count.png', content: '--', color: '#F0FAFF',tips:'当前应用列表中的应用总量（多版本的应用需去重）'},
        {label: '上架应用数', icon: 'icon-launch-app-count.png', content: '--', color: '#FEF9F3',tips:'当前应用列表中处于已上架、下架审核、下架公示状态的应用总量'},
        {label: '覆盖坐席数', icon: 'icon-seats.png', content: '--', color: '#FAF6FC',tips: '访问当前已上架应用的独立坐席总数（去重）'},
        {
            label: '应用访问总量',
            icon: 'icon-visit-count.png',
            content: '--',
            color: '#F3F6FF'/*, follow: '万'*/,
            tips:'当前已上架应用页面的总访问量'
        },
        {label: '应用评价率', icon: 'icon-rate.png', content: '--', color: '#F1FDFD', follow: '%',tips:'当前已上架应用内有产生评价行为的去重应用数 ÷ 当前已上架应用总数'},
    ])

    //relationId map
    const [relationMap, setRelationMap] = useState<Record<string, string[]> | null>(null)
    //全量relationId
    const [relationIdList, setRelationIdList] = useState<any[]>([])

    const [tenants, setTenants] = useState<any[]>([])
    const [selectTenant, setSelectTenant] = useState('')

    const [projects, setProjects] = useState<any[]>([])
    const [selectProject, setSelectProject] = useState('')

    const [appType, setAppType] = useState('2')

    const initProv = {label: '全国', value: ''}
    const [selectProv, setSelectProv] = useState<any>(initProv)

    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [mapData, setMapData] = useState<any[]>([])

    const [useDetailArr, setUseDetailArr] = useState([
        {
            title: '应用访问量', content: '--', icon: 'icon-detail-visit-count.png',
            chartColor: '#009AF1',
            data: []
        },
        {
            title: '点赞率', content: '--', icon: 'icon-detail-good.png',
            chartColor: '#5FD09A',
            data: []
        },
        {
            title: '点踩率', content: '--', icon: 'icon-detail-bad.png',
            chartColor: '#2ECCD8',
            data: []
        },
    ])

    const initCards = [
        {title: '稳健级应用', rate: 0, num: 0, seats: '--', color: '#F0FAFF', res: RESULT.WJJ},
        {title: '改进级应用', rate: 0, num: 0, seats: '--', color: '#F6FDFF', res: RESULT.GJJ},
        {title: '下线级应用', rate: 0, num: 0, seats: '--', color: '#F6F7FF', res: RESULT.XXJ},
        {title: '未评估应用', rate: 0, num: 0, seats: '--', color: '#F5F5F5', res: RESULT.WPG},
    ]

    const [cards, setCards] = useState(initCards)

    const [selectCard, setSelectCard] = useState<any>(null)

    const [loading, setLoading] = useState(false)

    const [yypgDatas, setYYPGDatas] = useState([])

    const [currentItem, setCurrentItem] = useState()

    const [columnFilter,setColumnFilter] = useState({})

    useEffect(() => {
        fetchTotal()
        fetchUpTotal()

        fetchYYCX()
        fetchTenants()
    }, [])

    useEffect(() => {
        fetchSeatsCount()
        fetchVisitCount()
        fetchRate()
    }, [relationIdList])

    useEffect(() => {
        fetchMapData()
    }, [appType, relationMap])

    useEffect(() => {
        fetchProjects()
    }, [selectTenant])

    useEffect(() => {
        fetchCardData()
        fetchTableData()
    }, [selectTenant, selectProject])

    useEffect(() => {
        changeUseDetail()
    }, [mapData, selectProv])

    useEffect(() => {
        fetchTop10('1')
        fetchTop10('2')
        fetchTop10('3')
    }, [selectProv, relationMap])

    useEffect(() => {
        fetchTableData()
    }, [selectCard, pageNum, pageSize,columnFilter])

    const changeUseDetail = async () => {
        const getContent = (key: string) => {
            const content = mapData.find((item: any) => item.code === (selectProv?.value || ''))?.[key]
            return !isEmpty(content) ? content : '--'
        }

        setUseDetailArr(prev => {
            const arr = [...prev]
            arr[0].content = getContent('visit')
            arr[1].content = getContent('good')
            arr[2].content = getContent('bad')
            return arr
        })
    }

    const fetchTop10 = async (operType: string) => {
        if (isEmpty(relationMap)) {
            return
        }

        const getData = (arr: any[], resp: any) => {
            arr[Number(operType) - 1].data = resp.beans?.map((item: any) => {
                return {
                    label: item.appName, value: item.total
                }
            })
        }

        try {
            const params = {operType, appType, provCode: selectProv?.value, relationId: getRelationId()}
            const resp = await request.post('/appDashboard/appTenantTop', {params})

            setUseDetailArr(prev => {
                const arr = [...prev]
                getData(arr, resp)
                return arr
            })

        } catch (e) {
            console.error(e)
        }
    }

    const fetchCardData = async () => {
        try {
            const params = {provId: getProvId(), projectId: selectProject}
            const resp = await request.post('/appDashboard/queryAppEvaluateList', {params})

            const total = resp.bean.totalNum || 0
            const evaluateResMap = resp.bean.evaluateResMap
            if (total === 0 || isEmpty(evaluateResMap)) {
                setCards(initCards)
                return
            }

            const setItem = (item: any) => {
                const num = evaluateResMap[`${item.res}_num`]?.length || 0
                item.num = num
                item.rate = num === 0 ? 0 : (num / total * 100).toFixed(2)
            }

            setCards(prev => {
                const arr = [...prev]
                arr.forEach(item => {
                    setItem(item)
                })
                return arr
            })

            setSelectCard(cards[0])
        } catch (e) {
            console.error(e)
        }
    }

    const fetchTableData = async () => {
        //因为必选 所以为空时不请求
        const evaluateRes = selectCard?.res
        if (isEmpty(evaluateRes)){
            return
        }
        setLoading(true)
        try {
            const params = {
                provId: getProvId(), projectId: selectProject, evaluateRes,
                start: (pageNum - 1) * pageSize, limit: pageSize,...columnFilter
            }
            const resp = await request.post('/appDashboard/queryAppEvaluateInfoList', {params})
            setYYPGDatas(resp.beans || [])
            setTotal(resp.bean?.total || 0)
        } catch (e) {
            setYYPGDatas([])
            setTotal(0)
            console.error(e)
        }
        setLoading(false)
    }

    const getProvId = () => {
        const code = tenants.find(item => item.value === selectTenant)?.code
        return isEmpty(code) ? '' : publictData.serviceTypeId2ProvId[code]
    }

    const fetchProjects = async () => {
        setSelectProject('')
        try {
            const params = {tenantId: selectTenant}
            const resp = await request.post('/appDashboard/queryProjectList', {params})
            setProjects([{label: '全部项目', value: ''}, ...resp.beans?.map((item: any) => {
                return {
                    label: item.projectNm,
                    value: item.projectId
                }
            })])
        } catch (e) {
            console.error(e)
        }
    }

    //应用总数
    const fetchTotal = async () => {
        try {
            const resp = await request.post('/appDashboard/queryIndicatorCoreAppTotal')
            setHXZBArr(prev => {
                const arr = [...prev]
                arr[0].content = formatNum(resp.bean?.total)
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    //上架应用数
    const fetchUpTotal = async () => {
        try {
            const resp = await request.post('/appDashboard/queryIndicatorCoreUpAppTotal')
            setRelationIdList(resp.bean?.relationIdList || [])
            setHXZBArr(prev => {
                const arr = [...prev]
                arr[1].content = formatNum(resp.bean?.countNum)
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    //覆盖坐席数
    const fetchSeatsCount = async () => {
        if (isEmpty(relationIdList)) {
            return
        }
        try {
            const params = {indexType: '2', relationId: relationIdList.join(',')}
            const resp = await request.post('/appDashboard/appMetrics', {params})
            setHXZBArr(prev => {
                const arr = [...prev]
                arr[2].content = formatNum(resp.bean?.result)
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    //应用访问总量
    const fetchVisitCount = async () => {
        if (isEmpty(relationIdList)) {
            return
        }
        try {
            const params = {indexType: '1', relationId: relationIdList.join(',')}
            const resp = await request.post('/appDashboard/appMetrics', {params})
            setHXZBArr(prev => {
                const arr = [...prev]
                arr[3].content = formatNum(resp.bean?.result)
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    //应用评价率 fetchRate
    const fetchRate = async () => {
        if (isEmpty(relationIdList)) {
            return
        }
        try {
            const params = {indexType: '4', relationId: relationIdList.join(',')}
            const resp = await request.post('/appDashboard/appMetrics', {params})
            setHXZBArr(prev => {
                const arr = [...prev]
                arr[4].content = (resp.bean?.result / relationIdList.length * 100).toFixed(2)
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    const fetchYYCX = async () => {
        try {
            const params = {appStatus: '6,10,11'}
            const resp = await request.post('/appDashboard/queryAppEffectModuleRelationIdList', {params})
            setRelationMap(resp?.bean?.relationProvMap)
        } catch (e) {
            console.error(e)
        }
    }

    const getRelationId = () => {
        let relationId = ''
        if (appType === '1') {
            //一级应用
            relationId = relationMap?.['0000']?.join(',') || ''
        } else {
            //二级应用
            let temp: any[] = []
            Object.keys(relationMap as any).filter(key => key !== '0000').forEach(key => {
                temp = [...temp, ...relationMap?.[key] || []]
            })
            relationId = temp.join(',')
        }
        //26042319095501215,26042318575801214,26051115173901453
        return relationId
    }


    const fetchMapData = async () => {
        if (isEmpty(relationMap)) {
            return
        }

        const getAppCount = (item: any) => {
            return relationMap?.[item.provCode || '0000']?.length || 0
        }


        try {
            const params = {appType, relationId: getRelationId()}
            const resp = await request.post('/appDashboard/getTotalVisitsByProv', {params})

            const getItem = (reItem: any) => {
                return {
                    name: getProvinces().find(i => i.value === reItem?.provCode)?.label || '全国',
                    code: reItem?.provCode || '',
                    count: getAppCount(reItem),
                    visit: reItem?.total || 0,
                    good: reItem?.likeRate || '0.00%',
                    bad: reItem?.dislikeRate || '0.00%'
                }
            }

            setMapData([
                getItem(resp.bean),
                ...resp.beans?.map((item: any) => {
                    return getItem(item)
                })
            ])
        } catch (e) {
            console.error(e)
        }
    }

    const fetchTenants = async () => {
        try {
            const params = {start: 0, limit: 100}
            const resp = await request.post('/appTenant/queryAppTenantList', {params})
            setTenants([{label: '全部租户', value: '', code: ''}, ...resp.beans.map((item: any) => {
                return {
                    label: item.tenantName,
                    value: item.configId,
                    code: item.tenantCode
                }
            })])
        } catch (e) {
            console.error(e)
        }
    }

    const formatNum = (v: number) => {
        if (isEmpty(v)) return '--'
        return v.toLocaleString()
    }

    const onProvChange = (v: string) => {
        setSelectProv(getProvinces().find(item => item.value === v))
    }

    const onMapProvChange = (name: string) => {
        if (isEmpty(name)) {
            setSelectProv(initProv)
            return
        }
        setSelectProv(getProvinces().find(item => item.label === name))
    }

    const getProvinces = () => {
        return [{label: '全国', value: ''}, ...publictData.provinceSelectValue]
    }

    const handleContent = (item: any) => {
        return <div style={{fontWeight: 600}}>
            <span style={{fontSize: 24}}>{item.content}</span>
            <span style={{fontSize: 14}}>{item.follow}</span>
        </div>
    }

    const onLevelChange = (e: RadioChangeEvent) => {
        setAppType(e.target.value)
        setSelectProv(initProv)
    }

    const onTenantChange = (e: string) => {
        setSelectTenant(e)
    }

    const onProjectChange = (e: string) => {
        setSelectProject(e)
    }

    const onSelectCard = (item: any) => {
        if (item.res === selectCard?.res) {
            // setSelectCard(null)
            return
        }
        setPageNum(1)
        setSelectCard(item)
    }

    const onExport = () => {
        // GoldBankCheckAction({operContent:'明细导出',operCode:''}, '', function (checkData: any) {
        //     if (!checkData){
        //         return
        //     }
        try {
            const params = {
                provId: getProvId(), projectId: selectProject, evaluateRes: selectCard?.res || '', ...columnFilter
            }

            request.download('/appDashboard/dowsnAppEvaluateInfoList', {params})
        } catch (e) {
            console.error(e)
        }
        // });
    }

    const getImgUrl = (fileName: string) => {
        return new URL(`./imgs/${fileName}`, import.meta.url).href
    }

    const showTotal = (total: any) => {
        return `共${total}条数据`;
    }

    const onChange = (pageNum: any, pageSize: any) => {
        setPageNum(pageNum)
        setPageSize(pageSize)
    }

    const onShowSizeChange = (pageNum: any, pageSize: any) => {
        setPageNum(1)
        setPageSize(pageSize)
    }

    const showDetail = (record: any) => {
        setCurrentItem(record)
        modalRef?.current?.showModal()
    }

    const jump2Record = (record: any) => {
        menuStore.closeTab('应用评估记录');
        setTimeout(() => {
            menuStore.openMenu({key: 'evaluateRecord', params: {id: record.appId}});
        });
    }

    const columnSearch = (key:any,value:any)=>{
        setColumnFilter(pre=>{
            const obj:any = {...pre}
            obj[key] = value
            return obj
        })
        setPageNum(1)
    }

    const jump2Page = (index: number) => {
        if (index === 0) {
            const fmt = 'YYYY-MM-DD HH:mm:ss'
            const startTime = dayjs().startOf('day').format(fmt)
            const endTime = dayjs().format(fmt)
            const params = {startTime, endTime, timeType: '24小时', timesInput: `${startTime} - ${endTime}`,provCode:selectProv.value}
            let url = `http://ngap.cs.cmos${isTest() ? ':8080' : ''}/ngaplog/appWarnDialog.html`;
            url = baseApiConvert(url);
            CrossApi.destroyTab('应用访问明细');
            CrossApi.createTab('应用访问明细', url, params);
            return
        }
        menuStore.closeTab('应用成效明细');
        setTimeout(() => {
            menuStore.openMenu({
                key: 'applicationAchievements',
                params: {provId: selectProv?.value || ''}
            });
        });
    }

    return <div className={'app-effect-board-wrap'}>
        {/*<div className={'date-wrap card'}>*/}
        {/*    <RangePicker*/}
        {/*        allowClear*/}
        {/*        format={'YYYY-MM-DD'}/>*/}
        {/*</div>*/}

        <div className={'hxzb-wrap card'} style={{marginTop: 0}}>
            <div className={'hxzb-title-wrap'}>

                <div className={'title'}>核心指标</div>
                {/*<img className={'hxzb-setting'} src={getImgUrl('setting.png')}/>*/}
            </div>

            <div className={'hxzb-content-wrap'}>
                {/*<img className={'hxzb-arrow'} src={getImgUrl('arrow-left.png')}/>*/}
                <div className={'hxzb-middle-wrap'}>
                    {hxzbArr.map((item: any, index: number) =>
                        <div className={'hxzb-middle-item'}
                             style={{
                                 background: item.color,
                                 marginRight: index < hxzbArr.length - 1 ? 10 : 0
                             }}>
                            <img className={'icon'} src={getImgUrl(item.icon)}/>
                            <div className={'hxzb-middle-item-right'}>
                                <div style={{fontSize: 13}}>{item.label}
                                    &nbsp;<QuestionCircleOutlined style={{color:'#B5B5B5'}} title={item.tips}/></div>
                                {handleContent(item)}
                            </div>

                        </div>)}
                </div>
                {/*<img className={'hxzb-arrow'} src={getImgUrl('arrow-right.png')}/>*/}
            </div>
        </div>

        <div className={'yycx-wrap card'}>
            <div className={'yycx-title-wrap'}>
                <div className={'title'}>应用成效</div>
                <Radio.Group className={'radio'} onChange={onLevelChange} value={appType}>
                    {appTypeArr.map(item => <Radio.Button value={item.value}>{item.label}</Radio.Button>)}
                </Radio.Group>
            </div>

            <div className={'yycx-content'}>
                <div className={'map-wrap'}>
                    <Map selectedProv={selectProv} onMapProvChange={onMapProvChange}
                         appType={appType} mapData={mapData || []}/>
                </div>
                <div className={'yycx-right'}>
                    <div className={'yycx-right-title'}>
                        <div className={'yycx-right-label'}>使用明细</div>
                        <Select style={{width: 100}} placeholder={'选择省份'} value={selectProv?.value as any}
                                onChange={onProvChange} options={getProvinces() as any}/>
                    </div>

                    <div className={'yycx-right-content-wrap'}>
                        {useDetailArr.map((item: any, index: number) =>
                            <div className={'yycx-right-item'}>
                                <div className={'yycx-right-item-title'}>
                                    <img className={'yycx-right-item-title-icon'}
                                         src={getImgUrl(item.icon)}/>
                                    <div className={'yycx-right-item-title-right'}>
                                        <div>{item.title}</div>
                                        <div>
                                            <span
                                                className={'yycx-right-item-title-right-content'}>{item.content}</span>
                                        </div>

                                    </div>

                                    <img className={'yycx-arrow'} onClick={() => {
                                        jump2Page(index)
                                    }}
                                         src={getImgUrl('arrow-right.png')}/>

                                </div>

                                {/*柱状图*/}
                                {!isEmpty(item.data) &&
                                    <BarChart data={item.data} color={item.chartColor} rate={index !== 0}/>}
                                {isEmpty(item.data) && <CommonEmpty height={'400px'}/>}

                            </div>)}
                    </div>
                </div>
            </div>
        </div>

        <div className={'yypg-wrap card'}>
            <div className={'yypg-title-wrap'}>
                <div className={'title'}>应用评估</div>
                <Select style={{width: 150, marginLeft: 10}} value={selectTenant as any}
                        options={tenants as any} onChange={onTenantChange}/>

                <Select style={{width: 120, marginLeft: 10}} value={selectProject as any}
                        options={projects as any} onChange={onProjectChange}/>
            </div>

            <div className={'yypg-middle-wrap'}>
                {cards.map((item: any, index: number) =>
                    <div className={'yypg-middle-item'}
                         style={{
                             marginRight: index === cards.length - 1 ? 0 : 20
                             , background: item.color,
                             border: `2px solid ${selectCard?.res === item.res ? '#35ACEF' : 'transparent'}`
                         }} onClick={() => {
                        onSelectCard(item)
                    }}>

                        <img className={'yypg-bg'}
                             src={getImgUrl(`bg-yypg-${index + 1}.png`)}/>

                        <RingChart percent={item.rate} size={40}/>

                        <div className={'yypg-middle-item-right'}>
                            <div className={'yypg-middle-item-right-title'}>{item.title}</div>

                            <div className={'yypg-middle-item-right-content-wrap'}>

                                <div>
                                    <div className={'yypg-middle-item-right-content-title'}>占比</div>
                                    <div><span className={'yypg-middle-item-right-content'}>{item.rate}</span>%</div>
                                </div>

                                <div className={''}>
                                    <div className={'yypg-middle-item-right-content-title'}>应用数</div>
                                    <div><span className={'yypg-middle-item-right-content'}>{item.num}</span></div>
                                </div>

                                <div className={''}>
                                    <div className={'yypg-middle-item-right-content-title'}>平均覆盖坐席</div>
                                    {/*<div><span className={'yypg-middle-item-right-content'}>{item.seats}</span>人</div>*/}
                                    <div><span className={'yypg-middle-item-right-content'}>--</span></div>
                                </div>
                            </div>
                        </div>
                    </div>)}
            </div>

            <div className={'yypg-bottom-table'}>

                <Button onClick={onExport}
                        style={{marginBottom: 10, alignSelf: "flex-end"}} type={'primary'} ghost>导出</Button>

                {/*<CommonEmpty height={'300px'}/>*/}
                <Table dataSource={yypgDatas} loading={loading}
                       scroll={{y:550}}
                       columns={getColumns(selectCard?.res,showDetail, jump2Record,columnSearch)}
                       pagination={false}/>

                <Pagination
                    showSizeChanger showQuickJumper
                    showTotal={showTotal}
                    current={pageNum}
                    pageSize={pageSize}
                    onChange={onChange}
                    pageSizeOptions={['10', '20', '50', '100']}
                    className={'app-effect-pagination'}
                    onShowSizeChange={onShowSizeChange}
                    total={total}/>
            </div>

        </div>

        <DependModal currentItem={currentItem} ref={modalRef}/>

    </div>
}

export default AppEffectBoard
