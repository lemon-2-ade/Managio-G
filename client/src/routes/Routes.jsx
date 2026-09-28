import { Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "@/pages/authpage";
import Bar from "@/navBars/mainNav"; // Layout Component
import Profile from "@/pages/profile";
import HomePage from "@/pages/home";
import ProductsPage from "@/pages/product";
import CustomerTable from "@/pages/salesCustomer";
import { PurchaseOrderDashboard } from "@/pages/purchaseDashboard";
import PurchaseVendor from "@/pages/purchaseVendors";
import WarehouseDetails from "@/pages/wareHousePage";
import InventoryManagement from "@/pages/landingpage";
import { SalesOrderDashboard } from "@/pages/salesorderDashboard";
import NotFound from "@/pages/NotFound";


export default function AppRoutes({ user, fetchUser }) {
  return (
    <Routes>
      <Route path="/" element={user?<Navigate to="/login"/>:<InventoryManagement user={user}/>} />
     
      <Route 
        path="/login" 
        element={user ? (user.isNewUser ? <Navigate to="/profile" /> : <Navigate to="/dashboard" />) : <LoginForm />} 
      />

      
      <Route
        path="/profile"
        element={user ? <Bar user={user} /> : <Navigate to="/login" />}
      >
        <Route index element={<Profile user={user} refreshUser={fetchUser} />} />
      </Route>


      <Route
        path="dashboard"
        element={user ? <Bar user={user} /> : <Navigate to="/login" />}
      >
        <Route index element={<HomePage user={user} />} />
        <Route path="product" element={<ProductsPage user={user}/>} />
        <Route path="sales/order" element={<SalesOrderDashboard user={user} />} />
        <Route path="sales/customer" element={<CustomerTable user={user}/>} />
        <Route path="purchase/order" element={<PurchaseOrderDashboard user={user} fetchUser={fetchUser}/>}/>  
        <Route path="purchase/vendor" element={<PurchaseVendor user={user}/>} />
        <Route path="warehouse" element={<WarehouseDetails user={user} />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
