import "./index.less";
import { useEffect, useState } from "react";
import { DatePicker, Input } from "antd";
import ColorPicker from "@/packages/components/ColorPicker/ColorPicker";
import dayjs from "dayjs";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { numberToChinese } from "@/packages/utils/util";

interface TimelineNodeConfigProps {
    value?: any,
    onChange?: (v: any) => void
}

const TimelineNodeConfig = ({ value, onChange }: TimelineNodeConfigProps) => {

    const dateFormat = 'YYYY-MM-DD HH:mm:ss'
    const [dataSource, setDataSource] = useState(value);

    const changeDataSource = (index: number, key: string, value: any) => {
        setDataSource((prev:any) => {
            const arr = [...prev];
            const item = {...arr[index]}
            item[key] = value;
            arr[index] = item
            return arr;
        });
    };

    const onAddNode = ()=>{
        setDataSource((prev:any) => {
            return [...prev,{
                label:'',
                children:'',
                color:'#0B91DC'
            }]
        });
    }

    const onDeleteNode = (index:number)=>{
        setDataSource((prev:any) => {
            return [...prev]?.filter((_:any,i:number)=>i !== index)
        });
    }

    useEffect(()=>{
        onChange?.(dataSource)
    },[dataSource])

    const colorSource = [
        { title: "进行中", value: "#0B91DC" },
        { title: "正常/成功/完成", value: "#31C846" },
        { title: "警示/失败/错误", value: "#F65A56" },
        { title: "置灰文字", value: "#BBBBBB" }
    ];

    return <div className={"timeline-config-wrap"}>
        {dataSource.map((item: any, index: number) => <div className={"timeline-config-item-wrap"}>
            <div className={"timeline-config-item-title"}>
                <div className={'title-point'}/>
                <div>节点{numberToChinese(index + 1)}</div>
                {dataSource?.length > 1 && <DeleteOutlined className={"title-delete"} onClick={() => {
                    onDeleteNode(index);
                }} />}
            </div>
            <div className={"timeline-config-item-content"}>
                <div className={"timeline-config-item-label"}>节点时间</div>
                <div className={"timeline-config-item-value"}><DatePicker showTime format={dateFormat} value={item.label?dayjs(item.label,dateFormat):''} onChange={(e:any) => {
                    changeDataSource(index, 'label',e.format(dateFormat));
                }} /></div>
            </div>

            <div className={"timeline-config-item-content"}>
                <div className={"timeline-config-item-label"}>节点内容</div>
                <div className={"timeline-config-item-value"}><Input placeholder={'请输入节点内容'} value={item.children} onChange={(e:any) => {
                    changeDataSource(index, 'children',e.target.value);
                }} /></div>
            </div>

            <div className={"timeline-config-item-content"}>
                <div className={"timeline-config-item-label"}>节点颜色</div>
                <div className={"timeline-config-item-value"}><ColorPicker dataSource={colorSource} key={item.color} index={index} value={item.color} onChange={(e:any) => {
                    changeDataSource(index, 'color',e);
                }} /></div>
            </div>
        </div>)}

        <div className={'timeline-add-btn'} onClick={onAddNode}><PlusOutlined/>新增节点</div>
    </div>;
};

export default TimelineNodeConfig;
