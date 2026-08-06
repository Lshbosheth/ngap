import React, { forwardRef, useImperativeHandle, useState, useEffect, memo } from 'react';
import { Button, message } from 'antd';
import { renderFormula } from '@materials/utils/util';
import * as icons from '@ant-design/icons';
import { useFormContext } from '@materials/utils/context';
import { execInterface } from '@materials/utils/apiUtilForInterface';

import { ComponentType } from '@materials/types';


/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    fileType: any;
    formWrap: { data: any };
    formItem: { interfaceId: any, fileName: string, fileContent: string };
    icon: string;
    text: any;
    authCode: string;
    authScript: string;
    elementAlias?: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const BownloadButton = ({ id, type, config, onClick, onSuccess, onfail,loopVariable }:any, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [loading, setLoading] = useState(false);
    const [btnTxt, setBtnTxt] = useState<string>('');
    const [mStyle, setMStyle] = useState<any>({});

    const getExtraParams = () => {
        const { data } = config.props.formWrap;
        const obj: { [key: string]: any } = {};
        if (data && data.length) {
            for (let d = 0; d < data.length; d++) {
                const info = data[d];
                const key = info.key;
                const type = info.value.type;
                const value = info.value.value;
                if (type === 'static') {
                    obj[key] = value;
                } else {
                    obj[key] = renderFormula(value, {}, loopVariable);
                }
            }
        }
        return obj;
    };

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            enable() {
                setDisabled(false);
            },
            disable() {
                setDisabled(true);
            },
            startLoading: () => {
                setLoading(true);
            },
            endLoading: () => {
                setLoading(false);
            },
            setStyle: (style: any) => {
                setMStyle(style);
            },
        };
    });
    const handleClick = () => {
            onClick?.();
            // console.log('=======', config.props);
            const { interfaceId, fileName, fileContent } = config.props.formItem;
            if(!interfaceId) {
                message.error('请配置接口地址');
                return;
            }
            const extraData = getExtraParams();
            const params: any = {
                ...extraData,
            };
            // console.log('=======', config.props, params);

            execInterface(interfaceId, params).then((res: any) => {
                if (res?.code === 0 || res?.code === '0' || res?.returnCode === '0' || res?.returnCode === 0) {
                    // console.log('res', res);

                    let fileNameField = 'bean__fileName';
                    if (fileName) {
                        fileNameField = 'bean__' + fileName
                    }
                    let fileContentField = 'bean__fileContent';
                    if (fileContent) {
                        fileContentField = 'bean__' + fileContent
                    }
                    const fileNameVal = res.bean[fileNameField];
                    const fileContentVal = res.bean[fileContentField];
                    // const { bean__fileName, bean__fileContent } = res.bean;
                    if (!fileNameVal || !fileContentVal?.length) {
                        alert('文件数据为空，无法下载');
                        return;
                    }
                    const mimeMap: Record<string, string> = {
                        'aac': 'audio/aac',
                        'abw': 'application/x-abiword',
                        'arc': 'application/x-freearc',
                        'avi': 'video/x-msvideo',
                        'azw': 'application/vnd.amazon.ebook',
                        'bin': 'application/octet-stream',
                        'bmp': 'image/bmp',
                        'bz': 'application/x-bzip',
                        'bz2': 'application/x-bzip2',
                        'csh': 'application/x-csh',
                        'css': 'text/css',
                        'csv': 'text/csv',
                        'doc': 'application/msword',
                        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'eot': 'application/vnd.ms-fontobject',
                        'epub': 'application/epub+zip',
                        'gif': 'image/gif',
                        'htm': 'text/html',
                        'html': 'text/html',
                        'ico': 'image/vnd.microsoft.icon',
                        'ics': 'text/calendar',
                        'jar': 'application/java-archive',
                        'jpeg': 'image/jpeg',
                        'jpg': 'image/jpeg',
                        'js': 'text/javascript',
                        'json': 'application/json',
                        'jsonld': 'application/ld+json',
                        'mid': 'audio/midi',
                        'midi': 'audio/midi',
                        'mjs': 'text/javascript',
                        'mp3': 'audio/mpeg',
                        'mpeg': 'video/mpeg',
                        'mpkg': 'application/vnd.apple.installer+xml',
                        'odp': 'application/vnd.oasis.opendocument.presentation',
                        'ods': 'application/vnd.oasis.opendocument.spreadsheet',
                        'odt': 'application/vnd.oasis.opendocument.text',
                        'oga': 'audio/ogg',
                        'ogv': 'video/ogg',
                        'ogx': 'application/ogg',
                        'otf': 'font/otf',
                        'png': 'image/png',
                        'pdf': 'application/pdf',
                        'ppt': 'application/vnd.ms-powerpoint',
                        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'rar': 'application/x-rar-compressed',
                        'rtf': 'application/rtf',
                        'sh': 'application/x-sh',
                        'svg': 'image/svg+xml',
                        'swf': 'application/x-shockwave-flash',
                        'tar': 'application/x-tar',
                        'tif': 'image/tiff',
                        'tiff': 'image/tiff',
                        'ttf': 'font/ttf',
                        'txt': 'text/plain',
                        'vsd': 'application/vnd.visio',
                        'wav': 'audio/wav',
                        'weba': 'audio/webm',
                        'webm': 'video/webm',
                        'webp': 'image/webp',
                        'woff': 'font/woff',
                        'woff2': 'font/woff2',
                        'xhtml': 'application/xhtml+xml',
                        'xls': 'application/vnd.ms-excel',
                        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'xml': 'application/xml',
                        'xul': 'application/vnd.mozilla.xul+xml',
                        'zip': 'application/zip',
                        '3gp': 'video/3gpp',
                        '3g2': 'video/3gpp2',
                        '7z': 'application/x-7z-compressed'
                    };

                    // const suffix = fileNameVal.slice(fileNameVal.lastIndexOf('.')).toLowerCase();
                    const suffix = fileNameVal.slice(fileNameVal.lastIndexOf('.') + 1);
                    const fileType = config.props.fileType
                        ? config.props.fileType
                        : (mimeMap as Record<string, string>)[suffix] ?? 'application/octet-stream';


                    let arr;

                  
                    try {
                        arr = JSON.parse(fileContentVal);
                    } catch (err) {
                        // alert("文件字节数据格式错误");
                        // return;
                        arr = fileContentVal
                    }

                    // 再校验是不是数组且非空
                    if (!Array.isArray(arr) || arr.length === 0) {
                        alert("文件数据为空");
                        return;
                    }

                    // 对齐Java有符号byte转Uint8Array
                    const uint8Arr = new Uint8Array(arr.length);
                    for (let i = 0; i < arr.length; i++) {
                        let num = arr[i];
                        // 和Java强转byte逻辑完全对齐：负数 + 256
                        uint8Arr[i] = num < 0 ? num + 256 : num;
                    }

                    // 后面正常生成Blob下载
                    const blob = new Blob([uint8Arr], { type: fileType });

                    const aEle = document.createElement('a');
                    aEle.href = URL.createObjectURL(blob);
                    aEle.download = fileNameVal;
                    aEle.style.display = 'none';

                    document.body.appendChild(aEle);
                    aEle.click();

                    document.body.removeChild(aEle);
                    URL.revokeObjectURL(aEle.href);
                    onSuccess?.(res)
                } else {
                    // alert('下载失败');
                    onfail?.(res)
                }
            });

        
    };


    // 初始化默认值
    useEffect(() => {
        const titleVal = typeof config.props.text === 'string' ? config.props.text : config.props.text?.value;
        setBtnTxt(titleVal);
    }, [config.props.text]);
    const iconsList: { [key: string]: any } = icons;
    const { authCode, authScript, ...props } = config.props;
    return (
        visible && (
            <Button
                style={{ ...config.style, ...mStyle }}
                loading={loading}
                disabled={disabled}
                {...props}
                icon={props.icon ? React.createElement(iconsList[props.icon]) : null}
                data-id={id}
                data-type={type}
                onClick={handleClick}
            >
                {btnTxt}
            </Button>
        )
    );
};
export default memo(forwardRef(BownloadButton));
