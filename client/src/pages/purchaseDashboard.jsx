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
import PurchaseDrawer from "@/drawers/purchaseDrawer";
import ExcelImportDrawer from "@/drawers/exportPurchase1Drawer";
import axios from "axios";
import { Wallet2 } from "lucide-react";

export const PurchaseOrderDashboard = ({ user, fetchUser }) => {
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterByName, setFilterByName] = useState(true);
  const [filterByGst, setFilterByGst] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const userID = user._id;
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/purchase/all-purchases`,
          { params: { userID } }
        );
        // console.log(res.data.purchaseDetails);
        // Ensure the fetched data is an array and clean the data
        if (Array.isArray(res.data.purchaseDetails)) {
          const cleanedPurchases = res.data.purchaseDetails.map((purchase) => ({
            ...purchase,
            finalAmt: purchase.finalAmt || 0,
            taxAmt: purchase.taxAmt || 0,
            supplierDetails: purchase.supplierDetails || {},
            items: purchase.items || [],
            date: purchase.date || new Date().toISOString(),
          }));
          setPurchases(cleanedPurchases);
        } else {
          console.error("Fetched data is not an array:", res.data);
          setPurchases([]);
        }
      } catch (err) {
        console.error("Error fetching purchases:", err);
        setPurchases([]);
      }
    };

    fetchPurchases();
  }, [user._id]);

  const filterDataByDate = (data) => {
    if (!startDate || !endDate) return data;
    return data.filter((item) => {
      const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredPurchases = Array.isArray(purchases)
    ? purchases.filter((purchase) => {
        const searchLower = search.toLowerCase();

        switch (true) {
          case filterByName:
            return purchase.supplierDetails?.name
              ?.toLowerCase()
              .includes(searchLower);
          case filterByGst:
            return purchase.supplierDetails?.gstIN
              ?.toLowerCase()
              .includes(searchLower);
          case filterByDate:
            return filterDataByDate([purchase]).length > 0;
          default:
            return true;
        }
      })
    : [];

  return (
    <div className="p-6 w-full mx-auto h-full overflow-y-hidden hide-scrollbar ">
      <div className="w-full bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm">
            <Wallet2 className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Purchase Order Details
          </h1>
        </div>
      </div>
      <div className=" relative top-0 flex space-x-4  items-center pr-6 pl-6  justify-center items-center ">
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
        <PurchaseDrawer user={user} fetchUser={fetchUser} />
        <ExcelImportDrawer user={user} />
      </div>
      <div className="pl-6 pr-6 pb-5 transparent w-full h-[80%] mx-auto overflow-y-auto hide-scrollbar max-h-[80vh] flex flex-col z-[-30]">
        <div className="flex flex-col space-y-4 ">
          {filteredPurchases.length > 0 ? (
            filteredPurchases.map((purchase, index) => {
              // Safely calculate total amounts with default values
              // const finalAmt = purchase.finalAmt || 0;
              // const taxAmt = purchase.taxAmt || 0;
              // const totalAmt = finalAmt + taxAmt;

              return (
                <Card
                  key={index}
                  className="bg-white rounded-2xl shadow-md p-4 relative transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between space-x-4 p-2 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 w-24">
                      {new Date(
                        purchase.date || Date.now()
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 w-28">
                      {purchase.invoiceNo || "N/A"}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 flex-1">
                      {purchase.supplierDetails?.gstIN || "N/A"}
                    </p>
                    <p className="text-lg font-bold text-gray-900 flex-1">
                      {purchase.supplierDetails?.name || "Unknown Supplier"}
                    </p>

                    <div className="flex flex-col space-y-1 w-48 mr-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="text-sm font-medium text-gray-800">
                          ₹
                          {(
                            purchase.finalAmt - purchase.taxAmt
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tax:</span>
                        <span className="text-sm font-medium text-blue-600">
                          ₹{purchase.taxAmt.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">
                          Total:
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          ₹{purchase.finalAmt.toLocaleString()}
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
                              Purchase ID
                            </p>
                            <p className="text-lg font-mono text-blue-700 text-center">
                              #{purchase.invoiceNo || "N/A"}
                            </p>
                          </div>

                          <div className="mt-6 w-full bg-green-50 rounded-lg p-3 shadow-sm border border-green-100">
                            <p className="text-sm font-bold text-gray-800 mb-1">
                              Order Summary
                            </p>
                            <div className="flex justify-between text-sm my-1">
                              <span>Items:</span>
                              <span>{purchase.items?.length || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm my-1">
                              <span>Subtotal:</span>
                              <span>
                                {" "}
                                ₹
                                {(
                                  purchase.finalAmt - purchase.taxAmt
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm my-1">
                              <span>Total Tax:</span>
                              <span>₹{purchase.taxAmt.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-green-700 mt-2 pt-2 border-t border-green-200">
                              <span>Grand Total:</span>
                              <span>₹{purchase.finalAmt.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-3/4 p-4">
                          <div className="mb-4 bg-gray-50 p-2 rounded-md">
                            <span className="font-semibold text-gray-600">
                              Date:{" "}
                            </span>
                            <span className="text-gray-800">
                              {new Date(
                                purchase.date || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="font-medium text-gray-700 mb-3 border-b pb-1">
                            Order Items
                          </h3>

                          {purchase.items?.map((item, itemIndex) => {
                            // Safely calculate item-level amounts
                            const unitCost = item.unitCost || 0;
                            const units = item.units || 0;
                            const gstPer = item.gstPer || 0;
                            const itemSubtotal = unitCost * units;
                            const gstAmount = (itemSubtotal * gstPer) / 100;
                            const itemTotal = itemSubtotal + gstAmount;

                            return (
                              <div
                                key={itemIndex}
                                className="mb-6 bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-semibold text-blue-600">
                                    {item.name || "Unnamed Item"}
                                  </h4>
                                  <div className="flex space-x-3">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      Item Code: {item.itemCode || "N/A"}
                                    </span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      HSN: {item.hsnCode || "N/A"}
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
                                        {gstPer}%
                                      </span>
                                    </p>
                                    <p className="text-sm mb-2">
                                      <span className="font-semibold text-gray-600">
                                        Per Unit Cost:{" "}
                                      </span>
                                      <span className="text-gray-800">
                                        ₹{unitCost.toLocaleString()}
                                      </span>
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-semibold text-gray-600">
                                        Quantity:{" "}
                                      </span>
                                      <span className="text-gray-800">
                                        {units}
                                      </span>
                                    </p>
                                  </div>

                                  <div className="border-l pl-4 border-gray-200">
                                    <p className="text-sm mb-2">
                                      <span className="font-semibold text-gray-600">
                                        Subtotal:{" "}
                                      </span>
                                      <span className="text-gray-800">
                                        ₹{itemSubtotal.toLocaleString()}
                                      </span>
                                    </p>
                                    <p className="text-sm mb-2">
                                      <span className="font-semibold text-gray-600">
                                        GST Amount:{" "}
                                      </span>
                                      <span className="text-blue-600">
                                        ₹{gstAmount.toLocaleString()}
                                      </span>
                                    </p>
                                    <p className="text-sm font-medium">
                                      <span className="font-semibold text-gray-600">
                                        Item Total:{" "}
                                      </span>
                                      <span className="text-gray-800">
                                        ₹{itemTotal.toLocaleString()}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No purchases found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
