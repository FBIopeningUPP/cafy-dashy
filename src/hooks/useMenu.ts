import { useState } from "react";
import { loadMenu, saveMenu } from "../lib/menuStorage";
import type { MenuItem } from "../types";

type MenuState = {
    items: MenuItem[];
    error: string;
    canEdit: boolean;
};

export function useMenu() {
    const [menu, setMenu] = useState<MenuState>(() => {
        try {
            return {
                items: loadMenu(),
                error: "",
                canEdit: true,
            };
        } catch (error) {
            return {
                items: [],
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not load menu",
                canEdit: false,
            };
        }
    });

    function updateMenu(items: MenuItem[]): boolean {
        if (!menu.canEdit) {
            return false;
        }

        try {
            saveMenu(items);
        } catch (error) {
            setMenu({
                ...menu,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not save menu"
            });
            return false;
        }

        setMenu({
            items,
            error: "",
            canEdit: true,
        });

        return true;
    }

    function saveItem(item: MenuItem): boolean {
        const exists = menu.items.some((entry) => entry.id === item.id);

        const items = exists
            ? menu.items.map((entry) => (entry.id === item.id ? item : entry))
            : [...menu.items, item];
        return updateMenu(items);
    }

    function removeItem(id: string): boolean {
        return updateMenu(menu.items.filter((item) => item.id !== id));
    }

    return {
        items: menu.items,
        error: menu.error,
        canEdit: menu.canEdit,
        saveItem,
        removeItem,
    };
}