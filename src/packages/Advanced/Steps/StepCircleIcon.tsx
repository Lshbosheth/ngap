import React from 'react';
import styles from './index.module.less';

const sizeMap: Record<string, { pixelSize: number; glowSize: number }> = {
  small: { pixelSize: 9, glowSize: 7 },
  default: { pixelSize: 11, glowSize: 9 },
  large: { pixelSize: 15, glowSize: 9 },
};

const StepCircleIcon = ({ size = 'default', color = '#0085d0', filled = false, glowMultiplier = 1 }) => {
  const baseSize = typeof size === 'number' ? size : 20;
  const sizeConfig = typeof size === 'number' ? { pixelSize: size, glowSize: 8 } : (sizeMap[size] || sizeMap.default);
  const pixelSize = sizeConfig.pixelSize;
  const glowSize = sizeConfig.glowSize * glowMultiplier;
  const borderWidth = Math.max(2, Math.floor(pixelSize * 0.12));

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div style={{ width: baseSize, height: baseSize, position: "relative" }}>
      <div className={`${styles['step-circle-icon']} step-circle-icon`} style={{
        width: pixelSize,
        height: pixelSize,
        borderRadius: "50%",
        border: filled ? 'none' : `${borderWidth}px solid ${color}`,
        backgroundColor: filled ? color : "#ffffff",
        boxShadow: `0 0 ${glowSize}px ${hexToRgba(color, 1)}`,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      }} />
    </div>
  );
};

export default StepCircleIcon;
