import { createId } from './util';
const dealDataId = (res: any) => {
    res.atomList.forEach((item: any) => {
        if(res.branchName){
            if(typeof res.branchName == "string"){
                // 正则：转义特殊字符 + 全局匹配 g
                const reg = new RegExp(item.atomId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                res.branchName = res.branchName.replace(reg, item.contConfig?.nodeId || 'id_' + item.atomId)
            }else if(typeof res.branchName == "object"){
                res.branchName = JSON.stringify(res.branchName);
                // 正则：转义特殊字符 + 全局匹配 g
                const reg = new RegExp(item.atomId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                res.branchName = res.branchName.replace(reg, item.contConfig?.nodeId || 'id_' + item.atomId)
                res.branchName = JSON.parse(res.branchName);
            }
        }
        item.atomId = item.contConfig?.nodeId || 'id_' + item.atomId;
        item.id = item.contConfig?.nodeId || 'id_' + item.atomId;
        item.parentId = item.contConfig?.parentId || 'id_' + item.parentId;
    });
    return res;
};
const dealPageData = (res: any) => {
    res = dealDataId(res);
    const contConfig = res.atomList.shift().contConfig;
    const _res: any = {
        apis: contConfig?.apis,
        config: contConfig?.config,
        elements: [],
        elementsMap: {},
        events: contConfig?.events,
        formData: contConfig?.formData || {},
        interceptor: contConfig?.interceptor,
        variableData: contConfig?.variableData,
        variables: contConfig?.variables,
        apisGlobal: contConfig?.apisGlobal,
        crossApisGlobal: contConfig?.crossApisGlobal,
        branchName: res.branchName
    };
    res.atomList.forEach((item: any) => {
        _res.elementsMap[item.id] = {
            id: item.id,
            name: item.contCss.name,
            parentId: item.parentId,
            type: item.atomType,
            param: item.contConfig?.param,
            config: item.contConfig?.config,
            events: item.contConfig?.events,
            methods: item.contConfig?.methods,
        };
    });
    // 将列表转换成树结构
    // 获取以parentId为key的map，值是parentId为这个值的节点
    const atomMap_parentId: any = {};
    for (let key in _res.elementsMap) {
        if (!atomMap_parentId[_res.elementsMap[key].parentId || 'undefined']) {
            atomMap_parentId[_res.elementsMap[key].parentId || 'undefined'] = [];
        }
        atomMap_parentId[_res.elementsMap[key].parentId || 'undefined'].push(_res.elementsMap[key].id);
    }
    const idSorts = contConfig?.componentList?.map((item: any) => item.componentId);
    for (let parentId in atomMap_parentId) {
        atomMap_parentId[parentId].sort((a: any, b: any) => idSorts?.indexOf(a) - idSorts?.indexOf(b));
    }
    // 构建节点树
    const ids = atomMap_parentId['id_undefined'];
    const atomMap = JSON.parse(JSON.stringify(_res.elementsMap));
    while (ids?.length > 0) {
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
    rootNode.elements.sort((a: any, b: any) => idSorts?.indexOf(a.id) - idSorts?.indexOf(b.id));
    _res.elements = rootNode.elements;
    return {
        pageData: _res,
        id: res.id,
        name: res.appName,
        userId: 100000,
        userName: 'ngapview',
        remark: '验证增删改查',
        isPublic: 2,
        stgState: 2,
        preState: 2,
        prdState: 2,
        projectId: res.projectId,
        updatedAt: '2025-01-14 10:31:23',
        relationId: res.relationId || '',
        belongVersion: res.belongVersion ||'',
        provId: res.provId ||'',
        appLevel: res.appLevel ||'',
    };
};
export default dealPageData;
// 重新赋值id，避免id重复
export const dealPageDataId = (pageData: any) => {
    // 初始化清空elementMap
    pageData.elementsMap = {};
    const nodeIdMap: { [key: string]: any } = {};
    // 递归遍历
    const recursion = (parentId: string, nodes: any = []) => {
        nodes.forEach((node: any) => {
            // 重新生成id
            const oldId = node.id;
            node.id = createId(node.id.split('_')[0]) + (oldId.indexOf("_titleContent") > -1 ? "_titleContent" : "");
            nodeIdMap[oldId] = node.id;
            // 同步修改parentId
            node.parentId = parentId;
            recursion(node.id, node.elements);
            pageData.elementsMap[node.id] = node;
        });
    };
    recursion('id_undefined', pageData.elements);
    let _elements = JSON.stringify(pageData.elements);
    let _elementsMap = JSON.stringify(pageData.elementsMap);
    for (let oldId in nodeIdMap) {
        // 正则：转义特殊字符 + 全局匹配 g
        const reg = new RegExp(oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        // 所有包含旧id都替换成新id
        _elements = _elements.replace(reg, nodeIdMap[oldId]);
        _elementsMap = _elementsMap.replace(reg, nodeIdMap[oldId]);
    }
    pageData.elements = JSON.parse(_elements);
    pageData.elementsMap = JSON.parse(_elementsMap);
};
