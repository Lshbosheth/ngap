import { memo, useEffect, useRef } from 'react';
import NgapRender from '@materials/NgapRender/NgapRender';
import { handleActionFlow } from '@materials/utils/action';
import { ComItemType, ConfigType } from '@materials/types/index';

const Page = ({ config, elements, relationId }: { config?: ConfigType; elements?: ComItemType[]; relationId: string }) => {
    const resizeHeightRef = useRef<(event: MessageEvent) => void>();
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        config?.events?.forEach((event: any) => {
            if (event.actions?.length > 0) {
                handleActionFlow(event.actions, {});
            }
        });
    }, [config?.events]);

    const formRef = useRef<HTMLDivElement>(null);

    const sendPageHeight = () => {
        const element = formRef.current;
        if (!element) return;
        const height = element.getBoundingClientRect().height + 28;
        const params = {
            name: 'ngapCardHeightChange',
            relationId,
            height,
            type: 'changeHeight',
            url: window.location.href,
        };
        if (relationId) {
            window.parent.postMessage(params, '*');
        }
    };

    const updateHeight = () => {
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
            sendPageHeight();
        });
    };

    useEffect(() => {
        const element = formRef.current;
        if (!element) return;

        updateHeight();
        const observer = new MutationObserver(() => {
                    updateHeight();
        });

        observer.observe(element, {
            childList: true, // 监听表单项增删
            attributes: true, // 监听属性变化
            subtree: true, // 监听所有后代
        });

        return () => {
            observer.disconnect();
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        resizeHeightRef.current = (event: MessageEvent) => {
        const eventParam = event.data;
        if (eventParam.name === 'parentDomOpenEvent' && eventParam.relationId === relationId) {
            updateHeight();
        }
    };
        const handler = resizeHeightRef.current;
        window.addEventListener('message', handler);
        return () => {
            window.removeEventListener('message', handler);
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [relationId]);

    return (
        <div style={config?.style} ref={formRef}>
            {<NgapRender elements={elements || []} />}
        </div>
    );
};
export default memo(Page);
