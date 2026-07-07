import { useState } from "react";
import { SocialConnections } from "./pages/SocialConnections";
import { ContentQueue } from "./pages/ContentQueue";

type View = "dashboard" | "connections" | "queue";

export default function App() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">AF</span>
          <div>
            <div className="brand-name">Anthony AI Factory</div>
            <div className="brand-sub">Command Center</div>
          </div>
        </div>
        <nav aria-label="Primary">
          <button
            className={view === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={view === "connections" ? "nav-item active" : "nav-item"}
            onClick={() => setView("connections")}
          >
            Social Connections
          </button>
          <button
            className={view === "queue" ? "nav-item active" : "nav-item"}
            onClick={() => setView("queue")}
          >
            Content Queue
          </button>
        </nav>
        <div className="sidebar-foot">Step 1 foundation · demo mode</div>
      </aside>
      <main className="content">
        {view === "dashboard" && <Dashboard onOpenConnections={() => setView("connections")} />}
        {view === "connections" && <SocialConnections />}
        {view === "queue" && <ContentQueue />}
      </main>
    </div>
  );
}

function Dashboard({ onOpenConnections }: { onOpenConnections: () => void }) {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="page-sub">AI operations command center — foundation build.</p>
      </header>
      <div className="panel">
        <h2>Under construction</h2>
        <p>
          The command center is being built one proven capability at a time. Step 1 establishes
          the application shell and the Social Connections area, backed by a mock Instagram
          provider.
        </p>
        <p>No AI agents, publishing, or analytics are active yet.</p>
        <button className="btn btn-primary" onClick={onOpenConnections}>
          Open Social Connections
        </button>
      </div>
    </div>
  );
}
