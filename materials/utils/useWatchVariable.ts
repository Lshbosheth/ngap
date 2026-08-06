import { useRef } from 'react';
import { useDeepCompareEffect } from 'ahooks';
import { isNil, isEqual } from 'lodash-es';

interface WatchVariableProps {
    apiVariable: Record<string, any>;
    variableData: Record<string, any>;
    variablePrefix: string;
    callback: () => void;
}

export const useWatchVariable = (props: WatchVariableProps) => {
    const { apiVariable = {}, variableData = {}, variablePrefix = 'context.variable.', callback } = props;
    const prevVariable = useRef<Record<string, any>>({});
    useDeepCompareEffect(() => {
        if (isNil(variableData)) return;
        const { type: variableType, value: variableValue } = apiVariable?.name || {};
        if (variableType === 'variable' && variableValue?.includes?.(variablePrefix)) {
            const variableEntries = Object.entries(variableData);
            let flag = false;
            if (variablePrefix.includes('Form')) {
                flag = variableEntries.some(([_, val]) => {
                    const formEntries = val ? Object.entries(val) : [];
                    return formEntries.some(([key, val]) => variableValue?.includes?.(key) && !isEqual(prevVariable.current?.[key], val));
                });
            } else {
                flag = variableEntries.some(([key, val]) => variableValue?.includes?.(key) && !isEqual(prevVariable.current?.[key], val));
            }
            flag && callback?.();
        }
        prevVariable.current = variableData;
        return () => {
            prevVariable.current = {};
        };
    }, [variableData]);
};
