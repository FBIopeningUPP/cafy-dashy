import { useState } from "react";
import type { MenuItem } from "../types";

type Props = {
    items: MenuItem[];
    cartCount: number,
    canAdd: boolean,
    error: string,
    onAdd: (item: MenuItem, sizeLabel?: string) => boolean;
    onViewCart: () => void;
    onManageMenu: () => void;
};

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
});

export default function MenuPage({
    items,
    cartCount,
    canAdd,
    error,
    onAdd,
    onViewCart,
    onManageMenu,
}: Props) {
    const [category, setCategory] = useState<string | null>(null);
    const [selectedSizes, setSelectedSizes] = useState<
        Record<string, string>
    >({});
    const [notice, setNotice] = useState("");

    const categories = [...new Set(items.map((item) => item.category))].sort(
        (a, b) => a.localeCompare(b),
    );

    const activeCategory = 
        category !== null && categories.includes(category) ? category : null;

    const visibleItems = items.filter(
        (item) => activeCategory === null || item.category === activeCategory,
    );

    return (
        <section className="menu-page" aria-labelledby="menu-title">
            <div className="section-heading">
                <div>
                    <h2 id="menu-title">On the menu</h2>
                    <p>Choose a drink or something to eat.</p>
                </div>

                <button
                    className="button"
                    type="button"
                    onClick={onViewCart}
                >
                    View order ({cartCount})
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

                  {items.length === 0 ? (
        <div className="empty-state">
          <h3>No items on the menu yet.</h3>
          <p>Start the demo by adding your own drinks and food.</p>
          <button className="button" type="button" onClick={onManageMenu}>Set up demo menu</button>
        </div>
      ) : (
        <>
          <div className="menu-filters" role="group" aria-label="Categories">
            <button
              className="nav-button"
              type="button"
              aria-pressed={activeCategory === null}
              onClick={() => setCategory(null)}
            >
              All items
            </button>

            {categories.map((entry) => (
              <button
                className="nav-button"
                key={entry}
                type="button"
                aria-pressed={activeCategory === entry}
                onClick={() => setCategory(entry)}
              >
                {entry}
              </button>
            ))}
          </div>

          <ul className="menu-grid">
            {visibleItems.map((item) => {
              const sizes = item.sizes ?? [];
              const size =
                sizes.find(
                  (entry) => entry.label === selectedSizes[item.id],
                ) ?? sizes[0];

              const price = item.price + (size?.extraPrice ?? 0);

              return (
                <li className="menu-card" key={item.id}>
                  <div className="menu-card-heading">
                    <span className="item-meta">{item.category}</span>
                    {!item.available && (
                      <span className="sold-out-badge">Sold out</span>
                    )}
                  </div>

                  <h3>{item.name}</h3>
                  <p className="menu-description">{item.description}</p>

                  {sizes.length > 0 && (
                    <label className="form-field">
                      Size
                      <select
                        value={size?.label ?? ""}
                        disabled={!item.available || !canAdd}
                        aria-label={`Size for ${item.name}`}
                        onChange={(event) =>
                          setSelectedSizes((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      >
                        {sizes.map((entry) => (
                          <option key={entry.label} value={entry.label}>
                            {entry.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <div className="menu-card-footer">
                    <span className="item-price">
                      {money.format(price / 100)}
                    </span>

                    <button
                      className="button"
                      type="button"
                      disabled={!item.available || !canAdd}
                      aria-label={`Add ${item.name} to your order`}
                      onClick={() => {
                        if (onAdd(item, size?.label)) {
                          setNotice(`${item.name} added to your order.`);
                        }
                      }}
                    >
                      {item.available ? "Add to order" : "Sold out"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
