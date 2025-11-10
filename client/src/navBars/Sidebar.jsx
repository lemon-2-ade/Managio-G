import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaHome,
  FaBox,
  FaShoppingCart,
  FaStore,
  FaWarehouse,
  FaSignOutAlt,
  FaUserCircle,
  FaUsers,
  FaHandshake,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaTag,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo258.svg";
import simply from "../assets/simply.svg";
const Sidebar = ({ toggleSidebar, isCollapsed, user, renderLoadingScree }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({
    inventory: false,
    purchase: false,
    sales: false,
  });

  useEffect(() => {
    // console.log("User Data:", user);
  }, [user]);

  const logout = () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/logout`, "_self");
  };

  const toggleExpandItem = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <div
      className={`h-screen text-gray-900 flex flex-col bg-gray-200 shadow-3xl rounded-e-md transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Sidebar Header */}
      <div className="w-full bg-gray-800 flex items-center justify-between p-4 h-[8.1%] transition-all duration-300 ease-in-out rounded-et-md">
        {isCollapsed && (
          <img
            src={simply}
            alt="Logo"
            className="  pt-2  transition-all duration-300 ease-in-out"
          />
        )}
        {!isCollapsed && (
          <img
            src={logoImg}
            alt="Logo"
            className=" p-2 pt-4 w-45 transition-all duration-300 ease-in-out"
          />
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-700 overflow-y-auto hide-scrollbar">
        <ul className="mt-12 flex flex-col gap-2 pt-2 m-1 gap-8">
          {/* Dashboard */}
          <li>
            <Link
              to="/"
              className="flex items-center text-lg p-3 rounded-md cursor-pointer bg-opacity-50 hover:bg-cyan-500 hover:text-gray-900 transition-all duration-300 ease-in-out"
            >
              <FaHome className="text-2xl text-cyan-300" />
              <span
                className={`text-cyan-300 transition-all duration-300 ease-in-out ${
                  isCollapsed
                    ? "opacity-0 w-0 overflow-hidden"
                    : "opacity-100 w-auto ml-5 "
                }`}
              >
                Dashboard
              </span>
            </Link>
          </li>

          {/* Inventory with dropdown */}
          <li>
            <div
              className="flex items-center justify-between text-lg p-3 rounded-md cursor-pointer bg-opacity-50 hover:bg-cyan-500 hover:text-gray-900 transition-all duration-300 ease-in-out"
              onClick={() => !isCollapsed && toggleExpandItem("inventory")}
            >
              <div className="flex items-center">
                <Link
                  to="product"
                  className="flex items-center rounded-md text-cyan-300"
                >
                  <FaClipboardList className="text-2xl text-cyan-300" />

                  <span
                    className={`text-cyan-300 transition-all duration-300 ease-in-out ${
                      isCollapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100 w-auto ml-5"
                    }`}
                  >
                    Inventory
                  </span>
                </Link>
              </div>
              {/* {!isCollapsed && (
                <ChevronRight 
                  size={18} 
                  className={`text-cyan-300 transition-transform duration-300 ${expandedItems.inventory ? 'rotate-90' : ''}`}
                />
              )} */}
            </div>

            {/* Inventory Submenu */}
            {/* {!isCollapsed && expandedItems.inventory && (
              <ul className="ml-8 mt-2 space-y-2">
                <li>
                  <Link to="product" className="flex items-center py-2 px-3 rounded-md text-cyan-300 hover:bg-gray-600 transition-all duration-200">
                    <FaBox className="mr-3" />
                    <span>Products</span>
                  </Link>
                </li>
                <li>
                  <Link to="/product/price-list" className="flex items-center py-2 px-3 rounded-md text-cyan-300 hover:bg-gray-600 transition-all duration-200">
                    <FaTag className="mr-3" />
                    <span>Price List</span>
                  </Link>
                </li>
              </ul>
            )} */}
          </li>

          {/* Purchase with dropdown */}
          <li>
            <div
              className="flex items-center justify-between text-lg p-3 rounded-md cursor-pointer bg-opacity-50 hover:bg-cyan-500 hover:text-gray-900 transition-all duration-300 ease-in-out"
              onClick={() => !isCollapsed && toggleExpandItem("purchase")}
            >
              <div className="flex items-center">
                <Link
                  to="purchase/order"
                  className="flex items-center rounded-md text-cyan-300"
                >
                  <FaShoppingCart className="text-2xl text-cyan-300" />
                  <span
                    className={`text-cyan-300 transition-all duration-300 ease-in-out ${
                      isCollapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100 w-auto ml-5"
                    }`}
                  >
                    Purchase
                  </span>
                </Link>
              </div>
              {!isCollapsed && (
                <ChevronRight
                  size={18}
                  className={`text-cyan-300 transition-transform duration-300 ${expandedItems.purchase ? "rotate-90" : ""}`}
                />
              )}
            </div>

            {/* Purchase Submenu */}
            {!isCollapsed && expandedItems.purchase && (
              <ul className="ml-8 mt-2 space-y-2">
                <li>
                  <Link
                    to="purchase/vendor"
                    className="flex items-center py-2 px-3 rounded-md text-cyan-300 hover:bg-gray-600 transition-all duration-200"
                  >
                    <FaHandshake className="mr-3" />
                    <span>Vendors</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="purchase/order"
                    className="flex items-center py-2 px-3 rounded-md text-cyan-300 hover:bg-gray-600 transition-all duration-200"
                  >
                    <FaFileInvoiceDollar className="mr-3" />
                    <span>Purchase Orders</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Sales with dropdown */}
          <li>
            <div
              className="flex items-center justify-between text-lg p-3 rounded-md cursor-pointer bg-opacity-50 hover:bg-cyan-500 hover:text-gray-900 transition-all duration-300 ease-in-out"
              onClick={() => !isCollapsed && toggleExpandItem("sales")}
            >
              <div className="flex items-center">
                <Link
                  to="sales/order"
                  className="flex items-center rounded-md text-cyan-300"
                >
                  <FaStore className="text-2xl text-cyan-300" />
                  <span
                    className={`text-cyan-300 transition-all duration-300 ease-in-out ${
                      isCollapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100 w-auto ml-5"
                    }`}
                  >
                    Sales
                  </span>
                </Link>
              </div>
              {!isCollapsed && (
                <ChevronRight
                  size={18}
                  className={`text-cyan-300 transition-transform duration-300 ${expandedItems.sales ? "rotate-90" : ""}`}
                />
              )}
            </div>

            {/* Sales Submenu */}
            {!isCollapsed && expandedItems.sales && (
              <ul className="ml-8 mt-2 space-y-2">
                <li>
                  <Link
                    to="sales/customer"
                    className="flex items-center py-2 px-3 rounded-md text-cyan-300 hover:bg-gray-600 transition-all duration-200"
                  >
                    <FaUsers className="mr-3" />
                    <span>Customers</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="sales/order"
                    className="flex items-center py-2 px-3 rounded-md text-cyan-300 hover:bg-gray-600 transition-all duration-200"
                  >
                    <FaFileInvoiceDollar className="mr-3" />
                    <span>Sales Orders</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Warehouse */}
          <li>
            <Link
              to="warehouse"
              className="flex items-center text-lg p-3 rounded-md cursor-pointer bg-opacity-50 hover:bg-cyan-500 hover:text-gray-900 transition-all duration-300 ease-in-out"
            >
              <FaWarehouse className="text-2xl text-cyan-300" />
              <span
                className={`text-cyan-300 transition-all duration-300 ease-in-out ${
                  isCollapsed
                    ? "opacity-0 w-0 overflow-hidden"
                    : "opacity-100 w-auto ml-5 "
                }`}
              >
                Warehouses
              </span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Sidebar Footer with User Profile */}
      <div className="relative bg-gray-700 text-gray-300 p-3 h-20 flex items-center">
        <button
          className="flex items-center justify-between w-full text-left rounded-md duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center space-x-3 w-full">
            <img
              src={user?.profileImg}
              alt="User"
              className="w-10 h-10 rounded-full border border-gray-500"
            />
            {!isCollapsed && (
              <div className="  w-full overflow-x-hidden hide-scroll">
                <p className="font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          {!isCollapsed &&
            (isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
        </button>

        {/* Dropdown Menu */}
        {isOpen && !isCollapsed && (
          <div className="absolute bottom-[110%] left-0 w-full bg-gray-600 border border-gray-700 rounded-md shadow-lg">
            <div className="p-2">
              <button
                className="flex items-center w-full p-2 text-left hover:bg-gray-500 rounded-md transition-colors"
                onClick={() => (window.location.href = "/profile")}
              >
                <FaUserCircle className="mr-2" /> Profile
              </button>
              <button
                className="flex items-center w-full p-2 text-left hover:bg-gray-500 rounded-md transition-colors"
                onClick={logout}
              >
                <FaSignOutAlt className="mr-2" /> Log out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div
        onClick={toggleSidebar}
        className="bottom-[10%]  w-full right-[-15px] bg-cyan-300 text-gray-900  w-10 h-10 flex items-center justify-center shadow-md cursor-pointer transition-transform duration-300 ease-in-out "
      >
        <FaArrowRight
          className={`${isCollapsed ? "rotate-0" : "rotate-180"}`}
        />
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
