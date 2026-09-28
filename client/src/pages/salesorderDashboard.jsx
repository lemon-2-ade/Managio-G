"use client";

import { useEffect, useState, Fragment } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import SalesDrawers from "@/drawers/SalesDrawers";
import { Receipt, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import api from "@/lib/axios";
import ErrorState from "@/components/errors/ErrorState";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n) || 0);

export const SalesOrderDashboard = ({ user }) => {
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterByName, setFilterByName] = useState(true);
  const [filterByGst, setFilterByGst] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchSales = async () => {
    setLoadError(null);
    try {
      const userID = user._id;
      const res = await api.get("/api/sales/all-sales", { params: { userID } });
      if (res.data && res.data.salesDetails) {
        setSales(res.data.salesDetails);
      } else {
        setSales([]);
      }
    } catch (err) {
      // The backend signals "no sales yet" with a 400 — that's an empty
      // state, not a failure. Anything else is a real error.
      if (err.response?.status === 400) {
        setSales([]);
      } else {
        setLoadError(err);
      }
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchSales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredSales = Array.isArray(sales)
    ? sales.filter((sale) => {
        const searchLower = search.toLowerCase();
        if (!search) return true;
        switch (true) {
          case filterByName:
            return sale.customerDetails?.name?.toLowerCase().includes(searchLower);
          case filterByGst:
            return sale.customerDetails?.gstIN?.toLowerCase().includes(searchLower);
          case filterByDate:
            return sale.date?.includes(search);
          default:
            return true;
        }
      })
    : [];

  const totalValue = filteredSales.reduce((sum, s) => sum + (s.finalAmt || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <Card className="mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Receipt size={19} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Sales orders</h1>
            <p className="text-xs text-muted-foreground">
              {filteredSales.length} order{filteredSales.length === 1 ? "" : "s"} · {currency(totalValue)} total
            </p>
          </div>
        </div>
        <SalesDrawers user={user} />
      </Card>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by customer, invoice or GSTIN…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal size={14} />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={() => {
                setFilterByDate(false);
                setFilterByName(true);
                setFilterByGst(false);
              }}
              className="gap-2"
            >
              <Checkbox checked={filterByName} /> Filter by name
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={() => {
                setFilterByDate(false);
                setFilterByGst(true);
                setFilterByName(false);
              }}
              className="gap-2"
            >
              <Checkbox checked={filterByGst} /> Filter by GSTIN
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={() => {
                setFilterByGst(false);
                setFilterByName(false);
                setFilterByDate(true);
              }}
              className="gap-2"
            >
              <Checkbox checked={filterByDate} /> Filter by date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="overflow-hidden">
        {loadError ? (
          <ErrorState error={loadError} onRetry={fetchSales} />
        ) : filteredSales.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-16 text-center">
            <Receipt size={22} className="mb-1 text-muted-foreground" />
            <p className="text-sm font-medium">No sales orders yet</p>
            <p className="text-xs text-muted-foreground">New orders you add will show up here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale, index) => {
                  const isOpen = expandedIndex === index;
                  return (
                    <Fragment key={sale._id || index}>
                      <TableRow className="cursor-pointer" onClick={() => setExpandedIndex(isOpen ? null : index)}>
                        <TableCell className="font-mono text-xs">{sale.invoiceNo || "—"}</TableCell>
                        <TableCell>
                          <div className="font-medium">{sale.customerDetails?.name || "Unknown customer"}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {sale.customerDetails?.gstIN || sale.customerDetails?.contactNo || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono">{currency(sale.finalAmt - sale.taxAmt)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{currency(sale.finalAmt)}</TableCell>
                        <TableCell>
                          <ChevronDown
                            size={15}
                            className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={6} className="bg-muted/30 p-0">
                            <div className="flex flex-col gap-4 p-4 duration-200 animate-in fade-in slide-in-from-top-1 lg:flex-row">
                              <div className="flex shrink-0 flex-col gap-3 lg:w-56">
                                <div className="rounded-lg border bg-card p-3">
                                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Invoice
                                  </p>
                                  <p className="font-mono text-sm font-semibold text-primary">
                                    #{sale.invoiceNo || "—"}
                                  </p>
                                </div>
                                <div className="rounded-lg border bg-card p-3">
                                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Order summary
                                  </p>
                                  <div className="space-y-1.5 font-mono text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Items</span>
                                      <span>{sale.items?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Subtotal</span>
                                      <span>{currency(sale.finalAmt - sale.taxAmt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Tax</span>
                                      <span>{currency(sale.taxAmt)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-1.5 font-semibold text-primary">
                                      <span>Grand total</span>
                                      <span>{currency(sale.finalAmt)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="mb-3 flex items-center gap-1.5 text-xs">
                                  <span className="font-medium">Date</span>
                                  <span className="font-mono text-muted-foreground">
                                    {new Date(sale.date).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                  {sale.items?.map((item, itemIndex) => {
                                    const units = item.units || item.perUnit || 0;
                                    const unitCost = item.unitCost || 0;
                                    const gstPer = item.gstPer || 0;
                                    const itemSubtotal = units * unitCost;
                                    const gstAmount = (itemSubtotal * gstPer) / 100;
                                    return (
                                      <div key={itemIndex} className="overflow-hidden rounded-lg border bg-card">
                                        <div className="flex items-center justify-between gap-2 border-b bg-accent/60 px-3 py-2">
                                          <span className="truncate text-sm font-semibold">{item.name}</span>
                                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
                                            {gstPer}% GST
                                          </span>
                                        </div>
                                        <div className="space-y-2 p-3">
                                          <div className="flex flex-wrap gap-1.5">
                                            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                                              Code {item.itemCode || "—"}
                                            </span>
                                            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                                              HSN {item.hsnCode || "—"}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-xs">
                                            <div>
                                              <p className="text-muted-foreground">Qty × rate</p>
                                              <p className="font-medium">
                                                {units} × {currency(unitCost)}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-muted-foreground">Subtotal</p>
                                              <p className="font-medium">{currency(itemSubtotal)}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">GST</p>
                                              <p className="font-medium">{currency(gstAmount)}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-muted-foreground">Item total</p>
                                              <p className="font-semibold text-primary">
                                                {currency(itemSubtotal + gstAmount)}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
