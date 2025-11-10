"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import SalesDrawers from "@/drawers/SalesDrawers";
import ExcelImportSalesDrawer from "@/drawers/exportSalesDrawer";
import { Receipt } from "lucide-react";
import axios from "axios";

export const SalesOrderDashboard = ({ user }) => {
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterByName, setFilterByName] = useState(true);
  const [filterByGst, setFilterByGst] = useState(false);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const userID = user._id;
        // console.log("User ID:", userID);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sales/all-sales`,
          {
            params: { userID },
          }
        );
        if (res.data && res.data.salesDetails) {
          setSales(res.data.salesDetails);
          // console.log("Sales Data:", res.data.salesDetails);
        } else {
          console.error("Fetched data is not valid:", res.data);
          setSales([]);
        }
      } catch (err) {
        console.log("Error fetching sales:", err);
        setSales([]);
      }
    };

    if (user && user._id) {
      fetchSales();
    }
  }, [user]);

  const filteredSales = Array.isArray(sales)
    ? sales.filter((sale) => {
        const searchLower = search.toLowerCase();

        switch (true) {
          case filterByName:
            return sale.customerDetails?.name
              ?.toLowerCase()
              .includes(searchLower);
          case filterByGst:
            return sale.customerDetails?.gstIN
              ?.toLowerCase()
              .includes(searchLower);
          case filterByDate:
            return sale.date?.includes(search);
          default:
            return true;
        }
      })
    : [];

  return (
    <div className="p-6 w-full mx-auto h-full overflow-y-hidden hide-scrollbar">
      <div className="w-full bg-gradient-to-r from-blue-50 to-blue-100  rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm">
            <Receipt className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Sales Order Details
          </h1>
        </div>
      </div>
      <div className="relative top-0 flex space-x-4 items-center pr-6 pl-6 justify-center">
        <Input
          type="text"
          placeholder="Search..."
          className="p-3 border border-gray-300 rounded-lg shadow-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md">
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Checkbox
                checked={filterByName}
                onCheckedChange={() => {
                  setFilterByDate(false);
                  setFilterByName(true);
                  setFilterByGst(false);
                }}
              />{" "}
              Filter by Name
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                checked={filterByGst}
                onCheckedChange={() => {
                  setFilterByDate(false);
                  setFilterByGst(true);
                  setFilterByName(false);
                }}
              />{" "}
              Filter by GSTIN
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                checked={filterByDate}
                onCheckedChange={() => {
                  setFilterByGst(false);
                  setFilterByName(false);
                  setFilterByDate(true);
                }}
              />{" "}
              Filter by Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SalesDrawers user={user} />
        {/* <ExcelImportSalesDrawer user={user} /> */}
      </div>
      <div className="mt-10 pl-6 pr-6 pb-5 transparent w-full h-[80%] mx-auto overflow-y-auto hide-scrollbar max-h-[80vh] flex flex-col z-[-30]">
        <div className="flex flex-col space-y-4">
          {filteredSales.length > 0 ? (
            filteredSales.map((sale, index) => {
              return (
                <Card
                  key={index}
                  className="bg-white rounded-2xl shadow-md p-4 relative transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between space-x-4 p-2 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 w-24">
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 w-28">
                      {sale.invoiceNo}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 flex-1">
                      {sale.customerDetails.gstIN ||
                        sale.customerDetails.contactNo}
                    </p>
                    <p className="text-lg font-bold text-gray-900 flex-1">
                      {sale.customerDetails.name}
                    </p>

                    <div className="flex flex-col space-y-1 w-48 mr-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="text-sm font-medium text-gray-800">
                          ₹{(sale.finalAmt - sale.taxAmt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tax:</span>
                        <span className="text-sm font-medium text-blue-600">
                          ₹{sale.taxAmt.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">
                          Total:
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          ₹{sale.finalAmt.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-300 ${
                          expandedIndex === index ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedIndex === index
                        ? "max-h-[800px] opacity-100 mt-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex border-t border-gray-200">
                        <div className="w-1/4 bg-gray-50 p-4 border-r border-gray-200 flex flex-col justify-center items-center">
                          <div className="bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-100">
                            <p className="text-sm font-bold text-gray-800 mb-1">
                              Sales ID
                            </p>
                            <p className="text-lg font-mono text-blue-700 text-center">
                              #{sale.invoiceNo}
                            </p>
                          </div>

                          <div className="mt-6 w-full bg-green-50 rounded-lg p-3 shadow-sm border border-green-100">
                            <p className="text-sm font-bold text-gray-800 mb-1">
                              Order Summary
                            </p>
                            <div className="flex justify-between text-sm my-1">
                              <span>Items:</span>
                              <span>{sale.items.length}</span>
                            </div>
                            <div className="flex justify-between text-sm my-1">
                              <span>Subtotal:</span>
                              <span>
                                ₹
                                {(sale.finalAmt - sale.taxAmt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm my-1">
                              <span>Total Tax:</span>
                              <span>₹{sale.taxAmt.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-green-700 mt-2 pt-2 border-t border-green-200">
                              <span>Grand Total:</span>
                              <span>₹{sale.finalAmt.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-3/4 p-4">
                          <div className="mb-4 bg-gray-50 p-2 rounded-md">
                            <span className="font-semibold text-gray-600">
                              Date:{" "}
                            </span>
                            <span className="text-gray-800">
                              {new Date(sale.date).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="font-medium text-gray-700 mb-3 border-b pb-1">
                            Order Items
                          </h3>

                          {sale.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="mb-6 bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-blue-600">
                                  {item.name}
                                </h4>
                                <div className="flex space-x-3">
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    Item Code: {item.itemCode || item.itemsCode}
                                  </span>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    HSN: {item.hsnCode}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm mb-2">
                                    <span className="font-semibold text-gray-600">
                                      GST Rate:{" "}
                                    </span>
                                    <span className="text-gray-800">
                                      {item.gstPer}%
                                    </span>
                                  </p>
                                  <p className="text-sm mb-2">
                                    <span className="font-semibold text-gray-600">
                                      Per Unit Cost:{" "}
                                    </span>
                                    <span className="text-gray-800">
                                      ₹{item.unitCost}
                                    </span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-semibold text-gray-600">
                                      Quantity:{" "}
                                    </span>
                                    <span className="text-gray-800">
                                      {item.units || item.perUnit}
                                    </span>
                                  </p>
                                </div>

                                <div className="border-l pl-4 border-gray-200">
                                  <p className="text-sm mb-2">
                                    <span className="font-semibold text-gray-600">
                                      Subtotal:{" "}
                                    </span>
                                    <span className="text-gray-800">
                                      ₹
                                      {(
                                        (item.units || item.perUnit) *
                                        item.unitCost
                                      ).toLocaleString()}
                                    </span>
                                  </p>
                                  <p className="text-sm mb-2">
                                    <span className="font-semibold text-gray-600">
                                      GST Amount:{" "}
                                    </span>
                                    <span className="text-blue-600">
                                      ₹
                                      {(
                                        ((item.units || item.perUnit) *
                                          item.unitCost *
                                          item.gstPer) /
                                        100
                                      ).toLocaleString()}
                                    </span>
                                  </p>
                                  <p className="text-sm font-medium">
                                    <span className="font-semibold text-gray-600">
                                      Item Total:{" "}
                                    </span>
                                    <span className="text-gray-800">
                                      ₹
                                      {(
                                        (item.units || item.perUnit) *
                                          item.unitCost +
                                        ((item.units || item.perUnit) *
                                          item.unitCost *
                                          item.gstPer) /
                                          100
                                      ).toLocaleString()}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No sales found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
