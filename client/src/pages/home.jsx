import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Minus,
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext.jsx";
import ErrorState from "@/components/errors/ErrorState";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

const chartTooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(190, 14%, 88%)",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

function EmptyChart({ label }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default function Dashboard({ user }) {
  const { dashboardVersion } = useAuth();
  const [bought, setBought] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [cust, setCust] = useState([]);
  const [sales, setSales] = useState([]);
  const [product, setProduct] = useState([]);
  const [supplier, setSuppliers] = useState([]);
  const [profit, setProfit] = useState(null);
  const [totalSales, setTotalSales] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

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
      setLoadError(null);

      const res = await api.get("/api/items/top-bought", { params: { fromDate, toDate, userID } });
      const res2 = await api.get("/api/items/top-sold", { params: { fromDate, toDate, userID } });
      const res3 = await api.get("/api/customer/all-customers", { params: { userID: user._id } });
      const res4 = await api.get("/api/items/all-items", { params: { userID: user._id } });
      const res5 = await api.get("/api/customer/top-customers", { params: { userID: user._id } });
      const res6 = await api.get("/api/supplier/top-suppliers", { params: { fromDate, toDate, userID } });
      const res7 = await api.get("/api/sales/profit-loss", { params: { fromDate, toDate, userID } });
      const res8 = await api.get("/api/sales/total-sales", { params: { fromDate, toDate, userID } });

      setBought(res.data?.topBoughtItems || []);
      setSales(res2.data?.topSoldItems || []);
      setCust(res3.data || []);
      setProduct(res4.data || []);
      setCustomersData(res5.data || []);
      setSuppliers(res6.data || []);
      setProfit(res7.data || null);
      setTotalSales(res8.data || []);
    } catch (error) {
      setLoadError(error);
      setBought([]);
      setSales([]);
      setCust([]);
      setProduct([]);
      setCustomersData([]);
      setSuppliers([]);
      setProfit(null);
      setTotalSales([]);
    }
  };

  const handleSubmit = () => {
    const fromDate = startDate ? new Date(startDate).toISOString() : null;
    const toDate = endDate ? new Date(endDate).toISOString() : null;
    fetchItemsDetail(fromDate, toDate);
  };

  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dashboardVersion]);

  const hasSales = totalSales.length > 0;
  const salesAmt = hasSales
    ? Number(totalSales[0]?.totalSales || 0) - Number(totalSales[0]?.totalTax || 0)
    : 0;
  const hasProfit = profit != null;
  const netProfit = hasProfit ? Number(profit.profit || 0) - Number(profit.loss || 0) : 0;

  const kpis = [
    {
      label: "Customers",
      value: cust.length,
      icon: Users,
      trend: cust.length > 0 ? `${cust.length} on record` : "No customers yet",
    },
    {
      label: "Products tracked",
      value: product.length,
      icon: ShoppingBag,
      trend: product.length > 0 ? product.map((p) => p.name).slice(0, 2).join(", ") : "No products yet",
    },
    {
      label: "Sales amount",
      value: hasSales ? currency(salesAmt) : "—",
      icon: IndianRupee,
      trend: hasSales ? "This period" : "No sales recorded yet",
    },
    {
      label: "Profit / Loss",
      value: hasProfit ? currency(netProfit) : "—",
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      trend: hasProfit ? (netProfit >= 0 ? "In profit" : "Running at a loss") : "No sales recorded yet",
      tone: !hasProfit ? "flat" : netProfit >= 0 ? "good" : "bad",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hello, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-muted-foreground">{user?.companyName || "Your business"}</p>
      </div>

      {/* Filters */}
      <Card className="mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">From</span>
          <DatePicker
            selected={startDate}
            onChange={(date) => handleDateChange(date, endDate)}
            className="w-36 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            placeholderText="Start date"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">To</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => handleDateChange(startDate, date)}
            className="w-36 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            placeholderText="End date"
          />
        </div>
        <Button size="sm" onClick={handleSubmit}>
          Apply
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            handleDateChange(null, null);
            handleSubmit();
          }}
        >
          Clear
        </Button>
      </Card>

      {loadError ? (
        <Card>
          <ErrorState error={loadError} onRetry={handleSubmit} />
        </Card>
      ) : (
        <>
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, trend, tone }) => (
          <Card key={label} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <Icon size={15} className="text-muted-foreground" />
            </div>
            <div className="font-mono text-xl font-semibold tracking-tight">{value}</div>
            <div
              className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${
                tone === "good"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : tone === "bad"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              {tone === "good" && <TrendingUp size={12} />}
              {tone === "bad" && <TrendingDown size={12} />}
              {(!tone || tone === "flat") && <Minus size={12} />}
              {trend}
            </div>
          </Card>
        ))}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Top purchases</h3>
          <div className="h-64">
            {bought.length === 0 ? (
              <EmptyChart label="No purchases in this period" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filterDataByDate(bought)} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(190, 14%, 88%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(190, 9%, 40%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(190, 9%, 40%)" />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => currency(v)} />
                  <Bar dataKey="amt" fill="hsl(183, 79%, 28%)" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Top vendors</h3>
          <div className="h-64">
            {supplier.length === 0 ? (
              <EmptyChart label="No vendor spend in this period" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={supplier} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(190, 14%, 88%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(190, 9%, 40%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(190, 9%, 40%)" />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => currency(v)} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(183, 79%, 28%)"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(183, 79%, 28%)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Top selling products</h3>
          <div className="h-64">
            {sales.length === 0 ? (
              <EmptyChart label="No sales recorded yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filterDataByDate(sales)} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(190, 14%, 88%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(190, 9%, 40%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(190, 9%, 40%)" />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => currency(v)} />
                  <Bar dataKey="amt" fill="hsl(152 45% 42%)" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Top customers</h3>
          <div className="h-64">
            {customersData.length === 0 ? (
              <EmptyChart label="No customers yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customersData} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(190, 14%, 88%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(190, 9%, 40%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(190, 9%, 40%)" />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => currency(v)} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(38 68% 48%)"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(38 68% 48%)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
