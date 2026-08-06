import './index.less'
import {useNavigate} from "react-router-dom";
import {isEmpty} from "@/utils/util";
import {Popover} from "antd";
import {useEffect, useRef, useState} from "react";

interface ItemProps {
    data: any;
    index: number;
}

const Item = ({data, index}: ItemProps) => {
    const navigate = useNavigate()

    const timerRef = useRef<NodeJS.Timeout>()

    const [open, setOpen] = useState(false)

    const getImgUrl = (fileName: string) => {
        return new URL(`../img/${fileName}`, import.meta.url).href
    }

    useEffect(() => {
        return () => clearTimeout(timerRef?.current)
    }, [])

    useEffect(()=>{
        clearTimeout(timerRef?.current)

        if (open){
            timerRef.current = setTimeout(() => {
                setOpen(false)
            }, 3000)
        }

    },[open])

    const onJump2Menu = () => {
        const path = data.path
        if (isEmpty(path)) {
            setOpen(true)
            return
        }
        navigate('build', {state: {path}})
    }

    const onOpenChange = (v: boolean) => {
        setOpen(v)
    }

    const popContent = () => {
        // return <div>功能建设中,敬请期待!</div>
        return <img className={'fre-use-pop-content'} src={getImgUrl('toast-building.png')}/>
    }

    return <div className={'fre-use-item-wrap'}>
        <Popover overlayClassName={'fix-pop-arrow'} arrow={false} open={open} trigger={'click'} content={popContent()}
                 onOpenChange={onOpenChange} placement={'rightTop'} align={{offset:[0,-30]}}>
            <img className={'fre-use-item-icon'} src={getImgUrl(data.icon)} onClick={onJump2Menu}/>
        </Popover>
        <div>{data.title}</div>
    </div>
}
export default Item
