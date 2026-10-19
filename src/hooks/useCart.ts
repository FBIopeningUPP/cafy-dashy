import { useState } from "react";
import type { CartLine, MenuItem } from "../types";

const CART_KEY = "bobbasnoida.card.v1";
const MAX_QUANTITY = 99;

type CartState = {
    lines: CartLine[];
    error: string;
    canEdit: boolean;
};

function isCartLine(value: unknown): value is CartLine {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const line = value as Record<string, unknown>;

    return (
        typeof line.id === "string" &&
        line.id.length > 0 &&
        typeof line.menuItemId === "string" &&
        line.menuItemId.length > 0 &&
        typeof line.quantity === "number" &&
        Number.isInteger(line.quantity) &&
        line.quantity >= 1 &&
        line.quantity <= MAX_QUANTITY &&
        (line.sizeLabel === undefined ||
            (typeof line.sizeLabel === "string" &&
                line.sizeLabel.trim().length > 0))
    );
}

function readCart(): CartLine[] {
    const saved = localStorage.getItem(CART_KEY);

    if (saved === null) {
        return[];
    }

    const lines: unknown = JSON.parse(saved);

    if (!Array.isArray(lines) || !lines.every(isCartLine)) {
        throw new Error("invalid saved cart");
    }

    if (new Set(lines.map((line) => line.id)).size !== lines.length) {
        throw new Error("duplicate car line ids");
    }

    return lines;
}

export function useCart() {
    const [cart, setCart] = useState<CartState>(() => {
        try {
            return {lines: readCart(), error: "", canEdit: true};
        } catch {
            return {
                lines: [],
                error: "Could not read your saved cart. Clear the cart to start again.",
                canEdit: false,
            };
        }
    });

    function reportError(message: string): false {
        setCart({...cart, error: message});
        return false;
    }

    function saveLines(lines: CartLine[]): boolean {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(lines));
        } catch {
            return reportError("Could not save your cart. Please try again.");
        }

        setCart({lines, error: "", canEdit: true});
        return true;
    }

    function addItem(item: MenuItem, sizeLabel?: string): boolean {
        if (!cart.canEdit) {
            return false;
        }

        if (!item.available) {
            return reportError("This item is sold out.");
        }

        const sizes = item.sizes ?? [];

        if (
            (sizes.length > 0 && !sizes.some((size) => size.label === sizeLabel)) ||
            (sizes.length === 0 && sizeLabel !== undefined)
        ) {
            return reportError("Choose an available size.");
        }

        const existing = cart.lines.find(
            (line) =>
                line.menuItemId === item.id && line.sizeLabel === sizeLabel,
        );

        if (existing) {
            if (existing.quantity >= MAX_QUANTITY) {
                return reportError("You can add up to 99 of each item.");
            }

            return saveLines(
                cart.lines.map((line) =>
                    line.id === existing.id
                        ? {...line, quantity: line.quantity + 1}
                        : line,
                ),
            );
        }

        return saveLines([
            ...cart.lines,
            {
                id: crypto.randomUUID(),
                menuItemId: item.id,
                sizeLabel,
                quantity:1,
            },
        ]);
    }

    function setQuantity(id: string, quantity: number): boolean {
        if (!cart.canEdit) {
            return false;
        }

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > MAX_QUANTITY
        ) {
            return reportError("Quantity must be between 1 and 99.");
        }

        return saveLines(
            cart.lines.map((line) =>
                line.id === id ? {...line, quantity} : line,
            ),
        );
    }

    function removeItem(id: string): boolean {
        if (!cart.canEdit) {
            return false;
        }

        return saveLines(cart.lines.filter((line) => line.id !== id));
    }

    function clearCart(): boolean {
        return saveLines([]);
    }

    return {
        lines: cart.lines,
        error: cart.error,
        canEdit: cart.canEdit,
        count: cart.lines.reduce((sum, line) => sum + line.quantity, 0),
        addItem,
        setQuantity,
        removeItem,
        clearCart,
    };
}