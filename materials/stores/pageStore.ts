import { create } from 'zustand';
import { produce } from 'immer';
import { ComponentType, ApiType, PageVariable, EventType, ComItemType } from './../types';

export interface UserInfoStore {
    //坐席账号
    staffId: string;
    staffName: string;
    //业务系统
    serviceTypeId: string;
    selfServiceTypeId: string;
    initServiceTypeId: string;
    //省份编码
    provinceId: string;
    selfProvCode: string;
    destProvId: string;
    sysNo: string;
    //灰度线路
    cmos_vision: string;
    //部门组织机构
    deptId: string;
    deptName: string;
    orgaCode: string;
    orgaName: string;
}

export interface PageState {
    appSequenceId: string;
    appPageId: string;
    userInfo: UserInfoStore;
    page: {
        id: number;
        name: string;
        remark: string;
        projectId: number;
        stgState: 1 | 2 | 3 | 4; // 1:未保存 2:已保存 3:已发布 4:已回滚
        preState: 1 | 2 | 3 | 4; // 1:未保存 2:已保存 3:已发布 4:已回滚
        prdState: 1 | 2 | 3 | 4; // 1:未保存 2:已保存 3:已发布 4:已回滚
        stgPublishId: number;
        prePublishId: number;
        prdPublishId: number;
        previewImg?: string;
        userId: number;
        refreshPageEvent: string;
        userName: string;
        relationId: string;
        belongVersion: string;
        provId: string;
        appLevel: string;
        pageData: {
            // 页面配置数据
            config: {
                props: any;
                // 页面综合样式(scopeCss + scopeStyle)
                style: React.CSSProperties;
                scopeCss: string;
                scopeStyle: React.CSSProperties;
                events: EventType[];
                api: {
                    sourceType: 'json' | 'api';
                    id: string;
                    source: any;
                    sourceField: string | { type: 'variable' | 'static'; value: string };
                };
            };
            events: Array<{ name: string; value: string }>;
            // 页面全局接口
            apis: { [key: string]: ApiType };
            apisGlobal: { [key: string]: ApiType }[];
            apiOutParam: { [key: string]: ApiType };
            apiOutData: { [key: string]: ApiType };
            apiVariables: { [key: string]: any }[];
            crossApisGlobal: { [key: string]: ApiType }[];
            elements: ComItemType[];
            elementsMap: { [key: string]: ComponentType };
            // 页面变量
            variables: PageVariable[];
            variableData: { [key: string]: any };
            // 表单数据
            formData: { [key: string]: any };
            // 循环变量数据
            forEachVariables: { [componentId: string]: any };
            defaultValueInvalidMap: { [key: string]: any };
            // 全局拦截器
            interceptor: {
                headers?: {
                    key: string;
                    value: string;
                }[];
                timeout: number;
                timeoutErrorMessage: string;
                requestInterceptor?: string;
                responseInterceptor?: string;
            };
        };
    };
}
export interface PageAction {
  setRefreshPageEvent: (state: string) => void;
  saveAppSequenceId: (appSequenceId: string) => void;
  saveAppPageId: (appPageId: string) => void;
  saveUserInfo: (userInfo: UserInfoStore) => void;
  savePageInfo: (pageInfo: any) => void;
  setVariableData: (payload: any) => void;
  setFormData: (payload: any) => void;
  updateApiGlobal: (payload: any) => void;
  clearPageInfo: () => void;
  addApiOutParam: (id: string, payload: any, apiList: any) => void;
  editApiOutData: (apiId: any, apiOutData: any) => void;
  addBussinessElement: (pageData: any) => void;
  editVariable: (payload: PageVariable) => void;
  addVariable: (payload: PageVariable) => void;
  setForEachVariable: (componentId: string, value: any) => void;
  setDefaultValueInvalidMap: (key: string) => void;
}
export const usePageStore = create<PageState & PageAction>((set) => ({
  appSequenceId: "",
  appPageId: "",
  userInfo: {
    //坐席账号
    staffId: '',
    staffName: '',
    //业务系统
    serviceTypeId: '',
    selfServiceTypeId: '',
    initServiceTypeId: '',
    //省份编码
    provinceId: '',
    selfProvCode: '',
    destProvId: '',
    sysNo: '',
    //灰度线路
    cmos_vision: '',
    //部门组织机构
    deptId: '',
    deptName: '',
    orgaCode: '',
    orgaName: '',
    toolsStaffSelfServiceTypeId: '',
    addressFlag: '',
    ngapIsHttps: window?.location?.protocol === 'https' ? true : false,
  },
  selectedElement: undefined,
  page: {
    id: 0,
    name: '',
    remark: '',
    projectId: 0,
    userId: 0,
    userName: '',
    previewImg: '',
    stgState: 1,
    preState: 1,
    prdState: 1,
    stgPublishId: 0,
    prePublishId: 0,
    prdPublishId: 0,
    refreshPageEvent: "",
    relationId: '',
    belongVersion: '',
    provId: '',
    appLevel: '',
    pageData: {
      config: {
        props: {},
        style: {},
        scopeCss: '',
        scopeStyle: {},
        events: [],
        api: {
          sourceType: 'json',
          id: '',
          source: {},
          sourceField: '',
        },
      },
      events: [],
      // 页面全局接口
      apis: {},
      apisGlobal: [],
      apiOutParam: {},
      apiOutData: {},
      apiVariables: [],
      crossApisGlobal: [],
      elements: [],
      elementsMap: {},
      // 页面变量定义列表
      variables: [],
      // 页面变量数据
      variableData: {},
      // 表单数据
      formData: {},
      // 循环变量数据
      forEachVariables: {},
      defaultValueInvalidMap: {},
      // 全局拦截器
      interceptor: {
        headers: [{ key: '', value: '' }],
        timeout: 8,
        timeoutErrorMessage: '请求超时，请稍后再试',
      },
    },
  },
  setDefaultValueInvalidMap: (key: string) => {
      set(
          produce((state) => {
              if(!state.page.pageData.defaultValueInvalidMap) state.page.pageData.defaultValueInvalidMap = {};
              state.page.pageData.defaultValueInvalidMap[key] = true;
          })
      )
  },
  setRefreshPageEvent(refreshPageEvent: string) {
      set(
          produce((state) => {
              state.page.refreshPageEvent = refreshPageEvent
          })
      )
  },
  // 添加业务组件
  addBussinessElement: (element: any) => {
      set(
          produce((state) => {
              state.page.pageData.elements.push(...element.elements);
              for (let key in element.elementsMap) {
                  state.page.pageData.elementsMap[key] = element.elementsMap[key];
              }
              for (let key in element.formData) {
                  state.page.pageData.formData[key] = element.formData[key];
              }
          }),
      );
  },
  saveAppSequenceId: (appSequenceId: string) =>
    set(
      produce((state) => {
        state.appSequenceId = appSequenceId;
      }),
    ),
  saveAppPageId: (appPageId: string) =>
    set(
      produce((state) => {
        state.appPageId = appPageId;
      }),
    ),
  saveUserInfo: (userInfo: UserInfoStore) =>
    set(
      produce((state) => {
        state.userInfo = userInfo;
      }),
    ),
  // 保存页面信息
  savePageInfo: (payload: any) =>
    set(
      produce((state) => {
        state.page = Object.assign(state.page, payload);
      }),
    ),
  setVariableData({ name, value }: any) {
    set(
      produce((state) => {
        if (!state?.page?.pageData?.variableData) {
            if (!state?.page?.pageData) {
                if (!state?.page) state.page = {};
                state.page.pageData = {};
            }
            if (!state.page?.pageData) state.page.pageData = {};
            state.page.pageData.variableData = {};
        }
        state.page.pageData.variableData[name] = value;
      }),
    );
  },
  setFormData({ name, value, type }: any) {
    set(
      produce((state) => {
        if (!state?.page?.pageData?.formData) {
            if (!state?.page?.pageData) {
                if (!state?.page) state.page = {};
                state.page.pageData = {};
            }
            if (!state.page?.pageData) state.page.pageData = {};
            state.page.pageData.formData = {};
        }
        if (type === 'override') {
          state.page.pageData.formData[name] = value;
        } else {
          state.page.pageData.formData[name] = { ...state.page.pageData.formData[name], ...value };
        }
      }),
    );
  },
  addApiOutParam: (id: string, outParam?: any, apiList?: any) => {
    set(
      produce((state) => {
        if (!state.page?.pageData?.apiOutParam) {
            if (!state.page?.pageData) state.page.pageData = {};
          state.page.pageData.apiOutParam = {};
        }
        state.page.pageData.apiOutParam[id] = outParam;
        let flag = true;
        if (!state.page?.pageData?.apiVariables) {
                    if (!state.page?.pageData) state.page.pageData = {};
                    state.page.pageData.apiVariables = [];
                }
        for (let i = 0; i < state.page.pageData.apiVariables.length; i++) {
          if (state.page.pageData.apiVariables[i].id == id) {
            flag = false;
          }
        }
        if (flag) {
          let api: any = {};
          for (let i = 0; i < apiList.length; i++) {
            api = apiList[i].children.filter((item: any) => item.value == id);
            if (api.length > 0) {
              break;
            }
          }
          if (api && api.length > 0) {
            const _n: any = {
              name: api[0].label,
              type: "api",
              id: id,
              elements: [],
            }
            outParam.forEach((_api: any) => {
              _n.elements.push({
                name: _api.name,
                type: "apiOutParam",
                id: `id_${api[0].interfaceId}.${_api.value}`,
                elements: []
              })
            })
            const apiVariables = state.page.pageData.apiVariables;
            apiVariables.push(_n);
            state.page.pageData.apiVariables = apiVariables;
          }
        }
      }),
    );
  },
  // 添加变量
  addVariable(payload: PageVariable) {
      set(
          produce((state) => {
              state.isEdit = true; // 标记为编辑状态
              state.page.pageData.variables.push(payload);
          }),
      );
  },
  // 更新变量
  editVariable(payload: PageVariable) {
      set(
          produce((state) => {
              state.isEdit = true; // 标记为编辑状态
              const index = state.page.pageData.variables.findIndex((item: PageVariable) => item.name == payload.name);
              if (index > -1) {
                  if(!state.page.pageData.variableData) state.page.pageData.variableData = {};
                  state.page.pageData.variableData[payload.name] = payload.defaultValue;
                  state.page.pageData.variables[index] = payload;
              }
          }),
      );
  },
  editApiOutData: (apiId: any, apiOutData: any) => {
    set(
      produce((state) => {
        if (!state?.page?.pageData?.apiOutData) {
            if (!state?.page?.pageData) {
                if (!state?.page) state.page = {};
                state.page.pageData = {};
            }
            if (!state.page?.pageData) state.page.pageData = {};
            state.page.pageData.apiOutData = {};
        }
        state.page.pageData.apiOutData[`id_${apiId}`] = apiOutData;
        if (!state.page?.pageData?.elementsMap) {
            if (!state.page?.pageData) state.page.pageData = {};
            state.page.pageData.elementsMap = {};
        }
      }),
    );
  },
    updateApiGlobal: (apisGlobal: any) => {
        set(
            produce((state) => {
                if (!state.page?.pageData) {
                    state.page.pageData = {};
                }
                state.page.pageData.apisGlobal = apisGlobal;
            }),
        );
    },
  setForEachVariable: (componentId: string, value: any) => {
    set(
      produce((state) => {
        if (!state.page?.pageData?.forEachVariables) state.page.pageData.forEachVariables = {};
        if(typeof(state.page.pageData.forEachVariables[componentId]) == "object" && JSON.stringify(state.page.pageData.forEachVariables[componentId]) == JSON.stringify(value)){
            return
        }
        if(typeof(state.page.pageData.forEachVariables[componentId]) != "object" && state.page.pageData.forEachVariables[componentId] == value){
            return
        }
        state.page.pageData.forEachVariables[componentId] = value;
      }),
    );

  },

  // 清除页面信息
  clearPageInfo() {
    set(
      produce((state) => {
        state.page = {
          id: 0,
          name: '',
          remark: '',
          projectId: 0,
          userId: 0,
          userName: '',
          previewImg: '',
          stgState: 1,
          preState: 1,
          prdState: 1,
          stgPublishId: 0,
          prePublishId: 0,
          prdPublishId: 0,
          refreshPageEvent: "",
          pageData: {
            config: {
              props: {},
              style: {},
              scopeCss: '',
              scopeStyle: {},
              events: [],
              api: {
                sourceType: 'json',
                id: '',
                source: {},
                sourceField: '',
              },
            },
            events: [],
            // 页面全局接口
            apis: {},
            apisGlobal: [],
            apiOutParam: {},
            apiOutData: {},
            apiVariables: [],
            crossApisGlobal: [],
            elements: [],
            elementsMap: {},
            // 页面变量定义列表
            variables: [],
            // 页面变量数据
            variableData: {},
            // 表单数据
            formData: {},
            // 循环变量数据
            forEachVariables: {},
            defaultValueInvalidMap: {},
            // 全局拦截器
            interceptor: {
              headers: [{ key: '', value: '' }],
              timeout: 8,
              timeoutErrorMessage: '请求超时，请稍后再试',
            },
          },
        };
      }),
    );
  },
}));
