import type { MenuItem, MenuSize } from "../types";

const MENU_KEY = "bobbasnoida.menu.v1";

function isMenuSize(value: unknown): value is MenuSize {
    if (typeof value !== "object" || value === null) {
        return false
    }

    const size = value as Record<string, unknown>;

    return (
        typeof size.label === "string" &&
        size.label.trim().length > 0 &&
        typeof size.extraPrice === "number" &&
        Number.isSafeInteger(size.extraPrice) &&
        size.extraPrice >= 0
    );
}

function isMenuItem(value: unknown): value is MenuItem {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const item = value as Record<string, unknown>;

    return (
    typeof item.id === "string" &&
    item.id.trim().length > 0 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.description === "string" &&
    typeof item.category === "string" &&
    item.category.trim().length > 0 &&
    typeof item.price === "number" &&
    Number.isSafeInteger(item.price) &&
    item.price >= 0 &&
    typeof item.available === "boolean" &&
    (item.sizes === undefined ||
      (Array.isArray(item.sizes) && item.sizes.every(isMenuSize)))
    )
}

export function loadMenu(): MenuItem[] {
    const saved = localStorage.getItem(MENU_KEY);

    if (saved === null) {
        return [];
    }

    const items: unknown = JSON.parse(saved);

    if (!Array.isArray(items) || !items.every(isMenuItem)) {
        throw new Error("the saved menu contains invalid data");
    }

    const ids = new Set(items.map((item) => item.id));

    if (ids.size !== items.length) {
        throw new Error("the saved menu has duplicate")
    }

    return items;
}

export function saveMenu(items: MenuItem[]): void {
    localStorage.setItem(MENU_KEY, JSON.stringify(items));
}