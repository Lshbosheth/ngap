import React, { useEffect, useRef, useState } from 'react';
import { useRafState } from 'ahooks';
import NgapRender from './../NgapRender/NgapRender';
import { handleActionFlow } from './../utils/action';
import style from './index.module.less';
/**
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
interface pageProp {
    mode: any;
    config: any;
    elements: any;
    setSelectedElement: any;
    updateRef?: any;
    state?: any;
}
const Page: React.FC<pageProp> = ({ mode, config, elements, setSelectedElement, updateRef, state }: any) => {
    const [position, setPosition] = useRafState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const cache = useRef({ offset: { x: 0, y: 0 }, isDragging: false });
    const pageRef = useRef(null);
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setSelectedElement(null);
            setPosition({
                x: e.clientX - cache.current.offset.x,
                y: e.clientY - cache.current.offset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };
    useEffect(() => {
        updateRef?.(pageRef.current);
    }, []);
    const handleMouseDown = (e: React.MouseEvent) => {
        cache.current.offset = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        setIsDragging(true);
    };

    React.useEffect(() => {
        const addEventListener = () => {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        };
        const removeEventListener = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        if (isDragging) {
            addEventListener();
        } else {
            removeEventListener();
        }

        return () => {
            removeEventListener();
        };
    }, [isDragging]);

    useEffect(() => {
        config.events?.forEach((event: any) => {
            if (event.actions?.length > 0) {
                handleActionFlow(event.actions, {}, state);
            }
        });
    }, [config.events]);

    return (
        <div
            style={{
                minHeight: '100%',
                ...config.style,
                backgroundColor: '#FFF',
                padding: '10px',
                position: 'relative',
                // transform: `translate(${position.x}px, ${position.y}px)`,
                // cursor: isDragging ? 'move' : 'default',
            }}
            className={mode == 'edit' ? style.edit : style.preview}
            id="page"
            ref={pageRef}
            // onMouseDown={handleMouseDown}
        >
            {<NgapRender elements={elements || []} />}
        </div>
    );
};
export default Page;
