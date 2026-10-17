import { useState } from "react";

type View = "menu" | "order" | "staff";

const navigation: { id: View, label: string }[] = [
    { id: "menu", label: "The menu"},
    { id: "order", label: "Your Order"},
    { id: "staff", label: "Staff demo"},
];

const content = {
    menu: {
        sticker: "Freshy sips",
        title: "Cafe",
        description: "little sweet little extra ur best drinks here",
    },
    order: {
        sticker: "your food lineup",
        title: "best food",
        description: "your selected food appears here",
    },
    staff: {
        sticker: "behind the counter",
        title: "start with stuff",
        description: "manage ur incoming orders and update their status",
    },
};

export default function App() {
    const [view, setView] = useState<View>("menu");
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
                        </button>
                    ))}
                </nav>
            </header>
            <main id="main-content">
                <section className="hero" aria-labelledby="hero-title">
                    <div className="hero-copy">
                        <span className="sticker">{activeContent.sticker}</span>
                        <h1 id="hero-title">{activeContent.title}</h1>
                        <p>{activeContent.description}</p>
                    </div>

                    <div className="hero-art" aria-hidden="true">
                        <div className="boba-cup">
                            <span className="cup-straw" />
                            <span className="cup-label">bobba</span>
                            <span className="cup-pearls">● ● ●</span>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="site-footer">
                made for the peoples
            </footer>
        </div>
    );
}