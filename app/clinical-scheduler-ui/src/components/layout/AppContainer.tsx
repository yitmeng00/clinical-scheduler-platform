import { Menu } from "lucide-react";
import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAppSelector } from "../../app/hooks";
import { useSignalR } from "../../signalr/useSignalR";

export default function AppContainer() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);
  useSignalR();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {/* Floating hamburger — mobile only, hidden when menu is open */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-2 left-3 z-95 lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      )}
      <main className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
