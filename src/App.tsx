import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import MenuPage from "./pages/MenuPage";
import { useMenu } from "./hooks/useMenu";
import { useCart } from "./hooks/useCart";

type View = "menu" | "order" | "staff";

const navigation: {id: View; label: string} [] = [
    { id: "menu", label: "the menu"},
    { id: "order", label: "your order"},
    { id: "staff", label: "admin demo"},
];

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
  const [view, setView] = useState<View>("menu");
  const menu = useMenu();
  const cart = useCart();
  const activeContent = content[view];

  return (
    <div className="app-shell">
      <header className="site-header">
        <button
          className="brand"
          type="button"
          onClick={() => setView("menu")}
          aria-label="bobbasnoida home"
        >
          bobbas<span>noida</span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-button"
              aria-pressed={view === item.id}
              onClick={() => setView(item.id)}
            >
              {item.label}
              {item.id === "order" && ` (${cart.count})`}
            </button>
          ))}
        </nav>
      </header>

      <main id="main-content">
        <section
          className={
            view === "menu" ? "hero menu-hero" : "hero hero-compact"
          }
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <span className="sticker">{activeContent.sticker}</span>
            <h1 id="hero-title">{activeContent.title}</h1>
            <p>
              {view === "order"
                ? `${cart.count} ${cart.count === 1 ? "item" : "items"} in your order.`
                : activeContent.description}
            </p>
          </div>

          {view === "menu" && (
            <div className="hero-art" aria-hidden="true">
              <div className="boba-cup">
                <span className="cup-straw" />
                <span className="cup-label">bobba</span>
                <span className="cup-pearls">● ● ●</span>
              </div>
            </div>
          )}
        </section>

        {view === "menu" && (
          <MenuPage
            items={menu.items}
            cartCount={cart.count}
            canAdd={menu.canEdit && cart.canEdit}
            error={menu.error || cart.error}
            onAdd={cart.addItem}
            onViewCart={() => setView("order")}
          />
        )}

        {view === "staff" && (
          <AdminPage
            items={menu.items}
            error={menu.error}
            canEdit={menu.canEdit}
            onSave={menu.saveItem}
            onRemove={menu.removeItem}
          />
        )}
      </main>

      <footer className="site-footer">
        <strong>bobbasnoida</strong>
      </footer>
    </div>
  );
}
