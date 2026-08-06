import { handleApi } from '@materials/utils/handleApi';
export const updateApiConfig = ({ api, apiOutData, editApiOutData }: { [key: string]: any }) => {
    return new Promise((resolve) => {
        !apiOutData && (apiOutData = {});
        let handleApiNum: number = 0;
        if(!api || api.length == 0){
            resolve(true)
        }
        (api || []).forEach((_api: any) => {
            if (_api.id && !apiOutData[_api.id]) {
                let id = _api.id;
                handleApiNum++;
                handleApi(
                    {
                        sourceType: 'api',
                        id: id,
                        source: '',
                        sourceField: {
                            type: 'variable',
                            value: 'Map',
                        },
                        params: _api.params,
                    },
                    {},
                ).then((res: any) => {
                    if (res?.code === 0) {
                        editApiOutData(id, res.data);
                        handleApiNum--;
                        if(handleApiNum == 0){
                            resolve(true);
                        }
                    }
                });
            }
        });
        // 超时处理
        setTimeout(() => {
            resolve(false);
        }, 6000)
    })
};
