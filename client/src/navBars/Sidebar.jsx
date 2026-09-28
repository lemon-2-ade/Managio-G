import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Store,
  Warehouse,
  Users,
  Handshake,
  FileText,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import logoMark from "../assets/simply.svg";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: (p) => p === "/dashboard" },
  { to: "product", label: "Inventory", icon: ClipboardList, match: (p) => p.startsWith("/dashboard/product") },
  { to: "purchase/order", label: "Purchases", icon: ShoppingCart, match: (p) => p.startsWith("/dashboard/purchase") },
  { to: "sales/order", label: "Sales", icon: Store, match: (p) => p.startsWith("/dashboard/sales") },
  { to: "warehouse", label: "Warehouse", icon: Warehouse, match: (p) => p.startsWith("/dashboard/warehouse") },
];

const PURCHASE_SUBLINKS = [
  { to: "purchase/vendor", label: "Vendors", icon: Handshake },
  { to: "purchase/order", label: "Purchase Orders", icon: FileText },
];

const SALES_SUBLINKS = [
  { to: "sales/customer", label: "Customers", icon: Users },
  { to: "sales/order", label: "Sales Orders", icon: FileText },
];

const Sidebar = ({ toggleSidebar, isCollapsed, user }) => {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const subLinksFor = (label) => {
    if (label === "Purchases") return PURCHASE_SUBLINKS;
    if (label === "Sales") return SALES_SUBLINKS;
    return null;
  };

  return (
    <div
      className={`flex h-full flex-col bg-[#0a1a20] transition-[width] duration-200 ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
        <img src={logoMark} alt="" className="h-6 w-6 shrink-0" />
        {!isCollapsed && (
          <span className="truncate text-[15px] font-semibold tracking-tight text-white">
            Managio
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 hide-scrollbar">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, match }) => {
            const active = match(pathname);
            const subLinks = !isCollapsed ? subLinksFor(label) : null;
            return (
              <li key={label}>
                <Link
                  to={to}
                  title={isCollapsed ? label : undefined}
                  className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-teal-500/15 text-teal-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <Icon size={17} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{label}</span>}
                </Link>
                {subLinks && active && (
                  <ul className="ml-[1.55rem] mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                    {subLinks.map((sub) => {
                      const subActive = pathname.endsWith(sub.to);
                      return (
                        <li key={sub.to}>
                          <Link
                            to={sub.to}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] transition-colors ${
                              subActive
                                ? "text-teal-300 font-medium"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            <sub.icon size={13} className="shrink-0" />
                            <span className="truncate">{sub.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-1">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
        >
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* User footer */}
      <div className="relative border-t border-white/10 p-3">
        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-white/5"
        >
          {user?.profileImg ? (
            <img
              src={user.profileImg}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[12px] font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-slate-200">
                  {user?.name || "Account"}
                </p>
                <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
              </div>
              {isMenuOpen ? (
                <ChevronUp size={15} className="shrink-0 text-slate-500" />
              ) : (
                <ChevronDown size={15} className="shrink-0 text-slate-500" />
              )}
            </>
          )}
        </button>

        {isMenuOpen && !isCollapsed && (
          <div className="absolute bottom-[calc(100%+4px)] left-3 right-3 overflow-hidden rounded-lg border border-white/10 bg-[#0f242c] shadow-xl">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-slate-300 transition-colors hover:bg-white/5"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserCircle size={16} /> Profile
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-red-400 transition-colors hover:bg-white/5"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

export default Sidebar;
