// types/menu.ts
export interface MenuItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
    component?: React.LazyExoticComponent<React.ComponentType<any>>; // 只有叶子节点才有组件
    children?: MenuItem[]; // 子菜单项
    type?: 'group' | 'divider'; // 分组类型
    hide?:boolean
}

export interface TabItem {
    key: string;
    label: string;
    children: React.ReactNode;
    closable: boolean;
}
