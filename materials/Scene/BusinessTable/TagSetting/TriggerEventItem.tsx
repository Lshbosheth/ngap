/**
 * 动作类型枚举
 * 1 - 设置行填充颜色：显示颜色选择
 * 2 - 设置行文字颜色：显示颜色和列选择
 * 3 - 显示图标：显示位置、图标上传、气泡弹窗、图标大小
 * 4 - 设置选项禁用：无额外配置
 */
export enum ActionType {
    /** 设置行填充色 */
    SetRowBgColor = 1,
    /** 设置行文字色 */
    SetRowTextColor = 2,
    /** 设置图标 */
    ShowIcon = 3,
    /** 设置行禁止勾选 */
    SetOptionDisabled = 4,
}
