import { useState } from "react";
import { nextStatus, statusLabels } from "../hooks/useOrders";
import { formatMoney } from "../lib/format";
import type { Order, OrderStatus } from "../types";

type Props = {
  orders: Order[];
  error: string;
  admin?: boolean;
  canEdit?: boolean;
  onAdvance?: (id: string) => boolean;
  onBrowse?: () => void;
};

const steps: OrderStatus[] = ["placed", "preparing", "ready", "completed"];

export default function OrdersPage({ orders, error, admin = false, canEdit = false, onAdvance, onBrowse }: Props) {
  const [notice, setNotice] = useState("");
  const sorted = [...orders].sort((a, b) => b.number - a.number);

  return (
    <section className="orders-page" aria-label={admin ? "Incoming orders" : "Order tracking"}>
      <div className="section-heading">
        <div>
          <h2>{admin ? "Incoming orders" : "Receipts & order status"}</h2>
          <p>{admin ? "Move each order forward as it is prepared." : "Orders saved in this browser. Status changes are made in Admin demo."}</p>
        </div>
        {onBrowse && <button className="button" type="button" onClick={onBrowse}>Order something else</button>}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="save-notice" role="status">{notice}</p>
      {sorted.length === 0 ? (
        <div className="empty-state"><h3>No orders yet.</h3><p>{admin ? "Placed orders will appear here." : "Place your first order from the menu."}</p></div>
      ) : (
        <div className="receipt-grid">
          {sorted.map((order) => (
            <article className="receipt" key={order.id} aria-label={`Order ${order.number}`}>
              <header className="receipt-heading">
                <div><p className="item-meta">bobbasnoida · Demo receipt</p><h3>Order #{order.number}</h3></div>
                <span className={`order-status status-${order.status}`}>{statusLabels[order.status]}</span>
              </header>
              <p className="receipt-customer"><strong>{order.details.customerName}</strong> · {order.details.orderType === "dine-in" ? `Dine-in, table ${order.details.tableNumber}` : "Takeaway"}</p>
              <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString("en-IN")}</time>
              <ol className="order-progress" aria-label="Order progress">
                {steps.map((step, index) => (
                  <li key={step} aria-current={step === order.status ? "step" : undefined}
                    className={index <= steps.indexOf(order.status) ? "reached" : ""}>
                    <span>{index + 1}</span>{statusLabels[step]}
                  </li>
                ))}
              </ol>
              <ul className="receipt-lines">
                {order.lines.map((line, index) => (
                  <li key={`${line.menuItemId}-${index}`}>
                    <span>{line.quantity} × {line.name}{line.sizeLabel ? ` · ${line.sizeLabel}` : ""}</span>
                    <strong>{formatMoney(line.unitPrice * line.quantity)}</strong>
                  </li>
                ))}
              </ul>
              <dl className="summary-totals"><div><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div></dl>
              {order.details.note && <p className="order-note"><strong>Note:</strong> {order.details.note}</p>}
              <p className="item-meta">Demo order · No payment collected</p>
              {admin && nextStatus[order.status] && (
                <button className="button" type="button" disabled={!canEdit}
                  onClick={() => {
                    if (onAdvance?.(order.id)) setNotice(`Order #${order.number}: ${statusLabels[nextStatus[order.status]!]}.`);
                  }}>
                  Mark {statusLabels[nextStatus[order.status]!]}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
