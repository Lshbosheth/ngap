import React from 'react';

// 全局缓存
let svgElement: any = null;
const svgNS = 'http://www.w3.org/2000/svg';

export interface LineConfig {
    lineType: 'svg' | 'div';
    // canvas: React.RefObject<HTMLDivElement>;
    canvas: HTMLElement;
    allowLineStartDom: string;
    allowLineEndDom: string;
    delLineFun?: (startDom: HTMLElement) => void;
    addLineFun?: (e: MouseEvent, startDom: HTMLElement, endDom: HTMLElement | null) => void;
    scale?: number;
}

// 初始化方法
export const initSVG = (container: HTMLElement) => {
    if (!container) return null;

    // 如果已存在，先移除
    if (svgElement && svgElement.parentNode === container) {
        return svgElement;
    }

    // 创建 SVG
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('xmlns', svgNS);

    // 添加到容器
    container.appendChild(svg);

    // 缓存
    svgElement = svg;
    return svg;
};

export const createLine = (config: LineConfig, startDom: HTMLElement, endDom: HTMLElement) => {
    if (config.lineType === 'svg') {
        return createLineBySvg(config, startDom, endDom);
    } else {
        return createLineByDiv(config, startDom, endDom);
    }
};

export const updateLine = (line: any, config: LineConfig, startDom: HTMLElement, endDom: HTMLElement) => {
    if (config.lineType === 'svg') {
        updateLineBySvg(line, config, startDom, endDom);
    } else {
        updateLineByDiv(line, config, startDom, endDom);
    }
};

// SVG 实现
const createLineBySvg = (config: LineConfig, startDom: HTMLElement, endDom: HTMLElement) => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M 0 0 C 150 50 200 250 10 10');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#0085d0');
    path.setAttribute('stroke-width', '2');
    svgElement.appendChild(path);

    updateLineBySvg(path, config, startDom, endDom);
    return path;
};

const updateLineBySvg = (line: SVGPathElement, config: LineConfig, startDom: HTMLElement, endDom: HTMLElement) => {
    const canvas = config.canvas!;
    if (canvas) {
        const startRect = startDom.getBoundingClientRect();
        const endRect = endDom.getBoundingClientRect();

        const startTop = (startRect.top - canvas.getBoundingClientRect().top - 1.5) / (config.scale || 1);
        const startLeft = (startRect.left - canvas.getBoundingClientRect().left - 1.5) / (config.scale || 1);
        const startWidth = startRect.width;
        const startHeight = startRect.height;

        const endTop = (endRect.top - canvas.getBoundingClientRect().top) / (config.scale || 1);
        const endLeft = (endRect.left - canvas.getBoundingClientRect().left) / (config.scale || 1);
        const endWidth = endRect.width;
        const endHeight = endRect.height;

        const startX = startLeft + startWidth;
        const startY = startTop + startHeight / 2;
        const endX = endLeft - 5;
        const endY = endTop + endHeight / 2;

        let controlX1 = startX + (endX - startX) / 2;
        const controlY1 = startY;
        let controlX2 = endX - (endX - startX) / 2;
        const controlY2 = endY;

        if (endLeft < startLeft + startWidth) {
            // 结束节点在开始节点左边
            controlX1 = startX + (startX - endX + 30);
            controlX2 = endX - (startX - endX + 30);
        }

        let pathStr = 'M ' + startX + ' ' + startY;
        pathStr += ' C ' + controlX1 + ' ' + controlY1 + ' ' + controlX2 + ' ' + controlY2 + ' ' + endX + ' ' + endY;
        pathStr += ' L ' + (endX + 2 - 8) + ' ' + (endY - 8);
        pathStr += ' L ' + endX + ' ' + endY;
        pathStr += ' L ' + (endX + 2 - 8) + ' ' + (endY + 8);
        line.setAttribute('d', pathStr);
    }
};

// DIV 实现
const createLineByDiv = (config: LineConfig, startDom: HTMLElement, endDom: HTMLElement) => {
    const line = document.createElement('div');
    line.className = 'connectionLine';
    line.innerHTML = `
        <div class="startLine"></div>
        <div class="verticalLine"></div>
        <div class="verticalLine1"></div>
        <div class="leftLine"></div>
        <div class="verticalLine2"></div>
        <div class="endLine"><div class="endLineAfter"></div></div>
    `;
    config.canvas?.appendChild(line);
    updateLineByDiv(line, config, startDom, endDom);
    return line;
};

const updateLineByDiv = (line: HTMLElement, config: LineConfig, startDom: HTMLElement, endDom: HTMLElement) => {
    const canvas = config.canvas!;
    const startRect = startDom.getBoundingClientRect();
    const endRect = endDom.getBoundingClientRect();

    const startTop = (startRect.top - canvas.getBoundingClientRect().top) / (config.scale || 1);
    const startLeft = (startRect.left - canvas.getBoundingClientRect().left) / (config.scale || 1);
    const startWidth = startRect.width;
    const startHeight = startRect.height;

    const endTop = (endRect.top - canvas.getBoundingClientRect().top) / (config.scale || 1);
    const endLeft = (endRect.left - canvas.getBoundingClientRect().left) / (config.scale || 1);
    const endWidth = endRect.width;
    const endHeight = endRect.height;

    const outLength = 20;
    const startX = startLeft + startWidth;
    const startY = startTop + startHeight / 2;
    const endX = endLeft;
    const endY = endTop + endHeight / 2;

    const leftLine = line.querySelector('.leftLine') as HTMLElement;
    const startLine = line.querySelector('.startLine') as HTMLElement;
    const endLine = line.querySelector('.endLine') as HTMLElement;
    const verticalLine = line.querySelector('.verticalLine') as HTMLElement;
    const verticalLine1 = line.querySelector('.verticalLine1') as HTMLElement;
    const verticalLine2 = line.querySelector('.verticalLine2') as HTMLElement;

    if (endLeft < startX) {
        startLine.style.top = `${startY}px`;
        startLine.style.left = `${startX}px`;
        startLine.style.width = `${outLength}px`;

        endLine.style.top = `${endY}px`;
        endLine.style.left = `${endLeft - outLength}px`;
        endLine.style.width = `${outLength}px`;

        leftLine.style.left = `${endLeft - outLength}px`;
        leftLine.style.width = `${startX + outLength - (endLeft - outLength)}px`;

        verticalLine1.style.left = `${startX + outLength}px`;

        verticalLine2.style.left = `${endLeft - outLength}px`;

        if (endY >= startY) {
            const height = endY - startY;
            leftLine.style.top = `${startY + height / 2}px`;
            verticalLine1.style.top = `${startY}px`;
            verticalLine1.style.height = `${height / 2 + 2}px`;
            verticalLine2.style.top = `${startY + height / 2}px`;
            verticalLine2.style.height = `${height / 2}px`;
        } else {
            const height = startY - endY;
            leftLine.style.top = `${startY - height / 2}px`;
            verticalLine1.style.top = `${startY - height / 2}px`;
            verticalLine1.style.height = `${height / 2 + 2}px`;
            verticalLine2.style.top = `${endY}px`;
            verticalLine2.style.height = `${height / 2}px`;
        }

        verticalLine.style.height = '0px';
    } else {
        const lineLength = endLeft - startX;
        startLine.style.top = `${startY}px`;
        startLine.style.left = `${startX}px`;
        startLine.style.width = `${lineLength / 2}px`;

        endLine.style.top = `${endY}px`;
        endLine.style.left = `${endLeft - lineLength / 2}px`;
        endLine.style.width = `${lineLength / 2 - 2}px`;

        verticalLine.style.left = `${startX + lineLength / 2}px`;
        if (endY >= startY) {
            verticalLine.style.top = `${startY}px`;
            verticalLine.style.height = `${endY - startY + 2}px`;
        } else {
            verticalLine.style.top = `${endY}px`;
            verticalLine.style.height = `${startY - endY + 2}px`;
        }

        leftLine.style.width = '0px';
        verticalLine1.style.height = '0px';
        verticalLine2.style.height = '0px';
    }
};
