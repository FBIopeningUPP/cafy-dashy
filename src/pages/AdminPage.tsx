import { useState } from "react";
import MenuItemForm from "../components/MenuItemForm";
import type { MenuItem } from "../types";

type Props = {
    items: MenuItem[];
    error: string;
    canEdit: boolean;
    onSave: (item: MenuItem ) => boolean;
    onRemove: (id: string) => boolean;
};

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
});

export default function AdminPage({
    items,
    error,
    canEdit,
    onSave,
    onRemove,
}: Props) {
    const [editor, setEditor] = useState<MenuItem | "new" | null>(null);
    const [notice, setNotice] = useState("");

    const categories = [...new Set(items.map((item) => item.category))].sort(
        (a, b) => a.localeCompare(b),
    );

    function handleSave(item: MenuItem): boolean {
        const saved = onSave(item);

        if (saved) {
            setNotice("Menu item saved.");
        }

        return saved;
    }

    function handleRemove(item: MenuItem) {
        const confirmed = window.confirm(
            `Delete "${item.name}" from the menu?`,
        );

        if (confirmed && onRemove(item.id)) {
            setNotice(`${item.name} deleted.`);
        }
    }

    function toggleAvailability(item: MenuItem) {
        const saved = onSave({
            ...item,
            available: !item.available,
        });

        if (saved) {
            setNotice(
                `${item.name} is now ${item.available ? "sold out" : "available"}.`,
            );
        }
    }
    
    return (
        <section className="admin-page" aria-labelledby="admin-title">
            <div className="section-heading">
                <div>
                    <h2 id="admin-title">Menu management</h2>
                    <p>Add items, set prices and manage availability.</p>
                </div>

                <button
                    className="button"
                    type="button"
                    disabled={!canEdit || editor !== null}
                    onClick={() => {
                        setNotice("");
                        setEditor("new");
                    }}
                >
                    Add item
                </button>
            </div>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <p className="save-notice" role="status">
                {notice}
            </p>

                  {editor !== null ? (
        <MenuItemForm
          key={editor === "new" ? "new" : editor.id}
          item={editor === "new" ? undefined : editor}
          categories={categories}
          disabled={!canEdit}
          onSave={handleSave}
          onCancel={() => setEditor(null)}
        />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>Your menu is empty.</h3>
          <p>Add your first item to get the café started.</p>
          <button className="button" type="button" disabled={!canEdit} onClick={() => setEditor("new")}>Add first item</button>
        </div>
      ) : (
        <ul className="admin-items">
          {items.map((item) => (
            <li className="admin-item" key={item.id}>
              <div className="admin-item-details">
                <p className="item-meta">
                  {item.category} · {item.available ? "Available" : "Sold out"}
                </p>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className="item-price">
                  {money.format(item.price / 100)}
                </p>
              </div>

              <div className="item-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={!canEdit}
                  aria-label={`Edit ${item.name}`}
                  onClick={() => {
                    setNotice("");
                    setEditor(item);
                  }}
                >
                  Edit
                </button>

                <button
                  className="button button-secondary"
                  type="button"
                  disabled={!canEdit}
                  aria-label={
                    item.available
                      ? `Mark ${item.name} sold out`
                      : `Make ${item.name} available`
                  }
                  onClick={() => toggleAvailability(item)}
                >
                  {item.available ? "Mark sold out" : "Make available"}
                </button>

                <button
                  className="button button-danger"
                  type="button"
                  disabled={!canEdit}
                  aria-label={`Delete ${item.name}`}
                  onClick={() => handleRemove(item)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
