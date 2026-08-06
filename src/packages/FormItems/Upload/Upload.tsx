import { ComponentType } from './../../types';
import { isNotEmpty } from './../../utils/util';
import { Form, FormItemProps, FormInstance, Upload, Button, UploadFile } from "antd";
import { message } from '@/utils/AntdGlobal';
import { useEffect, useState, useImperativeHandle, forwardRef, useRef, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFormContext } from './../../utils/context';
import request from './../../../utils/request';
import { execInterface } from '../../../utils/apiUtilForInterface';
import { UseMaterialTools } from '../../utils/useMaterialTools';
import { useAppContext } from './../../../utils/AppProvider';
import { formatSize, isEmpty } from "@/utils/util";
import {PaperClipOutlined} from "@ant-design/icons";

export interface IConfig {
    defaultValue: string;
    startField: string;
    endField: string;
    formItem: FormItemProps;
    formWrap: any;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MUpload = ({ id, type, config, onChange, onRemove }: ComponentType & { form: FormInstance }, ref: any) => {
    const { initValues, form, fromId } = useFormContext();
    const _state = useAppContext();
    const { pageStore } = _state;
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState(config.props.formWrap.disabled);
    const [fileList, setFileList] = useState<any[]>([]);
    const formItemWrapperRef = useRef<HTMLDivElement>(null);
    const [mStyle,setMStyle] = useState<any>({})
    const allFiles = useRef<{[key:string]: any}>({});
    const materialTools = UseMaterialTools();

    const [error,setError] = useState<string>('')

    const setFormData = pageStore(useShallow((state: any) => state.setFormData));

    // 启用和禁用
    useEffect(() => {
        setDisabled(config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);

useEffect(() => {
  const wrapper = formItemWrapperRef.current;
  if (!wrapper) return;

  const firstDiv = wrapper.querySelector<HTMLDivElement>('div:first-child');
  if (!firstDiv) return;

  const childDiv = firstDiv.querySelector<HTMLDivElement>('div:first-child');
  if (!childDiv) return;

  const height = config?.style?.height;
  childDiv.style.height = height ? String(height) : '';
}, [config?.style?.height]);

// useEffect(() => {
//   const wrap = formItemWrapperRef.current;
//   const label = wrap?.querySelector<HTMLLabelElement>('label');
//   const s = config?.style;

//   if (!label || !s) return;

//   Object.entries(s).forEach(([k, v]) => {
//     if (v != null) label.style[k as any] = String(v);
//   });
// }, [config?.style]);
useEffect(() => {
  const wrap = formItemWrapperRef.current;
  if (!wrap) return;

  const elements = wrap.querySelectorAll<HTMLButtonElement | HTMLDivElement>('button, .ant-upload-list');
  const style = config?.style;

  if (!elements.length || !style) return;

  elements.forEach(el => {
    if (style.color) el.style.color = String(style.color);
    if (style.fontSize) el.style.fontSize = String(style.fontSize);
  });
}, [config?.style]);

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if(Array.isArray(value)) {
            initValues(type, name, value);
        }
    }, [config.props.defaultValue]);

// useEffect(() => {
//   const wrap = formItemWrapperRef.current;
//   if (!wrap) return;

//   const elements = wrap.querySelectorAll('button, .ant-upload-list');
//   const style = config?.style;

//   if (!elements.length || !style) return;

//   elements.forEach(el => {
//     if (style.color) el.style.color = String(style.color);
//     if (style.fontSize) el.style.fontSize = String(style.fontSize);
//   });
// }, [config?.style]);
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
            setStyle:(style:any)=>{
                setMStyle(style)
            },
            getFileList: () => {
                return fileList;
            },
            update: ({ fileList }: {fileList: any}) => {
                // 更新数据
                if(typeof fileList === 'string') {
                    try {
                        const values = JSON.parse(fileList);
                        if(Array.isArray(values)) {
                            setUploadFormData(values)
                        } else {
                            console.error('上传组件更新数据传入的参数格式不对，应为数组')
                            return ;
                        }
                    } catch (error) {
                        console.error('上传组件更新数据传入的参数格式不对，应为数组')
                        return ;
                    }
                } else {
                    if(Array.isArray(fileList)) {
                        setUploadFormData(fileList)
                    } else {
                        console.error('上传组件更新数据传入的参数格式不对，应为数组')
                        return ;
                    }
                }
            }
        };
    });

    // 自定义上传
    // const customRequest = async (options: any) => {
    //     const { file, onSuccess, onError } = options;
    //     // const fileParam = file.name;
    //     const extraData = {
    //         // paramName: 'filesUpload',
    //     };
    //     try {
    //         const {isInterface, uploadurl, interfaceId} = config.props.formItem;
    //         if(isInterface) {
    //             // 使用编排接口
    //         } else {
    //             const res: any = await request.upload(
    //                 config.props.formItem.uploadurl,
    //                 config.props.formWrap.name,
    //                 file,
    //                 extraData,
    //                 {
    //                     showLoading: true,
    //                     onUploadProgress: (e: any) => {
    //                         // 可绑定到进度条组件
    //                     },
    //                 },
    //             );
    //             if (res?.code === 0 || res?.code === '0') {
    //                 onSuccess(res);
    //                 setFileList((prev: any[]) => [file, ...prev]);
    //             } else {
    //                 onError(new Error(res?.msg || res?.message || '上传失败'));
    //             }
    //         }
    //     } catch (err: any) {
    //         onError(err);
    //     }
    // };

    const getExtraParams = () => {
        const {data} = config.props.formWrap;
        const obj: {[key:string]: any} = {};
        if(data && data.length) {
            for (let d = 0; d < data.length; d++) {
                const info = data[d];
                const key = info.key;
                const type = info.value.type
                const value = info.value.value;
                if(type === 'static') {
                    obj[key] = value;
                } else {
                    obj[key] = materialTools.renderFormula(value, {}, true);
                }
            }
        }
        return obj
    }

    const getValueFromEvent = (e: any) => {
        console.log('Upload event:', e)
        if(e?.file) {
            const status = e.file.status
            if(status === "removed") {
                return fileList.filter((file) => {
                    return (file.status === 'done' || !file.status) && (file.uid !== e.file.uid)
                })
            }
        }
        return fileList.filter((file) => {
            return file.status === 'done' || !file.status
        })

    }

    /**
     * 设置表单的值
     * @param dataList
     */
    const setUploadFormData = function (dataList: any) {
        setFileList(dataList);
        const {name} = config.props.formItem;
        form?.setFieldValue(name, dataList)
        setFormData({
            name: fromId,
            value: { [name]: dataList },
        })
    }

    // 监听form表单的赋值
    if (form) {
        const {name} = config.props.formItem;
        const values = Form.useWatch(name, form);
        useEffect(() => {
            setFileList(values || []);
            if(values) {
                const obj: {[key:string]: any} = {};
                for (let v = 0; v < values.length; v++) {
                    const val = values[v];
                    obj[val.uid] = val;
                }
                allFiles.current = obj;
            } else {
                allFiles.current = {};
            }
        }, [values]);
    }

    const showError = (err:string)=>{
        setError(err)
        message.error(err)
    }

    const uploadPorps = useMemo(() => {
        const acceptTypes = (config.props.formWrap?.accept || []).map((t: string) => t.toLowerCase().replace('.', ''));
        const acceptStr = acceptTypes.join(',');


        const getRequestOptions = (onProgress: any, file: any) => ({
            showLoading: true,
            onUploadProgress: (e: any) => {
                console.log("qqqqqqqqqqqqqqq onUploadProgress", e);
                // 可绑定到进度条组件
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress({ percent }, file);
            }
        });

        return {
            multiple: config.props.formItem.multiple,
            ...config.props.formWrap,
            accept: acceptStr,
            showUploadList: {
                extra:(file:UploadFile)=>{
                    const size = formatSize(file?.size)
                    return <span>&nbsp;({size})</span>
                }
            },
            beforeUpload: (file: any) => {
                const  {nameLength, accept, fileSize, multiple, maxCount} = config.props.formWrap;
                const keys = Object.keys(allFiles.current);
                if(multiple && keys.length === maxCount) {
                    showError(`已达到配置的限制上传的文件数量 ${maxCount} `);
                    return false;
                }
                if(nameLength) {
                    const name = file.name;
                    if(name && name.split('.')[0]?.length > nameLength) {
                        showError(`超过了配置的文件名称字数限制 ${nameLength} `);
                        return false;
                    }
                }
                if(fileSize) {
                    const size = file.size;
                    if(size > fileSize * 1024 * 1024) {
                        showError(`超过了单个附件上传的最大限制 ${fileSize} M`);
                        return false;
                    }
                }
                if (acceptTypes.length) {
                    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
                    if (!acceptTypes.includes(fileExt)) {
                        showError(`仅支持上传 ${accept?.join('、')} 格式的文件`);
                        return false;
                    }
                }
                return true;
            },
            onRemove: (file: any) => {
                const newFileList = fileList.filter((f) => f.uid !== file.uid);
                setUploadFormData(newFileList)
                delete allFiles.current[file.uid]
                // 如果绑定删除事件，则执行删除
                onRemove && onRemove(file);
            },
            customRequest: (options: any) => {
                const { file, onSuccess, onError ,onProgress} = options;
                const extraData = getExtraParams()
                try {
                    const {isInterface, uploadurl, interfaceId} = config.props.formItem;
                    const { multiple, maxCount } = config.props.formWrap;
                    // 使用编排接口
                    if(isInterface) {
                        if(!interfaceId) {
                            showError('请选择接口');
                            return;
                        }
                        const reader = new FileReader();
                        // 读取完成回调
                        reader.onload =  (event: any) => {
                            // ArrayBuffer 转 Uint8Array
                            const arrayBuf = event.target.result;
                            const uint8Arr = new Uint8Array(arrayBuf);

                            const byteArr = Array.from(uint8Arr);
                            const params: any = {
                                [config.props.formWrap.name]: byteArr,
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type,
                                ...extraData
                            };
                            execInterface(interfaceId, params,getRequestOptions(onProgress,file)).then((res: any)=>{
                                if (res?.returnCode === 0 || res?.returnCode === '0') {
                                    onSuccess(res);
                                    setError('')
                                    const obj = {
                                        name: file.name,
                                        uid: file.uid,
                                        size:file.size,
                                        ...res.bean
                                    }
                                    if(multiple) {
                                        const keys = Object.keys(allFiles.current);
                                        if(keys.length < maxCount) {
                                            allFiles.current[obj.uid] = obj;
                                            const newList = [];
                                            for (const k in allFiles.current) {
                                                if (Object.prototype.hasOwnProperty.call(allFiles.current, k)) {
                                                    const fileInfo = allFiles.current[k];
                                                    newList.push(fileInfo)
                                                }
                                            }
                                            setUploadFormData(newList)
                                        }
                                    } else {
                                        setUploadFormData([obj])
                                        allFiles.current = {[obj.uid]: obj};
                                    }
                                } else {
                                    showError(res?.msg || res?.message || res?.returnMessage || '上传失败');
                                    onError(new Error(res?.msg || res?.message || res?.returnMessage || '上传失败'));
                                }
                            })
                        };

                        // 以二进制方式读取文件
                        reader.readAsArrayBuffer(file);
                    } else {
                        if(!uploadurl) {
                            showError('请输入上传地址');
                            return;
                        }
                        request.upload(
                            uploadurl,
                            config.props.formWrap.name,
                            file,
                            extraData,
                            getRequestOptions(onProgress,file),
                        ).then((res)=>{
                            if (res?.returnCode === 0 || res?.returnCode === '0') {
                                onSuccess(res);
                                setError('')
                                const obj = {
                                    name: file.name,
                                    uid: file.uid,
                                    size:file.size,
                                    ...res.bean
                                }
                                if(multiple) {
                                    const keys = Object.keys(allFiles.current);
                                    if(keys.length < maxCount) {
                                        allFiles.current[obj.uid] = obj;
                                        const newList = [];
                                        for (const k in allFiles.current) {
                                            if (Object.prototype.hasOwnProperty.call(allFiles.current, k)) {
                                                const fileInfo = allFiles.current[k];
                                                newList.push(fileInfo)
                                            }
                                        }
                                        setUploadFormData(newList)
                                    }
                                } else {
                                    setUploadFormData([obj])
                                    allFiles.current = {[obj.uid]: obj};
                                }
                            } else {
                                showError(res?.msg || res?.message || res?.returnMessage || '上传失败');
                                onError(new Error(res?.msg || res?.message || res?.returnMessage || '上传失败'));
                            }
                        }).catch((err)=>{
                            onError(new Error(err));
                        });
                    }
                } catch (err: any) {
                    onError(err);
                }
            },
            onChange: (file: any, upFileList: any, event: any) => {
                // const status = file.status;  //  beforeUpload 拦截的文件没有 status 状态属性
                // if(status === 'done') {
                //     // 上传完成
                //     setFileList([...upFileList, ...fileList])
                // } else if(status === "uploading") {
                //     setFileList([...upFileList, ...fileList])
                //     message.info('上传中......')
                // }
                onChange && onChange(file);
            }
        };
    }, [config.props]);

    const errStyle = useMemo(() => {
        return { color:'#f65a56' };
    }, []);

    const uploadStyle = useMemo(() => {
        return {color:config.props.formWrap.disabled?'#bbbbbb':'#0085de',marginTop:5}
    }, []);

    const descStyle = useMemo(() => {
        return {color:'#bbbbbb'}
    }, []);

    const getDesc = ()=>{
        const {accept,fileSize} = config.props.formWrap
        return `${!isEmpty(accept)?`支持${accept.join('、')}文件格式`:''}${(!isEmpty(accept) && fileSize) ?'，':``}${fileSize ?`文件大小不超过${fileSize}M`:''}`
    }
    return (
        visible && (
            <div
            ref={formItemWrapperRef}
            style={{...config.style,...mStyle}}
            >
            <Form.Item
            {...config.props.formItem} disabled={disabled} data-id={id} data-type={type}
            valuePropName="fileList"
            getValueProps={(value) => {
                // 这里可以对从表单获取的值进行转换
                return {
                    fileList: value || fileList
                }
            }}
            extra={error && <div style={errStyle}>{error}</div>}
            getValueFromEvent={getValueFromEvent}
             >
                <Upload  {...uploadPorps}>
                    <div>
                        <div style={uploadStyle}>
                            <PaperClipOutlined/>&nbsp;
                            <span>{config.props.formItem.btnVal}</span>
                        </div>
                        <div style={descStyle}>{getDesc()}</div>
                    </div>
                </Upload>
            </Form.Item>
            </div>
        )
    );
};
export default forwardRef(MUpload);
