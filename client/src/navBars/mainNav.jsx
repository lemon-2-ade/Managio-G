import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileTabBar from "./MobileTabBar";
import { useState, useEffect } from "react";
import ProductLoadingScreen from "./loadingScreens/ProductLoadingScreen";
import DashboardLoadingScreen from "./loadingScreens/DashboardLoadingScreen";
import PurchaseOrderSkeleton from "./loadingScreens/PurchaseOrderLoading";
import CustomerLoadingScreen from "./loadingScreens/CustomerLoadingScreen";
import WarehouseLoadingSkeleton from "./loadingScreens/warehouseLoading";

export default function Bar({ user }) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarCollapsed((v) => !v);

  const renderLoadingScreen = () => {
    const path = location.pathname;

    if (path.includes("product")) return <ProductLoadingScreen />;
    if (path.includes("sales/order")) return <PurchaseOrderSkeleton />;
    if (path.includes("sales/customer")) return <CustomerLoadingScreen />;
    if (path.includes("purchase/vendor")) return <CustomerLoadingScreen />;
    if (path.includes("purchase/order")) return <PurchaseOrderSkeleton />;
    if (path.includes("warehouse")) return <WarehouseLoadingSkeleton />;
    return <DashboardLoadingScreen />;
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-background md:flex-row">
      {/* Sidebar — desktop only */}
      <div className="hidden shrink-0 md:block">
        <Sidebar user={user} toggleSidebar={toggleSidebar} isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Main content */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {loading ? renderLoadingScreen() : <Outlet />}
        </div>
        <MobileTabBar />
      </div>
    </div>
  );
}
