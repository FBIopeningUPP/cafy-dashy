import type { Order, OrderDetails, OrderLine } from "../types";

const ORDERS_KEY = "bobbasnoida.orders.v1";

const statuses = ["placed", "preparing", "ready", "completed"];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isMoney(value: unknown): value is number {
    return (
        typeof value === "number" &&
        Number.isSafeInteger(value) &&
        value >= 0
    );
}

function isOrderLine(value: unknown): value is OrderLine {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.menuItemId === "string" &&
        value.menuItemId.trim().length > 0 &&
        typeof value.name === "string" &&
        value.name.trim().length > 0 &&
        isMoney(value.unitPrice) &&
        typeof value.quantity === "number" &&
        Number.isInteger(value.quantity) &&
        value.quantity >= 1 &&
        value.quantity <= 99 &&
        (value.sizeLabel === undefined ||
            (typeof value.sizeLabel === "string" &&
                value.sizeLabel.trim().length > 0))
    );
}

function isOrderDetails(value: unknown): value is OrderDetails {
    if (!isRecord(value)) {
        return false;
    }

    return (
    typeof value.customerName === "string" &&
    value.customerName.trim().length > 0 &&
    typeof value.note === "string" &&
    (value.orderType === "dine-in" || value.orderType === "takeaway") &&
    (value.tableNumber === undefined ||
      typeof value.tableNumber === "string") &&
    (value.orderType !== "dine-in" ||
      (typeof value.tableNumber === "string" &&
        value.tableNumber.trim().length > 0))
    );
}

function isOrder(value: unknown): value is Order {
  if (
    !isRecord(value) || !isOrderDetails(value.details) ||
    !Array.isArray(value.lines) || value.lines.length === 0 ||
    !value.lines.every(isOrderLine)
  ) return false;

  return (
    typeof value.id === "string" && value.id.trim().length > 0 &&
    isMoney(value.number) && value.number > 0 &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    typeof value.status === "string" && statuses.includes(value.status) &&
    isMoney(value.total) &&
    value.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0) === value.total
  );
}

function validateOrders(value: unknown): asserts value is Order[] {
  if (!Array.isArray(value) || !value.every(isOrder)) {
    throw new Error("The saved orders contain invalid data. Reset the demo in Admin to start again.");
  }
  if (
    new Set(value.map((order) => order.id)).size !== value.length ||
    new Set(value.map((order) => order.number)).size !== value.length
  ) throw new Error("The saved orders contain duplicate identifiers.");
}

export function loadOrders(): Order[] {
  const saved = localStorage.getItem(ORDERS_KEY);
  if (saved === null) return [];
  const orders: unknown = JSON.parse(saved);
  validateOrders(orders);
  return orders;
}

export function saveOrders(orders: Order[]): void {
  validateOrders(orders);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
