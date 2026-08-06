import {getValue, isEmpty} from "@/utils/util";
import {evaluateIndicatorArr, ItemProps, RESULT_ARR} from "@/pages/evaluateRecord/params";
import CommonModal from "@/widget/commonModal/index";
import {ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import request from "@/utils/request";
import './index.less'

interface CommonModalRef {
    showModal: (v: boolean) => void
}

interface DependModalProps{
    currentItem:ItemProps | null | undefined
}

export interface DependModalRef {
    showModal: () => void
}

const DependModal = forwardRef(({currentItem}:DependModalProps, ref:ForwardedRef<any>) => {
    const modalRef = useRef<CommonModalRef>()
    const [conditions, setConditions] = useState([])

    useEffect(() => {
        fetchConditions()
    }, [currentItem])

    const fetchConditions = async () => {
        if (isEmpty(currentItem)){
            return
        }
        const params = {evaluateId: currentItem?.evaluateId}
        const resp = await request.post('appEvaluate/queryAppEvaluateConditionInfo', {params})
        setConditions(resp.beans || [])
    }

    useImperativeHandle(ref, () => ({
        showModal() {
            modalRef?.current?.showModal(true)
        }
    }))

    const getRange = (currentItem:any)=>{
        return `${currentItem?.startTime || ''}-${currentItem?.endTime || ''}`
    }

    const getEvaluateTarget = (item: any) => {
        let value = getValue('evaluateTarget', item)
        if (value === '-') {
            return value
        }
        const temp = value.split(',')?.map((i:any)=>evaluateIndicatorArr.find((e:any)=>e.value === i)?.title)
        if (isEmpty(temp)){
            return '-'
        }
        return temp.join(',')
    }

    return <CommonModal title={'评估依据详情'} width={1000} cancel={'关闭'} ref={modalRef} hideOk>
        <div className={'evaluate-record-modal-content'}>
            <div className={'evaluate-record-modal-content-row'}>
                <div className={'evaluate-record-modal-content-col'}>
                    应用名称:&nbsp;&nbsp;{getValue('appNm', currentItem)}
                </div>
                <div className={'evaluate-record-modal-content-col'}>
                    评估人:&nbsp;&nbsp;{getValue('evaluateStaffNm', currentItem)}
                </div>
                <div className={'evaluate-record-modal-content-col'}>
                    评估工号:&nbsp;&nbsp;{getValue('evaluateStaffId', currentItem)}
                </div>
            </div>
            <div className={'evaluate-record-modal-content-row'}>
                <div className={'evaluate-record-modal-content-col'}>
                    评估周期:&nbsp;&nbsp;<span title={getRange(currentItem)}>{getRange(currentItem)}</span>
                </div>
                <div className={'evaluate-record-modal-content-col'}>
                    评估结论:&nbsp;&nbsp;{RESULT_ARR.find(item => item.value === currentItem?.evaluateRes)?.title}
                </div>
                <div className={'evaluate-record-modal-content-col'}>
                    结论说明:&nbsp;&nbsp;<span title={getValue('resDesc', currentItem)}>{getValue('resDesc', currentItem)}</span>
                </div>
            </div>

            {conditions.map(item =>
                <div className={'evaluate-record-modal-content-card'}>
                    <div className={'evaluate-record-modal-content-card-row'}>评估维度:<span
                        className={'evaluate-record-modal-content-card-content'}>{getValue('dimensionNm', item)}</span>
                    </div>
                    <div className={'evaluate-record-modal-content-card-row'}>评估指标:<span
                        className={'evaluate-record-modal-content-card-content'}>{getEvaluateTarget(item)}</span>
                    </div>
                    <div className={'evaluate-record-modal-content-card-row'}>指标数据:<span
                        className={'evaluate-record-modal-content-card-content'}>{getValue('targetData', item)}</span>
                    </div>
                    <div className={'evaluate-record-modal-content-card-row'}>评估说明:<span
                        className={'evaluate-record-modal-content-card-content'} title={getValue('customizeDesc', item)}>{getValue('customizeDesc', item)}</span>
                    </div>
                </div>)}

        </div>
    </CommonModal>
})
export default DependModal
