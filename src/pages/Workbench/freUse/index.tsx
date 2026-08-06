import './index.less'
import '../index.less'
import {useState} from "react";
import Item from "@/pages/Workbench/freUse/Item";

const FreUse = ()=>{

    const [dataSource,setDataSource] = useState([
        {icon:'icon-menu-any.png',title:'菜单相似度分析',path:''},
        {icon:'icon-app-map.png',title:'应用地图',path: 'applicationMap'},
        {icon:'icon-app-board.png',title:'应用看板',path: 'appEffectBoard'},
        {icon:'icon-app-list.png',title:'应用列表',path: 'applicationList'},
    ])

    return <div className={'fre-use-wrap'}>
        <div className={'work-bench-title'}>常用功能</div>
        <div className={'fre-use-data-wrap'}>
            {dataSource.map((item:any,index:number)=><Item data={item} index={index}/>)}
        </div>
    </div>
}
export default FreUse
