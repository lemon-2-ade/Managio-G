import { LayoutDashboard, ClipboardList, ShoppingCart, Store, Warehouse } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const TABS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, match: (p) => p === "/dashboard" },
  { to: "product", label: "Stock", icon: ClipboardList, match: (p) => p.startsWith("/dashboard/product") },
  { to: "purchase/order", label: "Buy", icon: ShoppingCart, match: (p) => p.startsWith("/dashboard/purchase") },
  { to: "sales/order", label: "Sell", icon: Store, match: (p) => p.startsWith("/dashboard/sales") },
  { to: "warehouse", label: "Storage", icon: Warehouse, match: (p) => p.startsWith("/dashboard/warehouse") },
];

export default function MobileTabBar() {
  const { pathname } = useLocation();

  return (
    <nav
      className="flex shrink-0 items-stretch justify-around border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {TABS.map(({ to, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={label}
            to={to}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10.5px] font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon size={19} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
