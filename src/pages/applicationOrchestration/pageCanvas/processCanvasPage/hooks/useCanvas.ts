import { useRef, useState, useCallback, useEffect } from 'react';
import { CanvasLine, CanvasNode, CanvasScale } from '../processCanvasPageType.ts';
import { updateLine } from '@/pages/applicationOrchestration/pageCanvas/components/lineUtil.tsx';

/**
 * 画布核心Hook：处理缩放、拖拽、连线坐标计算
 * @param nodeMap 节点映射表
 * @param lineArr 连线数组
 * @param setLineArr 连线更新方法
 */
export const useCanvas = (nodeMap: Record<string | number, CanvasNode>, lineArr: CanvasLine[], setLineArr: (lines: CanvasLine[]) => void, pageStore: any) => {
    const { zoomRatio } = pageStore((state: any) => {
        return {
            zoomRatio: state.zoomRatio,
        }
    })
    // 使用 ref 保持最新值
    const lineArrRef = useRef(lineArr);
    // 画布DOM引用
    const canvasRef = useRef<HTMLDivElement>(null);
    // 拖拽相关Ref
    const dragRef = useRef({
        isDragging: false,
        targetNodeId: '',
        offX: 0,
        offY: 0,
    });

    // 画布缩放比例（默认100%）
    const [scale, setScale] = useState<CanvasScale>(zoomRatio * 100);
    const [scaleRatio, setScaleRatio] = useState(scale / 100);
    const scaleRatioRef = useRef(1);
    useEffect(() => {
        setScale(zoomRatio * 100);
        setScaleRatio(zoomRatio);
    }, [zoomRatio])
    useEffect(() => {
        setScaleRatio(scale / 100);
    }, [scale])
    useEffect(() => {
        scaleRatioRef.current = scaleRatio;
    }, [scaleRatio])
    // 计算连线坐标（根据起始/结束节点DOM）
    const calculateLinePos = useCallback(
        (startDom: HTMLElement, endDom: Element) => {
            const startRect = startDom.getBoundingClientRect();
            const endRect = endDom.getBoundingClientRect();
            const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

            // 计算相对画布的坐标（修正缩放比例）
            return {
                x1: (startRect.right - canvasRect.left) / scaleRatio,
                y1: (startRect.top + startRect.height / 2 - canvasRect.top) / scaleRatio,
                x2: (endRect.left - canvasRect.left) / scaleRatio,
                y2: (endRect.top + endRect.height / 2 - canvasRect.top) / scaleRatio,
            };
        },
        [scaleRatio],
    );

    // 更新连线坐标（节点拖拽后刷新）
    const updateLinePos = useCallback(
        (nodeId: string | number, _scaleRatio: number | undefined) => {
            if (!canvasRef.current) return;
            const nodeCanvasRef = canvasRef.current.querySelector('.nodeCanvas') as HTMLElement;
            if (!nodeCanvasRef) return;
            const currentLines = lineArrRef.current;
            const newLines = [...currentLines];
            newLines.forEach((item) => {
                const $line = item.line;
                const startDom = item.startDom;
                const endDom = item.endDom;
                updateLine(
                    $line,
                    {
                        lineType: 'svg',
                        canvas: nodeCanvasRef,
                        allowLineStartDom: '.allowLineDom',
                        allowLineEndDom: '.canvasNodeBlock',
                        scale: _scaleRatio
                    },
                    startDom,
                    endDom,
                ); // 直接传入 HTMLElement
            });
            setLineArr(newLines);
        },
        [lineArr, setLineArr, calculateLinePos],
    );
    const [dragNodeId, setDragNodeId] = useState("");
    const handleMouseDown = useCallback((e: MouseEvent) => {
        const nodeDom: any = e.currentTarget;
        const nodeId = nodeDom?.attributes?.["node-id"]?.value;
        setDragNodeId(nodeId);
        if (!nodeDom || !canvasRef.current) return;
        //点击允许连线节点时执行连线逻辑，阻止拖拽
        const currentNode: any = e.target;
        if (currentNode.className.indexOf('allowLineDom') > -1) {
            return;
        }
        const element = canvasRef.current;
        if (!element) return;
        e.preventDefault();
        e.stopPropagation();
        const nodeRect = nodeDom.getBoundingClientRect();
        // 记录拖拽初始偏移
        dragRef.current = {
            isDragging: true,
            targetNodeId: nodeId as string,
            offX: e.clientX - nodeRect.left,
            offY: e.clientY - nodeRect.top,
        };
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragRef.current.isDragging || !dragRef.current.targetNodeId || dragRef.current.targetNodeId !== dragNodeId) return;
        const nodeDom = document.querySelector(`[node-id="${dragNodeId}"]`) as HTMLElement;
        if (!nodeDom || !canvasRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        const canvasRect = canvasRef.current!.getBoundingClientRect();

        // 计算新位置（修正缩放，保证拖拽流畅）
        const newLeft = Math.max(0, (e.clientX - canvasRect.left - dragRef.current.offX) / scaleRatio);
        const newTop = Math.max(0, (e.clientY - canvasRect.top - dragRef.current.offY) / scaleRatio);

        // 更新节点DOM位置
        nodeDom.style.left = `${newLeft}px`;
        nodeDom.style.top = `${newTop}px`;

        // 刷新连线
        updateLinePos(dragRef.current.targetNodeId, scaleRatioRef.current);

        // 扩展画布尺寸
        extendCanvas(nodeDom as HTMLElement);
    }, [dragNodeId, updateLinePos]);

    const handleMouseUp = useCallback(() => {
        dragRef.current.isDragging = false;
        if (dragRef.current.targetNodeId && dragRef.current.targetNodeId === dragNodeId) {
            const nodeDom = document.querySelector(`[node-id="${dragNodeId}"]`) as HTMLElement;
            if (!nodeDom || !canvasRef.current) return;
            // 同步节点位置到状态
            const newLeft = parseFloat(nodeDom.style.left || '0');
            const newTop = parseFloat(nodeDom.style.top || '0');
            window.dispatchEvent(
                new CustomEvent('node-drag-end', {
                    detail: { dragNodeId, top: newTop, left: newLeft },
                }),
            );
            setDragNodeId("");
        }
    }, [dragNodeId]);
    useEffect(() => {
        if(canvasRef.current){
            canvasRef.current.removeEventListener('mousemove', handleMouseMove);
            canvasRef.current.removeEventListener('mouseup', handleMouseUp);
            canvasRef.current.addEventListener('mousemove', handleMouseMove);
            canvasRef.current.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            if(canvasRef.current){
                canvasRef.current.removeEventListener('mousemove', handleMouseMove);
                canvasRef.current.removeEventListener('mouseup', handleMouseUp);
            }
        }
    }, [handleMouseMove, handleMouseUp])

    // 扩展画布尺寸（节点超出画布时自动放大）
    const extendCanvas = useCallback((nodeDom: HTMLElement) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current.querySelector(".nodeCanvas") as HTMLElement;
        const nodeRect = nodeDom.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        // 计算画布需要的最小尺寸
        const needWidth = nodeRect.right - canvasRect.left + 200;
        const needHeight = nodeRect.bottom - canvasRect.top + 200;

        if (needWidth > canvas.clientWidth) {
            canvas.style.width = `${needWidth}px`;
        }
        if (needHeight > canvas.clientHeight) {
            canvas.style.height = `${needHeight}px`;
        }
    }, []);

    // 生成唯一ID（替代原 getMsgId）
    const generateNodeId = useCallback((): number => {
        return new Date().valueOf();
    }, []);

    useEffect(() => {
        lineArrRef.current = lineArr;
    }, [lineArr]);
    // 组件卸载时解绑事件
    useEffect(() => {
        const element = canvasRef.current;
        if (!element) return;
        return () => {
            dragRef.current.isDragging = false;
        };
    }, []);

    return {
        canvasRef,
        scale,
        scaleRatio,
        calculateLinePos,
        updateLinePos,
        generateNodeId,
        extendCanvas,
        handleMouseDown
    };
};
