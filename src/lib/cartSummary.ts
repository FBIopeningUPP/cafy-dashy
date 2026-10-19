import type { CartLine, MenuItem, OrderLine } from "../types";

export type CartRow = OrderLine & {
    id: string;
    lineTotal: number;
    error: string;
};

export function buildCartSummary(
    lines: CartLine[],
    menu: MenuItem[],
) {
    const rows: CartRow[] = lines.map((line) => {
        const item = menu.find((entry) => entry.id === line.menuItemId);
        const sizes = item?.sizes ?? [];
        const size = sizes.find((entry) => entry.label === line.sizeLabel);
        
        const unitPrice = (item?.price ?? 0) + (size?.extraPrice ?? 0);
        const lineTotal = unitPrice * line.quantity;

        let error = "";

        if (!item) {
            error = "This item was removed from the menu.";
        } else if (!item.available) {
            error = "This item is sold out.";
        } else if (
            (sizes.length > 0 && !size) ||
            (sizes.length === 0 && line.sizeLabel !== undefined)
        ) {
            error = "This size is no longer available. Remove the item and add it again."
        } else if (
            !Number.isInteger(line.quantity) ||
            line.quantity < 1 ||
            line.quantity > 99
        ) {
            error = "Quantity must be between 1 and 99."
        } else if (
            !Number.isSafeInteger(unitPrice) ||
            unitPrice < 0 ||
            !Number.isSafeInteger(lineTotal)
        ) {
            error = "This item has an invalid price.";
        }

        return {
            id: line.id,
            menuItemId: line.menuItemId,
            name: item?.name ?? "Removed item",
            sizeLabel: line.sizeLabel,
            unitPrice,
            quantity: line.quantity,
            lineTotal,
            error,
        };
    });

    const total = rows.reduce((sum, row) => sum + row.lineTotal, 0);

    const error = Number.isSafeInteger(total)
        ? ""
        : "The order total is too large.";
    
        const canCheckout =
            rows.length > 0 &&
            error === "" &&
            rows.every((row) => row.error === "");
        
            const orderLines: OrderLine[] = canCheckout
                ? rows.map((row) =>({
                    menuItemId: row.menuItemId,
                    name: row.name,
                    sizeLabel: row.sizeLabel,
                    unitPrice: row.unitPrice,
                    quantity: row.quantity,
                }))
            : [];
        
        return {
            rows,
            total,
            error,
            canCheckout,
            orderLines
        };
}