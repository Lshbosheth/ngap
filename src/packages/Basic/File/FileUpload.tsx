import { Form, Upload, Button, FormInstance } from 'antd';
import { message } from '@/utils/AntdGlobal';
import request from './../../../utils/request';
import { useState } from 'react';

/**
 * 自定义渲染
 */
export default function FileUpload({ label, name, form }: { label: string; name: string | string[]; form: FormInstance }) {
    const [visible, setVisible] = useState('1');
    const [fileList, setFileList] = useState<any>([]);

    // 允许的文件类型
    const allowedFileTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/pdf'];
    
    // 文件大小限制为4MB
    const MAX_FILE_SIZE = 4 * 1024 * 1024;

    // 验证文件
    const validateFile = (file: File) => {
        // 验证文件大小
        if (file.size > MAX_FILE_SIZE) {
            message.error('文件大小不能超过4MB');
            return false;
        }

        // 验证文件类型
        const fileName = file.name.toLowerCase();
        const isAllowedType = allowedFileTypes.includes(file.type) ||
                             fileName.endsWith('.doc') ||
                             fileName.endsWith('.docx') ||
                             fileName.endsWith('.xls') ||
                             fileName.endsWith('.pdf');
        
        if (!isAllowedType) {
            message.error('只支持上传 doc、docx、xls、pdf 类型的文件');
            return false;
        }

        return true;
    };

    const customRequest = async (options: any) => {
        const { file, onSuccess, onError } = options;
        console.log(file);
        const fileParam = file.name;
        const extraData = {
            paramName: 'filesUpload',
        };
        try {
            // 上传
            request.upload('/csf/call/importOssByFile', 'fileupload', file, { type: 'source' }, 
                {
                    showLoading: true,
                    // 支持进度监控（纯Base64上传无此功能）
                    onUploadProgress: (e) => {
                        const progress = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
                        // 可绑定到进度条组件：setProgress(progress)
                    },
                },
            ).then((res) => {
                onSuccess(res);
            setFileList([file]);
                message.success('文件上传成功');
            })
            .catch((err) => {});
        } catch (err) {
            onError(err);
            // 模拟上传成功修改已上传文件列表
            setFileList([file]);
            form.setFieldValue('filenametest', file.name);
            form.setFieldValue('filelist', [file.name]);
        }
    };

    return (
        <>
            <Form.Item label={label} name={name}>
                <Upload
                    accept=".doc,.docx,.xls,.pdf"
                    customRequest={customRequest}
                    fileList={fileList}
                    beforeUpload={validateFile}
                >
                    <Button>{fileList.length ? '重新上传' : '上传附件'}</Button>
                </Upload>
                <div>上传附件大小限制为4M，支持上传doc、docx、xls、pdf类型文件</div>
            </Form.Item>
        </>
    );
}
