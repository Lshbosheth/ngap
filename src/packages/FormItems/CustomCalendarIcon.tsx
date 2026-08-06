import { memo } from 'react';

/**
 * 自定义日历图标组件
 * @param color 图标颜色，默认使用 currentColor
 */
const CustomCalendarIcon = memo(({ color }: { color?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 39.7 36.9"
    fill={color || "currentColor"}
  >
    <path d="M37.2,3.5H2.5C1.1,3.5,0,4.6,0,6v27.2c0,1.4,1.1,2.5,2.5,2.5h34.7c1.4,0,2.5-1.1,2.5-2.5V6 C39.6,4.6,38.5,3.5,37.2,3.5L37.2,3.5z M37.2,33.3H2.5V6h34.7V33.3z" />
    <path d="M2.5,11h34.7v2.5H2.5V11z M9.9,1.1h2.5v7.4H9.9V1.1z M27.3,1.1h2.5v7.4h-2.5V1.1z M7.4,18.4h5v2.5h-5V18.4z M17.4,18.4h5v2.5h-5V18.4z M27.3,18.4h5v2.5h-5V18.4z M7.4,25.8h5v2.5h-5V25.8z M17.4,25.8h5v2.5h-5V25.8z M27.3,25.8h5v2.5h-5V25.8z" />
  </svg>
));

CustomCalendarIcon.displayName = 'CustomCalendarIcon';

/**
 * 自定义下拉框图标组件
 * @param color 图标颜色，默认使用 currentColor
 */
const CustomSelectIcon = memo(({ color }: { color?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 39.7 36.9"
    fill={color || "currentColor"}
  >
    <path d="M20.2,27.6L17,24.4L32.6,8.8l3.1,3.1L20.2,27.6z" />
    <path d="M4.6,12l3.2-3.1l15.6,15.6l-3.2,3.1L4.6,12z" />
  </svg>
));

CustomSelectIcon.displayName = 'CustomSelectIcon';

export { CustomCalendarIcon, CustomSelectIcon };
