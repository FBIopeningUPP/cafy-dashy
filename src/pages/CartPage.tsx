import { buildCartSummary } from "../lib/cartSummary";
import type { useCart } from "../hooks/useCart";
import type { MenuItem } from "../types";

type Props = {
    items: MenuItem[];
    cart: ReturnType<typeof useCart>;
    menuError: string;
    onBrowse: () => void;
    onCheckout?: () => void;
};

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
});

export default function CartPage({
    items,
    cart,
    menuError,
    onBrowse,
    onCheckout,
}: Props) {
    const summary = buildCartSummary(cart.lines, items);
    const error = cart.error || menuError || summary.error;

    function clearCart() {
        if (window.confirm("clear your saved cart and start again")) {
            cart.clearCart();
        }
    }

    return (
    <section className="cart-page" aria-label="Shopping cart">
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {(cart.lines.length > 0 || !cart.canEdit) && (
        <div className="cart-toolbar">
          <button
            className="button button-secondary"
            type="button"
            onClick={clearCart}
          >
            Clear cart
          </button>
        </div>
      )}

      {cart.lines.length === 0 ? (
        <div className="empty-state">
          <h2>Your order is empty.</h2>
          <p>Find a drink or something to eat on the menu.</p>
          <button className="button" type="button" onClick={onBrowse}>
            Browse menu
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-items">
            {summary.rows.map((row) => (
              <li className="cart-item" key={row.id}>
                <div className="cart-item-details">
                  <h2>{row.name}</h2>

                  {row.sizeLabel && (
                    <p className="item-meta">{row.sizeLabel}</p>
                  )}

                  <p>{money.format(row.unitPrice / 100)} each</p>

                  {row.error && (
                    <p className="form-error">{row.error}</p>
                  )}

                  <div
                    className="quantity-controls"
                    role="group"
                    aria-label={`Quantity for ${row.name}`}
                  >
                    <button
                      className="quantity-button"
                      type="button"
                      disabled={!cart.canEdit || row.quantity <= 1}
                      aria-label={`Decrease quantity of ${row.name}`}
                      onClick={() =>
                        cart.setQuantity(row.id, row.quantity - 1)
                      }
                    >
                      −
                    </button>

                    <span>{row.quantity}</span>

                    <button
                      className="quantity-button"
                      type="button"
                      disabled={!cart.canEdit || row.quantity >= 99}
                      aria-label={`Increase quantity of ${row.name}`}
                      onClick={() =>
                        cart.setQuantity(row.id, row.quantity + 1)
                      }
                    >
                      +
                    </button>

                    <button
                      className="text-button"
                      type="button"
                      disabled={!cart.canEdit}
                      aria-label={`Remove ${row.name}`}
                      onClick={() => cart.removeItem(row.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <strong className="cart-line-total">
                  {Number.isSafeInteger(row.lineTotal)
                    ? money.format(row.lineTotal / 100)
                    : "—"}
                </strong>
              </li>
            ))}
          </ul>

          <aside className="order-summary" aria-labelledby="summary-title">
            <h2 id="summary-title">Order summary</h2>

            <dl className="summary-totals">
              <div>
                <dt>Items</dt>
                <dd>{cart.count}</dd>
              </div>

              <div>
                <dt>Total</dt>
                <dd>
                  {Number.isSafeInteger(summary.total)
                    ? money.format(summary.total / 100)
                    : "—"}
                </dd>
              </div>
            </dl>

            <p>Demo order. No payment will be collected.</p>

            {!summary.canCheckout && (
              <p className="form-error">
                Resolve the item errors before continuing.
              </p>
            )}

            {onCheckout && (
              <button
                className="button"
                type="button"
                disabled={
                  !summary.canCheckout ||
                  !cart.canEdit ||
                  Boolean(menuError)
                }
                onClick={onCheckout}
              >
                Continue to checkout
              </button>
            )}

            <button
              className="button button-secondary"
              type="button"
              onClick={onBrowse}
            >
              Continue browsing
            </button>
          </aside>
        </div>
      )}
    </section>
    );
}