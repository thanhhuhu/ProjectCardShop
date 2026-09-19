export interface NavLink {
    label: string;
    href: string;
}

export interface NavItem extends NavLink {
    children?: NavLink[];
}