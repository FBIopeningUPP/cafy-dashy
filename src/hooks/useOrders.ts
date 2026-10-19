import { useEffect, useRef, useState } from "react";
import { loadOrders, saveOrders } from "../lib/orderStorage";
import { buildCartSummary } from "../lib/cartSummary";
import type { CartLine, MenuItem, Order, OrderDetails, OrderStatus } from "../types";

export const statusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
};

export const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "preparing",
  preparing: "ready",
  ready: "completed",
};

type State = { orders: Order[]; error: string; canEdit: boolean };

function readState(): State {
  try {
    return { orders: loadOrders(), error: "", canEdit: true };
  } catch {
    return {
      orders: [],
      error: "Could not read saved orders. Reset the demo in Admin to start again.",
      canEdit: false,
    };
  }
}

export function useOrders() {
  const [state, setState] = useState<State>(readState);
  const current = useRef(state);

  function publish(next: State) {
    current.current = next;
    setState(next);
  }

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === "bobbasnoida.orders.v1" || event.key === null) {
        const next = readState();
        current.current = next;
        setState(next);
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function fail(message: string): null {
    publish({ ...current.current, error: message });
    return null;
  }

  function commit(orders: Order[]): boolean {
    try {
      saveOrders(orders);
      publish({ orders, error: "", canEdit: true });
      return true;
    } catch {
      fail("Could not save the order. Your cart is unchanged. Please try again.");
      return false;
    }
  }

  function placeOrder(
    details: OrderDetails,
    lines: CartLine[],
    menu: MenuItem[],
    requestId: string,
  ): Order | null {
    if (!current.current.canEdit) return null;
    const existing = current.current.orders.find((order) => order.id === requestId);
    if (existing) return existing;

    const summary = buildCartSummary(lines, menu);
    if (!summary.canCheckout) return fail("Review your cart before placing the order.");
    if (!details.customerName.trim() || details.customerName.trim().length > 80) {
      return fail("Enter your name, using up to 80 characters.");
    }
    if (details.orderType !== "dine-in" && details.orderType !== "takeaway") {
      return fail("Choose dine-in or takeaway.");
    }
    if (details.orderType === "dine-in" && !details.tableNumber?.trim()) {
      return fail("Enter your table number for dine-in.");
    }
    if (details.note.length > 300 || (details.tableNumber?.length ?? 0) > 12) {
      return fail("Keep the note under 300 characters and table number under 12.");
    }

    const number = current.current.orders.reduce(
      (highest, order) => Math.max(highest, order.number), 1000,
    ) + 1;
    const order: Order = {
      id: requestId,
      number,
      createdAt: new Date().toISOString(),
      status: "placed",
      details: {
        customerName: details.customerName.trim(),
        orderType: details.orderType,
        tableNumber: details.orderType === "dine-in" ? details.tableNumber?.trim() : undefined,
        note: details.note.trim(),
      },
      lines: summary.orderLines,
      total: summary.total,
    };
    return commit([order, ...current.current.orders]) ? order : null;
  }

  function advanceOrder(id: string): boolean {
    if (!current.current.canEdit) return false;
    const order = current.current.orders.find((entry) => entry.id === id);
    if (!order || !nextStatus[order.status]) return false;
    const status = nextStatus[order.status]!;
    return commit(current.current.orders.map((entry) =>
      entry.id === id ? { ...entry, status } : entry,
    ));
  }

  return { ...state, placeOrder, advanceOrder };
}
