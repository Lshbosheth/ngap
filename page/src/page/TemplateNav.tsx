import { memo, useEffect, useRef, useState } from "react";
import style from "./index.module.less";

export default memo(({nodeList, componentIndex, updateScroll}: any) => {
    const navNodes = useRef<HTMLDivElement>(null);
    const templateNavBox = useRef<HTMLDivElement>(null);
    const [moveLeftState, setMoveLeftState] = useState(false);
    const [moveRightState, setMoveRightState] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            let boxWidth = navNodes.current?.getBoundingClientRect()?.width || 0;
            let innerWidth = templateNavBox.current?.getBoundingClientRect()?.width || 0;
            let flag: boolean = boxWidth < innerWidth - 10;
            setMoveLeftState(flag);
            setMoveRightState(flag);
        }, 500)
    }, [nodeList]);
    useEffect(() => {
        if(navNodes && navNodes.current){
            navNodes.current.scrollLeft = componentIndex * 178;
        }
    }, [componentIndex])
    const moveLeft = () => {
        moveNav("left");
    }
    const moveRight = () => {
        moveNav("right");
    }
    const moveNav = (direction: string) => {
        let currentNav = Number(((navNodes?.current?.scrollLeft || 0) / 178).toFixed(2));
        let box = navNodes.current?.getBoundingClientRect() || {width: 0};
        let inner = templateNavBox.current?.getBoundingClientRect() || {width: 0};
        let scrollLeft = navNodes?.current?.scrollLeft || 0;
        console.log(currentNav);
        if(direction == "left"){
            if(scrollLeft > 0 && moveLeftState && navNodes && navNodes.current){
                navNodes.current.scrollLeft = (Math.floor(currentNav) - 1) * 178;
            }
        }else if(direction == "right"){
            if(box.width + scrollLeft < inner.width - 5 && moveRightState && navNodes && navNodes.current){
                navNodes.current.scrollLeft = (Math.ceil(currentNav) + 1) * 178;
            }

        }
    }
    return <div className={style.templateNav}>
        <div className="templateNav">
            <div className="navTitle">
                <div className="titleIcon"></div>
                <h1>智能诊断</h1>
                <p>（共诊断<span className="allNodeNums">0</span>项，其中<span className="abnormalNodeNums">0</span>项异常）</p>
            </div>
            <div className="navCont">
                <div className={"moveBtn leftMoveButton " + (moveLeftState ? "" : "disabled")} onClick={moveLeft}></div>
                <div className="navNodes" ref={navNodes}>
                    <div className="templateNavBox" ref={templateNavBox}>
                        {nodeList.map((item: any, index: number) => {
                            return <div className={"templateNavItem " + (item.status == 2 ? "errorStatus" : "")} onClick={() => {updateScroll(index)}}>
                                        <div className="templateNavItemType">
                                            <span className="templateNavItemIndex">{index + 1}</span>
                                            <span className="templateNavItemTypeName">{item.branchType}</span>
                                        </div>
                                        <div className="templateNavCont">
                                            <div className="templateNavItemTitle">{item.componentName}</div>
                                            <div className="templateNavItemResult">{item.branchName}</div>
                                        </div>
                                    </div>
                        })}
                    </div>
                </div>
                <div className={"moveBtn rightMoveButton " + (moveRightState ? "" : "disabled")} onClick={moveRight}></div>
            </div>
        </div>
    </div>
})
