import {Modal, Button} from 'antd'
import {useState, forwardRef, useImperativeHandle, ForwardedRef, ReactNode} from "react";
import {isFunction} from "lodash-es";

interface CommonModalProps {
    title: string,
    width?: number,
    cancel?: string,
    ok?: string,
    onOk?: () => void,
    hideOk?: boolean,
    children: ReactNode
}

const CommonModal = forwardRef(({title, width = 900, cancel = '取消', ok = '确定', onOk, hideOk, children}:CommonModalProps, ref:ForwardedRef<any>) => {

    const [show, setShow] = useState(false)

    const handleOk = () => {
        setShow(false)
        onOk && onOk()
    }

    const btns = [
        <Button key={ok} style={{marginRight: 10}} type={'primary'} onClick={handleOk}>{ok}</Button>,
        <Button key={cancel} type={'primary'} ghost onClick={() => {
            setShow(false)
        }}>{cancel}</Button>,
    ]

    const footer = <div style={{textAlign: 'center'}}>
        {hideOk ? btns.slice(1, 2) : btns}
    </div>

    useImperativeHandle(ref, () => ({
        showModal(b:boolean) {
            setShow(b)
        }
    }))

    return <Modal
        className={'common-modal-wrap'}
        visible={show}
        onCancel={() => {
            setShow(false)
        }}
        title={title}
        width={width}
        maskClosable={false}
        destroyOnClose
        footer={footer}
    >
        {children}
    </Modal>
})

export default CommonModal
