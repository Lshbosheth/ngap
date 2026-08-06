import { createId } from '@/utils/util';
const dealDataId = (res: any) => {
    res.atomList.forEach((item: any) => {
        item.atomId = item.contConfig.nodeId || 'id_' + item.atomId;
        item.id = item.contConfig.nodeId || 'id_' + item.atomId;
        item.parentId = item.contConfig.parentId || 'id_' + item.parentId;
    });
    return res;
};
const processDealPageData = (res: any) => {
    res = dealDataId(res);
    // let contConfig = res.atomList.shift().contConfig;
    const _res: any = {
        // apis: contConfig.apis,
        // config: contConfig.config,
        elements: [],
        elementsMap: {},
        // events: contConfig.events,
        // formData: contConfig.formData || {},
        // interceptor: contConfig.interceptor,
        // variableData: contConfig.variableData,
        // variables: contConfig.variables,
    };
    res.atomList.forEach((item: any) => {
        _res.elementsMap[item.id] = {
            id: item.id,
            name: item.contCss.name,
            parentId: item.parentId,
            type: item.atomType,
            config: item.contConfig.config,
            events: item.contConfig.events,
            methods: item.contConfig.methods,
        };
    });
    // 将列表转换成树结构
    // 获取以parentId为key的map，值是parentId为这个值的节点
    const atomMap_parentId: any = {};
    for (const key in _res.elementsMap) {
        if (!atomMap_parentId[_res.elementsMap[key].parentId || 'undefined']) {
            atomMap_parentId[_res.elementsMap[key].parentId || 'undefined'] = [];
        }
        atomMap_parentId[_res.elementsMap[key].parentId || 'undefined'].push(_res.elementsMap[key].id);
    }
    // 构建节点树
    const ids = atomMap_parentId['id_undefined'];
    const atomMap = JSON.parse(JSON.stringify(_res.elementsMap));
    while (ids && ids.length > 0) {
        const id = ids.shift();
        atomMap[id].elements = [];
        (atomMap_parentId[id] || []).forEach((child: any) => {
            atomMap[id].elements.push(atomMap[child]);
            ids.push(child);
        });
    }
    // 获取根节点
    const rootNode: any = {
        elements: [],
    };
    for (let key in atomMap) {
        if (atomMap[key].parentId == 'id_undefined') {
            rootNode.elements.push(atomMap[key]);
        }
    }
    _res.elements = rootNode.elements;
    return {
        pageData: _res,
        id: 144,
        name: 'CRUD案例',
        userId: 100000,
        userName: 'ngapview',
        remark: '验证增删改查',
        isPublic: 2,
        stgState: 2,
        preState: 2,
        prdState: 2,
        projectId: 100000,
        updatedAt: '2025-01-14 10:31:23',
    };
};
export default processDealPageData;
// 重新赋值id，避免id重复
export const processDealDataId = (pageData: any) => {
    // 初始化清空elementMap
    pageData.elementsMap = {};
    // 递归遍历
    const recursion = (parentId: string, nodes: any = []) => {
        nodes.forEach((node: any) => {
            // 重新生成id
            node.id = createId(node.id.split('_')[0]) + (node.id.indexOf("_titleContent") > -1 ? "_titleContent" : "");
            // 同步修改parentId
            node.parentId = parentId;
            recursion(node.id, node.elements);
            pageData.elementsMap[node.id] = node;
        });
    };
    recursion('id_undefined', pageData.elements);
};
