import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { IoAddCircleOutline } from "react-icons/io5";

export default function SalesDrawers({ user }) {
  const [warehouses, setWarehouses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [salesOrder, setSalesOrder] = useState({
    name: "",
    contactNo: "",
    email: "",
    salesID: "",
    date: "",
    invoiceNo: "",
    items: [
      {
        name: "",
        // productName: "",
        itemName: "",
        itemCode: "",
        units: 0,
        unitCost: 0,
        hsnCode: "",
        discountPer: 0,
        amt: 0,
        gstPer: 0,
        sgst: 0,
        cgst: 0,
        igst: 0,
      },
    ],

    taxAmt: 0,
    finalAmt: 0,
    warehouseID: warehouses?._id || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSalesOrder((prev) => ({ ...prev, [name]: value }));
  };
  const handleItemChange = (index, field, value) => {
    setSalesOrder((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index][field] =
        field === "units" || field === "unitCost" ? Math.max(0, value) : value;

      let itemAmt =
        parseFloat(updatedItems[index].units) *
          parseFloat(updatedItems[index].unitCost) || 0;

      const discountAmount = itemAmt * (updatedItems[index].discountPer / 100);
      itemAmt -= discountAmount;
      updatedItems[index].amt =
        itemAmt + itemAmt * parseFloat(updatedItems[index].gstPer / 100);

      const gstAmt = itemAmt * (updatedItems[index].gstPer / 100);
      if (prev.isInterState) {
        updatedItems[index].igst = gstAmt;
        updatedItems[index].sgst = updatedItems[index].cgst = 0;
      } else {
        updatedItems[index].sgst = gstAmt / 2;
        updatedItems[index].cgst = gstAmt / 2;
        updatedItems[index].igst = 0;
      }

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  useEffect(() => {
    setSalesOrder((prev) => {
      const totalAmt = prev.items.reduce((sum, item) => sum + item.amt, 0);
      const taxAmount = prev.items.reduce(
        (sum, item) => sum + item.sgst + item.cgst + item.igst,
        0
      );
      const finalAmount = totalAmt + taxAmount;

      return { ...prev, taxAmt: taxAmount, finalAmt: finalAmount };
    });
  }, [salesOrder.items]);

  // const fetchCustomerDetails = async (name) => {

  //   // console.log(order);
  //   try {
  //     const response = await axios.get(
  //       `{import.meta.env.VITE_API_URL}/newCustomer/customer-list`,
  //       {
  //         params: { name: name },
  //       }
  //     );

  //     if (response.status !== 200) throw new Error("Customer not found");

  //     const data = response.data;
  //     console.log(data);

  //     // Store data in local storage
  //     localStorage.setItem('customerDetails', JSON.stringify(data));

  //     setSalesOrder((prev) => ({
  //       ...prev,
  //       customerNo: data.customerNo || "",
  //       name: data.name || "",
  //       contactNo: data.contactNo || "",
  //       emailAddress: data.emailAddress || "",
  //       address: data.address || "",
  //     }));

  //     console.log(data.contactNo);
  //   } catch (error) {
  //     console.error("Error fetching customer details:", error);
  //   }
  // };
  const fetchHSNDetails = async (itemCode, index) => {
    if (!itemCode) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/hsn/hsnAdd/${itemCode}`
      );
      if (!response.ok) throw new Error("Item not found");

      const data = await response.json();
      setSalesOrder((prev) => {
        const updatedItems = [...prev.items];
        updatedItems[index] = {
          ...updatedItems[index],
          itemCode: data.item_code || "",
          hsnCode: data.hsn_code || "",
          gstPer: data.gst_per || 0,
          itemName: data.item_name || "Unknown",
        };
        return { ...prev, items: updatedItems };
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const addNewItem = () => {
    setSalesOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
          itemName: "",
          itemCode: "",
          units: 0,
          unitCost: 0,
          amt: 0,
          hsnCode: "",
          gstPer: 0,
          discountPer: 0,
          sgst: 0,
          cgst: 0,
          igst: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    try {
      setSalesOrder((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
      alert("Item Removed");
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };
  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      if (!user || !user._id) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/warehouse/info`,
          {
            params: { userID: user._id },
          }
        );
        const data = response.data.warehouseDetails;
        // console.log("Warehouse Details:", data);
        setWarehouses(data);
      } catch (error) {
        console.error("Error fetching warehouse details:", error);
      }
    };
    fetchWarehouseDetails();
  }, [user]);

  const handleSubmit = async () => {
    event.preventDefault();
    try {
      const salesDetails = {
        userID: user._id,
        customerDetails: {
          name: salesOrder.name,
          contactNo: salesOrder.contactNo,
          email: salesOrder.email,
        },
        invoiceNo: salesOrder.invoiceNo,
        // date: salesOrder.purchaseDate,
        items: salesOrder.items,
        warehouseID: salesOrder.warehouseID,
        taxAmt: salesOrder.taxAmt,
        finalAmt: salesOrder.finalAmt,
      };
      // console.log("Sales Details:", salesDetails);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sales/add-sales`,
        {
          ...salesDetails,
        }
      );

      // console.log("Sales Order Data:", salesOrder);
      alert("Sales Order Submitted");
      setIsOpen(false); // Close the drawer

      setSalesOrder({
        name: "",
        contactNo: "",
        email: "",
        purchaseDate: "",
        invoiceNo: "",
        items: [
          {
            name: "",
            itemName: "",
            units: 0,
            unitCost: 0,
            itemCode: "",
            hsnCode: "",
            amt: 0,
            gstPer: 0,
            discountPer: 0,
            sgst: 0,
            cgst: 0,
            igst: 0,
          },
        ],
        finalAmt: 0,
        taxAmt: 0,
        warehouseID: warehouses?._id || "",
      });
    } catch (error) {
      console.error("Error adding purchase order:", error);
      alert("Failed to add purchase order. Please try again.");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      salesOrder.items.forEach((item, index) => {
        if (item.itemCode) {
          fetchHSNDetails(item.itemCode, index);
        }
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [salesOrder.items]);
  // useEffect(() => {
  //   if (salesOrder.name) {
  //     fetchCustomerDetails(salesOrder.name);
  //   }
  // }, [salesOrder.name]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-slate-600 hover:bg-blue-700 text-white font-medium px-3 py-2.5 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
          <span className="mr-2">New</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[95vh]  flex flex-col bg-white">
        {/* Enhanced Fixed Header */}
        <div className="flex-none py-6 px-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white shadow-sm">
          <h2 className="text-3xl font-black text-gray-900 flex items-center">
            New Sales Order
            <span className="ml-4 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Draft
            </span>
          </h2>
        </div>

        {/* Scrollable Content with Enhanced Styling */}
        <div className="flex-1 overflow-y-auto bg-gray-50 w-full ">
          <div className="p-8 max-w-10xl mx-auto">
            <div className="space-y-6">
              {/* Customer Info Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Customer Information
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={salesOrder.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile No.
                    </label>
                    <input
                      type="text"
                      name="contactNo"
                      value={salesOrder.contactNo}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                      placeholder="Enter customer phoneNo."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address:
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={salesOrder.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                      placeholder="Enter Email ID:"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sales Order #
                    </label>
                    <input
                      type="text"
                      value={salesOrder.salesID}
                      readOnly
                      className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice No.
                    </label>
                    <input
                      type="text"
                      name="invoiceNo"
                      value={salesOrder.invoiceNo}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                      placeholder="Enter invoice number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sales Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={
                        salesOrder.date
                          ? new Date(salesOrder.date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      WarehouseID
                    </label>
                    <select
                      name="warehouseID"
                      value={salesOrder.warehouseID}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a warehouse</option>
                      {warehouses &&
                        warehouses.length > 0 &&
                        warehouses.map((warehouse) => (
                          <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order Items
                  </h3>
                  <Button
                    onClick={addNewItem}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                  >
                    <IoAddCircleOutline className="w-5 h-5" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {salesOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-6 relative hover:shadow-md transition-all duration-200"
                    >
                      {/* First Row */}
                      <div className="grid grid-cols-4 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name
                          </label>
                          <select
                            name="name"
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(index, "name", e.target.value)
                            }
                            className="w-full h-[50px] rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select an item</option>
                            {warehouses?.flatMap((warehouse) =>
                              warehouse.items?.map((item) => (
                                <option key={item._id} value={item.name}>
                                  {item.name}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Code
                          </label>
                          <input
                            type="text"
                            value={item.itemCode}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "itemCode",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter item code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            HSN Code
                          </label>
                          <input
                            type="text"
                            value={item.hsnCode}
                            readOnly
                            className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Name
                          </label>
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "itemName",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter item name"
                          />
                        </div>
                      </div>

                      {/* Second Row */}
                      <div className="grid grid-cols-4 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.units}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "units",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit Price (₹)
                          </label>
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unitCost",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GST (%)
                          </label>
                          <input
                            type="text"
                            value={item.gstPer}
                            readOnly
                            className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            value={item.discountPer}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "discountPer",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      {/* Summary Row */}
                      <div className="grid grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm">
                          <span className="block text-gray-600 font-medium">
                            Amount
                          </span>
                          <span className="text-blue-600 font-semibold">
                            ₹{item.amt.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="block text-gray-600 font-medium">
                            SGST
                          </span>
                          <span className="text-blue-600 font-semibold">
                            ₹{item.sgst.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="block text-gray-600 font-medium">
                            CGST
                          </span>
                          <span className="text-blue-600 font-semibold">
                            ₹{item.cgst.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="block text-gray-600 font-medium">
                            IGST
                          </span>
                          <span className="text-blue-600 font-semibold">
                            ₹{item.igst.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(index)}
                        className="absolute top-4 right-4 bg-red-100 hover:bg-red-200 text-red-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Amount
                    </label>
                    <input
                      type="number"
                      value={salesOrder.taxAmt.toFixed(2)}
                      readOnly
                      className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Amount
                    </label>
                    <input
                      type="number"
                      value={salesOrder.finalAmt.toFixed(2)}
                      readOnly
                      className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Fixed Footer */}
        <div className="flex-none border-t border-gray-200 bg-white p-6">
          <div className="max-w-6xl mx-auto flex justify-end gap-4">
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5"
            >
              Submit Order
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
