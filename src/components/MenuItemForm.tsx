import { useId, useState } from "react";
import type { MenuItem } from "../types";

type Props = {
    item?: MenuItem;
    categories: string[];
    disabled: boolean;
    onSave: (item: MenuItem) => boolean;
    onCancel: () => void;
};

export default function MenuItemForm({
    item,
    categories,
    disabled,
    onSave,
    onCancel,
}: Props) {
    const categoryListId = useId();

    const [name, setName] = useState(item?.name ?? "");
    const [description, setDescription] = useState(item?.description ?? "");
    const [category, setCategory] = useState(item?.category ?? "");
    const [price, setPrice] = useState(
        item ? (item.price / 100).toString() : "",
    );
    const [available, setAvailable] = useState(item?.available ?? true);
    const [error, setError] = useState("");

    function handleSave() {
        const priceInPaise = Math.round(Number(price) * 100);

        if (!name.trim() || !category.trim()) {
            setError("Enter an item name and caetgory");
            return;
        }

        if (
            !price.trim() ||
            !Number.isSafeInteger(priceInPaise) ||
            priceInPaise < 0
        ) {
            setError("Enter a valid price of zero or mroe.");
            return;
        }

        const saved = onSave({
            ...item,
            id: item?.id ?? crypto.randomUUID(),
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            price: priceInPaise,
            available,
        });

        if (saved) {
            onCancel();
        } else {
            setError("the item could note be saved. your changes are here");
        }
    }

    return (
        <form
            className="item-form"
            onSubmit={(event) => {
                event.preventDefault();
                handleSave();
            }}
        >
            <h2>{item ? "Edit item" : "New menu item"}</h2>
            <p>Enter prices in rupes. You can create ur own categoreis.</p>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <fieldset className="form-fields" disabled={disabled}>
                <legend>Item Details</legend>
                <label className="form-field">
                    Item Name
                    <input
                        name="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={80}
                        required
                    />
                </label>

                <label className="form-field">
                    Description
                    <textarea 
                        name="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        maxLength={300}
                    />
                </label>

                <label className="form-field">
                    Category
                    <input 
                        name="category"
                        list={categoryListId}
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        maxLength={40}
                        required
                    />
                </label>
                <datalist id={categoryListId}>
                    {categories.map((entry) => (
                        <option key={entry} value={entry} />
                    ))}
                </datalist>

                <label className="form-field">
                    Price (₹)
                    <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        required
                    />
                </label>

                <label className="checkbox-field">
                    <input
                        name="available"
                        type="checkbox"
                        checked={available}
                        onChange={(event) => setAvailable(event.target.checked)}
                    />
                    Available to order
                </label>
            </fieldset>

            <div className="form-actions">
                <button className="button" type="submit" disabled={disabled}>
                {item ? "Save changes" : "Add item"}
                </button>

                <button
                className="button button-secondary"
                type="button"
                onClick={onCancel}
                >
                Cancel
                </button>
            </div>
        </form>
    );
}