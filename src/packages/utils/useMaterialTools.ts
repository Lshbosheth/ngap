import { ComponentType } from '../types';
import { useAppContext } from './../../utils/AppProvider';
import { dateFormat, getPageVariable, renderFormula } from './util';

interface UseMaterialToolsReturn {
    getPageVariable: (name?: string) => string;
    renderFormula: (formula: string, eventParams: any, loopVariable?: any) => any;
    dateFormat: (list: Array<ComponentType>, values: Record<string, any>) => any;
}

/**
 * 物料工具箱内的某几个方法
 */
export const UseMaterialTools = (): UseMaterialToolsReturn => {
    const contextState = useAppContext();
    const customerGetPageVariable = (name?: string) => getPageVariable(name, contextState);
    const customerRenderFormula = (formula: string, eventParams: any = {}, loopVariable?: any) =>
        renderFormula(formula, eventParams, contextState, loopVariable);
    const customerDateFormat = (list: Array<ComponentType>, values: Record<string, any>) => dateFormat(list, values, contextState);
    return {
        getPageVariable: customerGetPageVariable,
        renderFormula: customerRenderFormula,
        dateFormat: customerDateFormat,
    };
};
