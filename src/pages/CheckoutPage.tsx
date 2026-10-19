import { useRef, useState } from "react";
import { buildCartSummary } from "../lib/cartSummary";
import { formatMoney } from "../lib/format";
import type { CartLine, MenuItem, OrderDetails } from "../types";

type Props = {
  lines: CartLine[];
  items: MenuItem[];
  error: string;
  canSubmit: boolean;
  onSubmit: (details: OrderDetails, requestId: string) => boolean;
  onBack: () => void;
};

export default function CheckoutPage({ lines, items, error, canSubmit, onSubmit, onBack }: Props) {
  const [name, setName] = useState("");
  const [orderType, setOrderType] = useState<OrderDetails["orderType"]>("takeaway");
  const [table, setTable] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [requestId] = useState(() => crypto.randomUUID());
  const submitting = useRef(false);
  const summary = buildCartSummary(lines, items);

  function submit() {
    if (submitting.current || !canSubmit || !summary.canCheckout) return;
    if (!name.trim() || (orderType === "dine-in" && !table.trim())) {
      setFormError("Enter your name and, for dine-in, your table number.");
      return;
    }
    submitting.current = true;
    setFormError("");
    const saved = onSubmit({
      customerName: name, orderType,
      tableNumber: orderType === "dine-in" ? table : undefined, note,
    }, requestId);
    if (!saved) submitting.current = false;
  }

  return (
    <section className="checkout-page" aria-label="Checkout">
      <div className="cart-layout">
        <form className="item-form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <h2>Where should we serve it?</h2>
          <p>This is a demo order. No payment details are needed.</p>
          {(formError || error || summary.error) && (
            <p className="form-error" role="alert">{formError || error || summary.error}</p>
          )}
          {!summary.canCheckout && (
            <p className="form-error" role="alert">Your cart needs attention. Go back to review its items.</p>
          )}
          <fieldset className="form-fields" disabled={!canSubmit}>
            <legend>Order details</legend>
            <label className="form-field">Your name
              <input name="customerName" autoComplete="given-name" maxLength={80} value={name}
                onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="form-field">Order type
              <select name="orderType" value={orderType}
                onChange={(event) => setOrderType(event.target.value as OrderDetails["orderType"])}>
                <option value="takeaway">Takeaway</option>
                <option value="dine-in">Dine-in</option>
              </select>
            </label>
            {orderType === "dine-in" && (
              <label className="form-field">Table number
                <input name="tableNumber" maxLength={12} value={table}
                  onChange={(event) => setTable(event.target.value)} required />
              </label>
            )}
            <label className="form-field">Order note (optional)
              <textarea name="note" rows={3} maxLength={300} value={note}
                onChange={(event) => setNote(event.target.value)} />
            </label>
          </fieldset>
          <div className="form-actions">
            <button className="button" type="submit" disabled={!canSubmit || !summary.canCheckout}>
              Place demo order
            </button>
            <button className="button button-secondary" type="button" onClick={onBack}>Back to cart</button>
          </div>
        </form>
        <aside className="order-summary" aria-labelledby="checkout-summary">
          <h2 id="checkout-summary">Your order</h2>
          <ul className="receipt-lines">
            {summary.rows.map((row) => (
              <li key={row.id}>
                <span>{row.quantity} × {row.name}{row.sizeLabel ? ` · ${row.sizeLabel}` : ""}</span>
                <strong>{formatMoney(row.lineTotal)}</strong>
              </li>
            ))}
          </ul>
          <dl className="summary-totals"><div><dt>Total</dt><dd>{formatMoney(summary.total)}</dd></div></dl>
          <p>All prices shown are the final demo prices.</p>
        </aside>
      </div>
    </section>
  );
}
