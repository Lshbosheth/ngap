import React from 'react';

const sizeMap: Record<string, number> = {
  small: 15,
  default: 19,
  large: 23,
};

const innerCircleSizeMap: Record<string, number> = {
  small: 9,
  default: 11,
  large: 15,
};

/**
 * 办理中步骤图标
 * @param size 尺寸：'small' | 'default' | 'large'，或直接传入数字
 */
const StepLoadingIcon = ({ size = 'default' }) => {
  const pixelSize = typeof size === 'number' ? size : (sizeMap[size] || 32);
  const targetInnerCircle = typeof size === 'number' ? size : (innerCircleSizeMap[size] || innerCircleSizeMap.default);
  // 基础配色（匹配蓝湖规范）
  const bgFill = "#C1DFF9"; // 底层半透明底色
  const borderBlue = "#4096ff"; // 中间蓝色边框
  const gradientGreen = "#73e289"; // 渐变绿色
  const ringWidth = Math.max(2, Math.floor(pixelSize * 0.125)); // 旋转环粗细，按比例计算
  const innerWhiteSize = pixelSize - ringWidth * 2 - 4; // 白色实心内圆大小
  const whiteCircleSize = Math.max(4, Math.min(targetInnerCircle, innerWhiteSize - ringWidth)); // 最内层白色实心圆大小

  return (
    <div style={{ width: pixelSize, height: pixelSize, position: "relative" }}>
      {/* 1. 最底层：半透明浅蓝底色圆（蓝湖 24px #C1DFF9 opacity:0.47） */}
      <div style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: bgFill,
        opacity: 0.47,
        position: "absolute",
        inset: 0
      }} />

      {/* 2. 外层渐变旋转加载环 */}
      <div style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        position: "absolute",
        inset: 0,
        // 蓝绿渐变环形
        background: `conic-gradient(${borderBlue}, ${gradientGreen}, transparent 65%)`,
        animation: "spin 1.2s linear infinite",
        // 遮罩挖空中间，只保留ringWidth宽度圆环
        mask: `radial-gradient(transparent ${pixelSize/2 - ringWidth}px, #000 ${pixelSize/2 - ringWidth}px)`,
        WebkitMask: `radial-gradient(transparent ${pixelSize/2 - ringWidth}px, #000 ${pixelSize/2 - ringWidth}px)`
      }} />

      {/* 3. 中间蓝色边框层 */}
      <div style={{
        width: innerWhiteSize,
        height: innerWhiteSize,
        borderRadius: "50%",
        border: `${Math.max(1.5, ringWidth * 0.6)}px solid ${borderBlue}`,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* 4. 最内层白色实心圆 */}
        <div style={{
          width: whiteCircleSize,
          height: whiteCircleSize,
          borderRadius: "50%",
          background: "#ffffff"
        }} />
      </div>

      {/* 旋转动画 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StepLoadingIcon;
