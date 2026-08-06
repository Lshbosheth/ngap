import {useRef, useState} from "react";
import CommonList, {CommonListRef} from "@/widget/commonList/index";
import {getColumns, FILTER_OPTS, RESULT_ARR, ItemProps} from "@/pages/evaluateRecord/params";
import CommonModal from "@/widget/commonModal/index";
import './index.less'
import request from '@/utils/request';
import {getValue} from "@/utils/util";
import DependModal, {DependModalRef} from "@/pages/evaluateRecord/DependModal";

interface EvaluateRecordProps {
    initialParams?: { id: string }
}


const EvaluateRecord = ({initialParams}: EvaluateRecordProps) => {

    const modalRef = useRef<DependModalRef>()

    const listRef = useRef<CommonListRef>()
    const [currentItem, setCurrentItem] = useState<ItemProps | null>()

    const setShowModal = function (record: ItemProps) {
        setCurrentItem(record)
        modalRef?.current?.showModal()
    }

    const onExport = ()=>{
        try {
            const params = {...listRef.current?.getParams(),appId: initialParams?.id}
            delete params.start
            delete params.limit
            request.download('/appEvaluate/downAppEvaluateList', {params})
        } catch (e) {
            console.error(e)
        }
    }

    const btns = [
        {label:'导出',onClick:onExport,ghost:true}
    ]

    return <div className={'evaluate-record-wrap'}>
        <CommonList filterOpts={FILTER_OPTS} columns={getColumns(setShowModal)} extraParams={{appId: initialParams?.id}}
                    url={'/appEvaluate/queryAppEvaluateList'} lineCount={3} btns={btns} ref={listRef}/>

        <DependModal currentItem={currentItem} ref={modalRef}/>
    </div>

}

export default EvaluateRecord
