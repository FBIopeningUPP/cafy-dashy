import { useId, useState } from "react";
import { parsePrice } from "../lib/format";
import type { MenuItem } from "../types";

type Props = {
  item?: MenuItem;
  categories: string[];
  disabled: boolean;
  onSave: (item: MenuItem) => boolean;
  onCancel: () => void;
};

type SizeDraft = { id: string; label: string; price: string };

export default function MenuItemForm({ item, categories, disabled, onSave, onCancel }: Props) {
  const categoryListId = useId();
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [price, setPrice] = useState(item ? String(item.price / 100) : "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [sizes, setSizes] = useState<SizeDraft[]>(() => (item?.sizes ?? []).map((size) => ({
    id: crypto.randomUUID(), label: size.label, price: String(size.extraPrice / 100),
  })));
  const [error, setError] = useState("");

  function changeSize(id: string, field: "label" | "price", value: string) {
    setSizes((current) => current.map((size) => size.id === id ? { ...size, [field]: value } : size));
  }

  function handleSave() {
    const amount = parsePrice(price);
    if (!name.trim() || !category.trim()) return setError("Enter an item name and category.");
    if (amount === null) return setError("Enter a valid price with up to two decimal places.");
    const options = sizes.map((size) => ({ label: size.label.trim(), extraPrice: parsePrice(size.price) }));
    if (options.some((size) => !size.label || size.extraPrice === null)) {
      return setError("Give each size a name and a valid extra price.");
    }
    if (new Set(options.map((size) => size.label.toLowerCase())).size !== options.length) {
      return setError("Each size needs a different name.");
    }
    if (options.some((size) => !Number.isSafeInteger(amount + size.extraPrice!))) {
      return setError("The combined price is too large.");
    }
    const saved = onSave({
      id: item?.id ?? crypto.randomUUID(), name: name.trim(), description: description.trim(),
      category: category.trim(), price: amount, available,
      sizes: options.length ? options.map((size) => ({ label: size.label, extraPrice: size.extraPrice! })) : undefined,
    });
    if (saved) onCancel();
    else setError("The item could not be saved. Your changes are still here.");
  }

  return (
    <form className="item-form" onSubmit={(event) => { event.preventDefault(); handleSave(); }}>
      <h2>{item ? "Edit item" : "New menu item"}</h2>
      <p>Enter prices in rupees. Use an existing category or create your own.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <fieldset className="form-fields" disabled={disabled}>
        <legend>Item details</legend>
        <label className="form-field">Item name
          <input name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required />
        </label>
        <label className="form-field">Description
          <textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={300} />
        </label>
        <label className="form-field">Category
          <input name="category" list={categoryListId} value={category} onChange={(event) => setCategory(event.target.value)} maxLength={40} required />
        </label>
        <datalist id={categoryListId}>{categories.map((entry) => <option key={entry} value={entry} />)}</datalist>
        <label className="form-field">Base price (₹)
          <input name="price" type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
        </label>
        <label className="checkbox-field">
          <input name="available" type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} />
          Available to order
        </label>
      </fieldset>
      <fieldset className="form-fields" disabled={disabled}>
        <legend>Sizes (optional)</legend>
        <p className="field-help">Add all choices, including a base size with ₹0 extra.</p>
        {sizes.map((size, index) => (
          <div className="size-row" key={size.id}>
            <label className="form-field">Size name
              <input name={`sizeLabel-${index}`} value={size.label} maxLength={30} required
                onChange={(event) => changeSize(size.id, "label", event.target.value)} />
            </label>
            <label className="form-field">Extra price (₹)
              <input name={`sizePrice-${index}`} type="number" min="0" step="0.01" value={size.price} required
                onChange={(event) => changeSize(size.id, "price", event.target.value)} />
            </label>
            <button className="text-button" type="button" aria-label={`Remove size ${index + 1}`}
              onClick={() => setSizes((current) => current.filter((entry) => entry.id !== size.id))}>Remove</button>
          </div>
        ))}
        <button className="button button-secondary" type="button"
          onClick={() => setSizes((current) => [...current, { id: crypto.randomUUID(), label: "", price: "0" }])}>Add size</button>
      </fieldset>
      <div className="form-actions">
        <button className="button" type="submit" disabled={disabled}>{item ? "Save changes" : "Add item"}</button>
        <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
