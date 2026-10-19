import { useEffect, useRef, useState } from "react";
import AdminPage from "./pages/AdminPage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import { useMenu } from "./hooks/useMenu";
import { useCart } from "./hooks/useCart";
import { useOrders } from "./hooks/useOrders";
import type { OrderDetails } from "./types";

type View = "menu" | "order" | "staff" | "checkout" | "tracking";
const views: View[] = ["menu", "order", "staff", "checkout", "tracking"];

function currentView(): View {
  const value = window.location.hash.slice(1);
  return views.includes(value as View) ? value as View : "menu";
}

const content = {
    menu: {
        sticker: "bobbasnoida",
        title: "boba coffe and bites",
        description: "browse the menu and build order",
    },
    order: {
        sticker: "your selecton",
        title: "your order",
        description: "review ur selection before checkout",
    },
    staff: {
        sticker: "demo admin",
        title: "behind the counter",
        description: "manage menu items price and avaialblity"
    },
};

export default function App() {
  const [view, setView] = useState<View>(currentView);
  const [adminTab, setAdminTab] = useState<"menu" | "orders">("menu");
  const [notice, setNotice] = useState("");
  const menu = useMenu();
  const cart = useCart();
  const orders = useOrders();
  const heading = useRef<HTMLHeadingElement>(null);
  const previousView = useRef(view);
  const submitting = useRef(false);
  const activeContent = content[view === "checkout" || view === "tracking" ? "order" : view];
  const title = view === "checkout" ? "Checkout" : view === "tracking" ? "Order tracking" : activeContent.title;

  useEffect(() => {
    const sync = () => setView(currentView());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (previousView.current !== view) {
      heading.current?.focus();
      window.scrollTo(0, 0);
      previousView.current = view;
    }
  }, [view]);

  function navigate(next: View) {
    window.location.hash = next;
    setView(next);
  }

  function placeOrder(details: OrderDetails, requestId: string): boolean {
    if (submitting.current || !menu.canEdit || !cart.canEdit || !orders.canEdit) return false;
    submitting.current = true;
    const order = orders.placeOrder(details, cart.lines, menu.items, requestId);
    if (!order) {
      submitting.current = false;
      return false;
    }
    const cleared = cart.clearCart();
    setNotice(cleared
      ? `Order #${order.number} placed. Follow its progress below.`
      : `Order #${order.number} was saved, but the cart could not be cleared. Clear it before ordering again.`);
    submitting.current = false;
    navigate("tracking");
    return true;
  }

  function resetDemo() {
    if (!window.confirm("Delete all demo menu items, cart contents and orders in this browser?")) return;
    try {
      ["bobbasnoida.menu.v1", "bobbasnoida.card.v1", "bobbasnoida.orders.v1"].forEach((key) => localStorage.removeItem(key));
      window.location.hash = "staff";
      window.location.reload();
    } catch {
      setNotice("Could not reset browser storage. Please check your browser settings.");
    }
  }

  const navigation: { id: View; label: string }[] = [
    { id: "menu", label: "The menu" },
    { id: "order", label: `Your order (${cart.count})` },
    { id: "tracking", label: "Track orders" },
    { id: "staff", label: "Admin demo" },
  ];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById("main-content")?.focus(); }}>Skip to content</a>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => navigate("menu")} aria-label="bobbasnoida home">bobbas<span>noida</span></button>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button key={item.id} type="button" className="nav-button"
              aria-pressed={view === item.id || (view === "checkout" && item.id === "order")}
              onClick={() => navigate(item.id)}>{item.label}</button>
          ))}
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className={view === "menu" ? "hero menu-hero" : "hero hero-compact"} aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="sticker">{activeContent.sticker}</span>
            <h1 id="hero-title" ref={heading} tabIndex={-1}>{title}</h1>
            <p>{view === "order" ? `${cart.count} ${cart.count === 1 ? "item" : "items"} in your order.`
              : view === "checkout" ? "Choose dine-in or takeaway and place a demo order."
              : view === "tracking" ? "Your receipts and the latest preparation status."
              : activeContent.description}</p>
          </div>
          {view === "menu" && <div className="hero-art" aria-hidden="true"><div className="boba-cup"><span className="cup-straw" /><span className="cup-label">bobba</span><span className="cup-pearls">● ● ●</span></div></div>}
        </section>
        {view === "menu" && <MenuPage items={menu.items} cartCount={cart.count} canAdd={menu.canEdit && cart.canEdit}
          error={menu.error || cart.error} onAdd={cart.addItem} onViewCart={() => navigate("order")} onManageMenu={() => navigate("staff")} />}
        {view === "order" && <CartPage items={menu.items} cart={cart} menuError={menu.error}
          onBrowse={() => navigate("menu")} onCheckout={() => navigate("checkout")} />}
        {view === "checkout" && <CheckoutPage lines={cart.lines} items={menu.items}
          error={orders.error || menu.error || cart.error} canSubmit={orders.canEdit && menu.canEdit && cart.canEdit}
          onSubmit={placeOrder} onBack={() => navigate("order")} />}
        {view === "tracking" && <>
          {notice && <p className="success-notice" role="status">{notice}</p>}
          <OrdersPage orders={orders.orders} error={orders.error} onBrowse={() => { setNotice(""); navigate("menu"); }} />
        </>}
        {view === "staff" && <>
          <div className="admin-toolbar">
            <div className="admin-tabs" role="group" aria-label="Admin sections">
              <button className="nav-button" type="button" aria-pressed={adminTab === "menu"} onClick={() => setAdminTab("menu")}>Menu items</button>
              <button className="nav-button" type="button" aria-pressed={adminTab === "orders"} onClick={() => setAdminTab("orders")}>Orders ({orders.orders.filter((order) => order.status !== "completed").length})</button>
            </div>
            <button className="text-button" type="button" onClick={resetDemo}>Reset demo</button>
          </div>
          <p className="demo-note">Demo admin is open for trying the app. Data is saved in this browser only.</p>
          {adminTab === "menu" ? <AdminPage items={menu.items} error={menu.error} canEdit={menu.canEdit} onSave={menu.saveItem} onRemove={menu.removeItem} />
            : <OrdersPage orders={orders.orders} error={orders.error} admin canEdit={orders.canEdit} onAdvance={orders.advanceOrder} />}
        </>}
      </main>
      <footer className="site-footer"><strong>bobbasnoida</strong><span>Café ordering demo · No real payments</span></footer>
    </div>
  );
}
