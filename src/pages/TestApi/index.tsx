import React, { useEffect, useRef, useState } from 'react';
import { Input, Button } from 'antd';
import getFieldFromAPI from '@/utils/apiUtilForInterface';
import type { InputRef } from 'antd';

const Page: React.FC = () => {
    // 获取用户信息
    // const userInfo = crossApiUserInfo((state) => state.userInfo);
    const input = useRef<InputRef>(null);

    const clickHandle = () => {
        const id = input.current?.input?.value || '';
        getFieldFromAPI(id, '', { name: '123' }).then((data) => {
            console.log(data);
        });
    };
    return (
        <div>
            <Input ref={input} type="text" />
            <Button onClick={clickHandle}>调用</Button>
        </div>
    );
};
export default Page;
