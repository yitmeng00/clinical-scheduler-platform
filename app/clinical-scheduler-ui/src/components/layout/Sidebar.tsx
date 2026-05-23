import clsx from "clsx";
import { LogOut, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NAV_ITEMS, ROLE_LABELS } from "../../constants/navbar";
import { logout } from "../../features/auth/authSlice";
import {
  selectPendingCount,
  useGetLeaveRequestsQuery,
} from "../../features/leaves/leavesApi";
import ProfilePanel from "../../features/profile/ProfilePanel";
import {
  selectSwapPendingCount,
  useGetSwapRequestsQuery,
} from "../../features/swaps/swapsApi";
import type { StaffRole } from "../../types/auth";

function LeavePendingBadge() {
  const { data: leaves = [] } = useGetLeaveRequestsQuery();
  const count = selectPendingCount(leaves);
  if (count === 0) return null;
  return (
    <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
      {count}
    </span>
  );
}

function SwapPendingBadge() {
  const { data: swaps = [] } = useGetSwapRequestsQuery();
  const count = selectSwapPendingCount(swaps);
  if (count === 0) return null;
  return (
    <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
      {count}
    </span>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface SidebarContentProps {
  onNavClick?: () => void;
}

function SidebarContent({ onNavClick }: SidebarContentProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(user.role));

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-b-slate-200">
        <div className="w-7 h-7 flex items-center justify-center">
          <img src="/assets/logo.png" alt="Logo" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 leading-tight">
            CareShift
          </div>
          <div className="text-xs text-slate-400">Clinical Staff Scheduler</div>
        </div>
      </div>
      {/* Navbar */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2.5 text-sm transition-all no-underline",
                  isActive
                    ? "font-semibold bg-accent/10 text-accent"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-normal",
                )
              }
            >
              <Icon size={20} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.to === "/leaves" && <LeavePendingBadge />}
              {item.to === "/swaps" && <SwapPendingBadge />}
            </NavLink>
          );
        })}
      </nav>
      {/* User info + logout */}
      <div className="p-4 border-t border-t-slate-200">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2.5 flex-1 min-w-0 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-left p-1 -m-1"
            title="View profile"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-accent/10 text-accent">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {user.fullName}
              </div>
              <div className="text-xs text-slate-400 capitalize">
                {ROLE_LABELS[user.role as StaffRole]}
              </div>
            </div>
          </button>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
    </>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col no-print border-r border-r-slate-200 bg-white z-100 h-screen sticky top-0">
        <SidebarContent />
      </aside>
      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-100 lg:hidden flex flex-col bg-white">
          {/* Close button */}
          <button
            onClick={onMobileClose}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
          <SidebarContent onNavClick={onMobileClose} />
        </div>
      )}
    </>
  );
}
