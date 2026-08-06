import { ComponentType } from './../../types';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import defaultPng from './defaultFileIcon.png'; // 使用相对路径
import wordPng from './wordIcon.png';
import pdfPng from './pdfIcon.png';
import txtPng from './txtIcon.png';
import excelPng from './excelIcon.png';

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    icon: string;
    text: string;
    authCode: string;
    authScript: string;
}

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MFile = ({ id, type, config }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });

    const { ...props } = config.props;
    console.log(props);

    const filePng = defaultPng;
    // if (props.filelist.length) {
    //     if (props.filelist[0].indexOf('.txt') !== - 1) {
    //         filePng = txtPng
    //     } else if (props.filelist[0].indexOf('.pdf') !== - 1) {
    //         filePng = pdfPng
    //     } else if (props.filelist[0].indexOf('.xlsx') !== - 1) {
    //         filePng = excelPng
    //     } else if (props.filelist[0].indexOf('.doc') !== - 1) {
    //         filePng = wordPng
    //     } else if (props.filelist[0].indexOf('.png') !== - 1) {
    //         filePng = wordPng
    //     }
    // } else {
    //     filePng = defaultPng
    // }

    return (
        visible && (
            <div data-id={id} data-type={type} {...props} className="fileDiv" style={{...config.style,...mStyle}}>
                {props.fileshowtype === 'icon' ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <img src={filePng} alt="" style={{ width: '100%' }} />
                        <div style={{ width: '100%' }}>{props.filename}</div>
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '100%' }}>{props.filename}</div>
                )}
            </div>
        )
    );
};
export default forwardRef(MFile);
