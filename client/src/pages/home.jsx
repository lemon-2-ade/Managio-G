import { useEffect, useState, createContext, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  Bell,
  Package,
  Info,
  Menu,
  Phone,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Settings,
  BarChart3,
  ShoppingCart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";
import { Factory } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const SidebarContext = createContext({
  sidebarOpen: false,
  toggleSidebar: () => {},
});

export const SidebarProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

const navItems = [
  { title: "Dashboard", icon: <Home size={20} />, content: "dashboard" },
  {
    title: "Getting Started",
    icon: <Info size={20} />,
    content: "getting-started",
  },
  {
    title: "Announcements",
    icon: <Bell size={20} />,
    content: "announcements",
  },
];

export default function Dashboard({ user }) {
  const { sidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const [userData, setUserData] = useState({ name: "", companyName: "" });
  const [isMobile, setIsMobile] = useState(false);
  const [activeContent, setActiveContent] = useState("dashboard");
  const [bought, setBought] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [cust, setCust] = useState([]);
  const [sales, setSales] = useState([]);
  const [product, setProduct] = useState([]);
  const [supplier, setSuppliers] = useState([]);
  const [profit, setProfit] = useState([]);
  const [totalSales, setTotalSales] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((user) =>
        setUserData({
          name: user.name || "User",
          companyName: user.companyName || "MedCorp",
        })
      )
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setUserData({ name: "Demo User", companyName: "MedCorp" });
      });
  }, []);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  // For demonstration, using static data
  const filterDataByDate = (data) => {
    if (!startDate || !endDate) return data;
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const fetchItemsDetail = async (fromDate, toDate) => {
    try {
      if (!user?._id) return;
      const userID = user._id;
      // console.log("from:", fromDate, "to:", toDate);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/items/top-bought`,
        {
          params: {
            fromDate,
            toDate,
            userID,
          },
        }
      );
      const res2 = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/items/top-sold`,
        {
          params: {
            fromDate,
            toDate,
            userID,
          },
        }
      );
      const res3 = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/customer/all-customers`,
        {
          params: { userID: user._id },
        }
      );

      const res4 = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/items/all-items`,
        {
          params: { userID: user._id },
        }
      );
      const res5 = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/customer/top-customers`,
        {
          params: { userID: user._id },
        }
      );
      const res6 = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/supplier/top-suppliers`,
        {
          params: {
            fromDate,
            toDate,
            userID,
          },
        }
      );
      const res7 = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/sales/profit-loss`,
        {
          params: {
            fromDate,
            toDate,
            userID,
          },
        }
      );
      const res8 = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/sales/total-sales`,
        {
          params: {
            fromDate,
            toDate,
            userID,
          },
        }
      );

      // console.log(res.data);
      // console.log(res2.data);
      // console.log(res3.data);
      // console.log(res4.data);
      // console.log("Responce: ", res5.data);
      // console.log("Responce1: ", res6.data);
      // console.log("Responce2: ", res7.data);
      // console.log("Responce3: ", res8.data);

      if (res.data) {
        setBought(res.data.topBoughtItems);
        setSales(res2.data.topSoldItems);
        setCust(res3.data);
        setProduct(res4.data);
        setCustomersData(res5.data);
        setSuppliers(res6.data);
        setProfit(res7.data);
        setTotalSales(res8.data);
      } else {
        setBought([]);
        setSales([]);
        setCust([]);
        setProduct([]);
        setCustomersData([]);
        setSuppliers([]);
        setProfit([]);
        setTotalSales([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setBought([]);
      setSales([]);
      setCust([]);
      setProduct([]);
      setCustomersData([]);
      setSuppliers([]);
      setProfit([]);
      setTotalSales([]);
    }
  };

  const handleSubmit = () => {
    const fromDate = startDate ? new Date(startDate).toISOString() : null;
    const toDate = endDate ? new Date(endDate).toISOString() : null;
    // console.log(startDate);
    fetchItemsDetail(fromDate, toDate);
  };

  useEffect(() => {
    handleSubmit();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSubmit();
    }, 60000); // Fetch data every 60 seconds

    return () => clearInterval(interval);
  }, [startDate, endDate, user]);

  const summaryCards = [
    {
      title: "Customers",
      value: cust.length,
      icon: <Users size={24} />,
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    {
      title: "Products",
      value: product.length,
      icon: <ShoppingBag size={24} />,
      color: "bg-gradient-to-br from-pink-400 to-purple-600",
    },
    {
      title: "Sales Amt.",
      value:
        (
          Number(totalSales[0]?.totalSales) - Number(totalSales[0]?.totalTax)
        ).toFixed(2) || 0,
      icon: <DollarSign size={24} />,
      color: "bg-gradient-to-br from-green-400 to-green-600",
    },
    {
      title: "Profit/Loss",
      value: (profit?.profit - profit?.loss).toFixed(2) || 0,
      icon: <TrendingUp size={24} />,
      color: "bg-gradient-to-br from-purple-400 to-indigo-600",
    },
  ];

  // Render different content based on active section
  const renderContent = () => {
    switch (activeContent) {
      case "dashboard":
        return (
          <>
            <div className="mb-8">
              {/* Date Filter */}
              <div className="flex flex-wrap items-center gap-4 bg-white shadow-md p-4 rounded-xl mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">From:</span>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => handleDateChange(date, endDate)}
                    className="border px-3 py-2 rounded-lg"
                    placeholderText="Select start date"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">To:</span>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => handleDateChange(startDate, date)}
                    className="border px-3 py-2 rounded-lg"
                    placeholderText="Select end date"
                  />
                </div>
                <Button variant="outline" onClick={handleSubmit}>
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDateChange(null, null);
                    handleSubmit();
                  }}
                >
                  Clear Filters
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, index) => (
                  <Card
                    key={index}
                    className="shadow-md overflow-hidden border-0 rounded-xl"
                  >
                    <div className={`${card.color} text-white p-4`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-medium opacity-80">
                            {card.title}
                          </p>
                          <h2 className="text-2xl font-bold mt-1">
                            {card.value}
                          </h2>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-full">
                          {card.icon}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              {/* Top Selling Products */}
              <Card className="shadow-md rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 py-4 px-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-blue-700">
                    <ShoppingCart size={22} className="text-blue-600" />
                    TOP 5 PURCHASES
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 mt-10">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filterDataByDate(bought)}
                        layout="horizontal"
                        margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis type="number" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Bar
                          dataKey="amt"
                          fill="#3b82f6"
                          barSize={30}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-teal-100 py-4 px-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-teal-700">
                    <Factory size={22} className="text-teal-600" />
                    TOP 5 VENDORS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 mt-10">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={supplier}
                        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#14b8a6"
                          strokeWidth={3}
                          dot={{ fill: "#14b8a6", r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card className="shadow-md rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100 py-4 px-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-teal-700">
                    <ShoppingBag size={22} className="text-teal-600" />
                    TOP 5 SALES PRODUCT
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 mt-10">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filterDataByDate(sales)}
                        layout="horizontal"
                        margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis type="number" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Bar
                          dataKey="amt"
                          fill="#22c55e"
                          barSize={30}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-yellow-100 py-4 px-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-yellow-700">
                    <TrendingUp size={22} className="text-yellow-600" />
                    TOP 5 CUSTOMERS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 mt-10">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={customersData}
                        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: "#f59e0b", r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );
      case "getting-started":
        return (
          <Card className="shadow-lg rounded-xl overflow-hidden border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Info size={24} />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <p className="text-gray-600 text-lg">
                  Welcome to Med Dashboard! Follow these steps to get started:
                </p>

                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 text-lg mb-2">
                      Set up your inventory
                    </h3>
                    <p className="text-gray-600">
                      Add your medical products to start tracking inventory
                      levels and set up automatic alerts for low stock.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 text-lg mb-2">
                      Add your customers
                    </h3>
                    <p className="text-gray-600">
                      Create customer profiles to track sales history,
                      preferences, and manage relationships more effectively.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800 text-lg mb-2">
                      Record your first sale
                    </h3>
                    <p className="text-gray-600">
                      Start recording sales to generate reports, analyze trends,
                      and make data-driven decisions.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-md">
                    <span className="mr-2">Watch Tutorial</span>
                    <BarChart3 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "announcements":
        return (
          <Card className="shadow-lg rounded-xl overflow-hidden border-0">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Bell size={24} />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">
                      New Feature: Batch Tracking
                    </h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                      New
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    We've added batch tracking capabilities to help you manage
                    expiration dates and recalls more effectively.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Bell size={14} className="mr-1 text-orange-500" />
                    <span>March 5, 2025</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">
                      System Maintenance
                    </h3>
                    <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-medium">
                      Important
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    Scheduled maintenance will occur on March 12, 2025 from 2:00
                    AM to 4:00 AM IST. The system may be unavailable during this
                    time.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Bell size={14} className="mr-1 text-orange-500" />
                    <span>March 2, 2025</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">
                      Price Updates
                    </h3>
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                      Update
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    We've updated our pricing structure to better reflect
                    current market conditions. Please review your product
                    prices.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Bell size={14} className="mr-1 text-orange-500" />
                    <span>February 28, 2025</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "updates":
        return (
          <Card className="shadow-lg rounded-xl overflow-hidden border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Package size={24} />
                Software Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-xl text-gray-800">
                      Version 2.4.0
                    </h3>
                    <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                      Latest
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <Package size={16} className="mr-2 text-purple-500" />
                    Released March 1, 2025
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span>Added batch tracking functionality</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span>Improved dashboard performance</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span>Fixed customer report generation issues</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span>Added more export options for reports</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-xl text-gray-800">
                      Version 2.3.2
                    </h3>
                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                      Previous
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <Package size={16} className="mr-2 text-purple-500" />
                    Released February 15, 2025
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span>Bug fixes for inventory management</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span>Improved mobile responsiveness</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span>Added new customer import tools</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full shadow-md">
                    View All Updates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button
          onClick={toggleSidebar}
          className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <Menu className="text-white" />
        </Button>
      </div>

      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed h-full bg-white shadow-xl transition-all duration-300 ease-in-out z-50 ${
          sidebarOpen ? "left-0" : "-left-64"
        } w-64`}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            Med Dashboard
          </h2>
        </div>
        <div className="py-4 ">
          <ul className="space-y-1">
            {[
              {
                name: "Dashboard",
                icon: <Home size={18} />,
                content: "dashboard",
              },
              {
                name: "Products",
                icon: <ShoppingBag size={18} />,
                content: "getting-started",
              },
              {
                name: "Customers",
                icon: <Users size={18} />,
                content: "announcements",
              },
              {
                name: "Reports",
                icon: <TrendingUp size={18} />,
                content: "updates",
              },
              {
                name: "Settings",
                icon: <Settings size={18} />,
                content: "dashboard",
              },
            ].map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveContent(item.content);
                    if (isMobile) toggleSidebar();
                  }}
                  className={`flex items-center px-6 py-3 text-sm font-medium ${
                    activeContent === item.content
                      ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      >
        <header className="w-full bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-8xl mx-auto py-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-cyan-900 text-transparent bg-clip-text drop-shadow-md">
                    Hello, {userData.name}
                  </h1>
                  <div className="flex flex-row items-center mt-1">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/2921/2921186.png"
                      alt="Logo"
                      className="w-8 h-8"
                    />
                    <p className="text-lg font-medium bg-gradient-to-r from-gray-700 to-gray-400 text-transparent bg-clip-text drop-shadow-sm ml-2">
                      {userData.companyName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carousel Navigation */}
              <div className="w-full max-w-xl">
                <Carousel
                  className="w-full"
                  onSelect={(index) =>
                    setActiveContent(navItems[index].content)
                  }
                >
                  <CarouselContent className="h-10">
                    {navItems.map((item, index) => (
                      <CarouselItem key={index} className="basis-1/3 h-full">
                        <div
                          className={`h-full flex flex-col items-center justify-center cursor-pointer rounded-xl transition-all duration-300 ${
                            activeContent === item.content
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                              : "hover:bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                          onClick={() => setActiveContent(item.content)}
                        >
                          <div className="flex items-center justify-center gap-2 p-2">
                            {item.icon}
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="absolute -bottom-3 left-0 right-0 flex justify-center gap-1">
                    {navItems.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 w-8 rounded-full transition-all duration-300 ${
                          activeContent === navItems[index].content
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                    ))}
                  </div>
                </Carousel>
              </div>

              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-900 flex items-center justify-end">
                  <Phone size={14} className="mr-1 text-blue-600" />
                  <span className="text-blue-600">+91-8829913941</span>
                </p>
                <p className="text-xs text-gray-500">
                  Mon - Fri • 9:00 AM - 7:00 PM
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="w-full px-6 py-8 lg:px-10 overflow-y-hidden max-w-8xl mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
