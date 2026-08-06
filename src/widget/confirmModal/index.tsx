import { ExclamationCircleTwoTone } from "@ant-design/icons";
import { Button, Modal } from "antd";
import React, { ForwardedRef, forwardRef, useImperativeHandle, useState } from "react";

export interface ConfirmModalRef {
    showModal: (s: string) => void;
}

interface ConfirmModalProps {
    onConfirm: () => void;
}

const ConfirmModal = forwardRef(({ onConfirm }: ConfirmModalProps, ref: ForwardedRef<any>) => {

    const [visible, setVisible] = useState(false);
    const [pointOut, setPointOut] = useState<string | undefined>("");

    useImperativeHandle(ref, () => ({
        showModal(pointOut: string | undefined) {
            setPointOut(pointOut);
            setVisible(true);
        }
    }));

    return <Modal
        open={visible}
        closable={false}
        maskClosable={false}
        onCancel={() => setVisible(false)}
        width={420}
        footer={null} // 移除默认底部按钮
        destroyOnClose // 关闭时销毁子元素
    >
        <div style={{ marginTop: 36 }}>
            <div style={{ display: "inline-block", margin: "0px 20px 116px 15px" }}>
                <ExclamationCircleTwoTone twoToneColor="#FFAB00" style={{ fontSize: "48px" }} />
            </div>
            <div style={{ display: "inline-block", width: "calc(100% - 85px)", verticalAlign: "top" }}>
                <div style={{ fontSize: "16px", color: "#333333", fontWeight: "bold" }}>提示</div>
                <div style={{ fontSize: "13px", color: "#666666" }}>{pointOut}</div>
            </div>
        </div>
        <div
            style={{
                height: "60px",
                width: "420px",
                background: "#F9FAFC",
                position: "absolute",
                bottom: "0px",
                left: "0px",
                borderTop: "1px solid #D0D6D9",
                textAlign: "center",
                paddingTop: "10px"
            }}
        >
            <Button type="primary" onClick={() => { onConfirm(); setVisible(false); }}
                    style={{ marginRight: 17, width: "140px", height: "40px" }}>
                确定
            </Button>
            <Button onClick={() => setVisible(false)} style={{ width: "140px", height: "40px" }}>
                取消
            </Button>
        </div>
    </Modal>;
});

export default ConfirmModal;
