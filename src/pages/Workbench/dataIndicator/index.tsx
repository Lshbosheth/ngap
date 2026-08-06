import './index.less'
import '../index.less'
import {useEffect, useState} from "react";
import Item from "@/pages/Workbench/dataIndicator/item";
import {crossApiUserInfo} from "@/stores/crossapiStore";
import request from "@/utils/request";
import {isEmpty} from "@/utils/util";

interface DataIndicatorProps {
    index: number
}

const DataIndicator = ({index}: DataIndicatorProps) => {
    const userInfo = crossApiUserInfo((state) => state.userInfo);

    const [dataSource, setDataSource] = useState([
        {
            title: '应用数据监控指标',
            data: [
                {title:'应用总数',value:'--'},
                {title:'上架应用数',value:'--'},
                {title:'点击量',value:'--'},
                {title:'使用坐席量',value:'--'},
            ]
        },
        {
            title: '存量菜单数据指标',
            data: [
                {title:'存量菜单总量',value:'--'},
                {title:'生产菜单总量',value:'--'},
                {title:'运营管理菜单总量',value:'--'},
                {title:'配置菜单总量',value:'--'},
            ]
        }
    ])

    useEffect(()=>{
        if (index === 0){
            //应用数据监控指标
            fetch0Data()

        }else if (index === 1){
            //存量菜单数据指标
            fetch1Data()
        }
    },[])

    const fetch1Data = async ()=>{
        const keys = ['allMenuCount','prodMenuCount','operationMenuCount','systemConfigMenuCount']
        try {
            const resp = await request.post('/appConsole/queryStockMenuData', {
                params: {
                    provinceId: userInfo.provinceId == "0000" ? "00030089" : userInfo.provinceId,
                    channel: "ngap"
                }
            })
            const bean = resp.bean || {};
            setDataSource(pre=>{
                const arr = [...pre]
                keys.forEach((key:string,index:number)=>{
                    arr[1].data[index].value = bean?.[key] || 0
                })
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    const fetch0Data = ()=>{
        fetchAppTotal()
        fetchOnlineCount()
    }

    //应用总数
    const fetchAppTotal = async ()=>{
        try {
            const params = {
                provId: userInfo.provinceId, appStatus: ''
            }
            const resp = await request.post('/appConsole/queryAppSum', {params})
            setDataSource(pre=>{
                const arr = [...pre]
                arr[0].data[0].value = resp.bean?.countNum || 0
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    //上架应用数
    const fetchOnlineCount = async ()=>{
        try {
            const params = {
                provId: userInfo.provinceId, appStatus: '6,10,11'
            }
            const resp = await request.post('/appConsole/queryAppSum', {params})

            const relationIdList = resp.bean?.relationIdList
            if (!isEmpty(relationIdList)){
                fetchClickCount(relationIdList)
                fetchSeatsCount(relationIdList)
            }
            setDataSource(pre=>{
                const arr = [...pre]
                arr[0].data[1].value = resp.bean?.countNum || 0
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    //点击量
    const fetchClickCount = async (relationIdList:string[])=>{
        try {
            const params = {
                relationId: relationIdList.join(','),
                indexType:'1'
            }
            const resp = await request.post('/appConsole/appMetrics', {params})
            setDataSource(pre=>{
                const arr = [...pre]
                arr[0].data[2].value = resp.bean?.result || 0
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }

    //使用坐席量
    const fetchSeatsCount = async (relationIdList:string[])=>{
        try {
            const params = {
                relationId: relationIdList.join(','),
                indexType:'2'
            }
            const resp = await request.post('/appConsole/appMetrics', {params})
            setDataSource(pre=>{
                const arr = [...pre]
                arr[0].data[3].value = resp.bean?.result || 0
                return arr
            })
        } catch (e) {
            console.error(e)
        }
    }


    return <div className={'data-indicator-wrap'}>
        <div className={'work-bench-title'}>{dataSource[index].title}</div>
        <div className={'data-indicator-data-wrap'}>
            {dataSource[index].data.map((item:any,i:number)=><Item data={item} index={i}/>)}
        </div>
    </div>
}

export default DataIndicator
