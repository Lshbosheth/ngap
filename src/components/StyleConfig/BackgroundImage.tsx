import { Input } from 'antd';
import { useEffect, useState } from 'react';
import { Upload, Button } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { UploadOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const BackgroundImage = (props: any) => {
    const [value, setValue] = useState('');
    const [fileList, setFileList] = useState<any[]>([]); // 新增 fileList 状态

    useEffect(() => {
        if (props.value?.startsWith('url')) {

            const url = props.value.replace('url(', '').replace(')', '');
            setValue(url);
            // 如果有值，初始化 fileList
            if (url) {
                setFileList([
                    {
                        uid: '-1',
                        name: '背景图片',
                        status: 'done',
                        url: url,
                    }
                ]);
            }
        }
    }, []);
    const handleChange = (value: string) => {
        if (value === '') {
            setValue('');
            setFileList([]); // 清空 fileList
            props.onChange('');
            return;
        }
        if (value.startsWith('http')) {
            setValue(value);
            props.onChange(`url(${value})`);
        } else {
            setValue(`${value}`);
            props.onChange(value);
        }
    };
    const customRequest = (options: any) => {
        const { file, onSuccess } = options;

        request
            .upload('/csf/call/importOssByFile', 'fileupload', file, { type: 'image' })
            .then((res) => {
                onSuccess({ data: { url: res.bean.url } });

                handleChange(res.bean.url);
                setFileList([
                    {
                        uid: '-1',
                        name: file.name,
                        status: 'done',
                        url: res.bean.url,
                    }]);
                message.success('图片上传成功');
            })
            .catch((err) => { });
    };
    const onRemove = async () => {
        if (value) {
            try {
                await request.post('/csf/call/deleteOssByFile', {
                    params: {
                        url: value
                    }
                });
                setValue('');
                setFileList([]);
                props.onChange('');
                return true;
                message.success('图片删除成功');
            } catch (error) {
                console.error('删除 OSS 文件失败:', error);
                return false; // 返回 false 阻止删除
            }
        }
        // 清除背景图片
        setValue('');
        setFileList([]);
        props.onChange('');
        return true;
    };

    return (
        <Upload
            customRequest={customRequest}
            showUploadList={true}
            onRemove={onRemove}
            fileList={fileList} // 绑定 fileList
            beforeUpload={(file: any) => {
                if (!file.size) {
                    message.error('文件大小必须大于0KB');
                    return Upload.LIST_IGNORE;
                }
                const maxSize = 4 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    message.error('文件大小不能超过4MB');
                    return Upload.LIST_IGNORE;
                }
            }}

        >

            {fileList.length === 0 && (
                <Button icon={<UploadOutlined />}>上传背景图片</Button>
            )}
        </Upload>
    );
};

export default BackgroundImage;
