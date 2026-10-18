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

export type CartLine = {
    id: string;
    menuItemId: string;
    sizeLabel?: string;
    quantity: number;
};

export type OrderStatus =
    | "placed"
    | "preparing"
    | "ready"
    | "completed";

export type OrderDetails = {
    customerName: string;
    orderType: "dine-in" | "takeaway";
    tableNumber?: string;
    note: string;
};

export type OrderLine = {
    menuItemId: string;
    name: string;
    sizeLabel?: string;
    unitPrice: number;
    quantity: number;
};

export type Order = {
    id: string;
    number: number;
    createdAt: string;
    status: OrderStatus;
    details: OrderDetails;
    lines: OrderLine[];
    total: number;
};