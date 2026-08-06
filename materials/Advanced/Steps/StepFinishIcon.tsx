import React from 'react';
import styles from './index.module.less';

const sizeMap: Record<string, { pixelSize: number; glowSize: number }> = {
  small: { pixelSize: 9, glowSize: 7 },
  default: { pixelSize: 11, glowSize: 9 },
  large: { pixelSize: 15, glowSize: 9 },
};

/**
 * 完成步骤图标（对勾样式，模拟 antd 默认 finish 图标）
 * @param size 尺寸：'small' | 'default' | 'large'，或直接传入数字
 */
const StepFinishIcon = ({ size = 'default' }) => {
  const baseSize = typeof size === 'number' ? size : 20;
  const sizeConfig = typeof size === 'number' ? { pixelSize: size, glowSize: 8 } : (sizeMap[size] || sizeMap.default);
  const pixelSize = sizeConfig.pixelSize;
  const glowSize = sizeConfig.glowSize;
  const borderWidth = Math.max(2, Math.floor(pixelSize * 0.12));

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const color = '#98D60E';

  return (
    <div style={{ width: baseSize, height: baseSize, position: "relative" }}>
      <div className={`${styles['step-circle-icon']} step-circle-icon`} style={{
        width: pixelSize,
        height: pixelSize,
        borderRadius: "50%",
        border: `${borderWidth}px solid ${color}`,
        backgroundColor: color,
        boxShadow: `0 0 ${glowSize}px ${hexToRgba(color, 0.9)}`,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <svg
          width={pixelSize * 0.45}
          height={pixelSize * 0.45}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  );
};

export default StepFinishIcon;
