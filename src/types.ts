export type MenuSize = {
    label: string;
    extraPrice: number;
};

export type MenuItem = {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    available: boolean;
    sizes?: MenuSize[];
};