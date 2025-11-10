import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

export default function PurchaseDrawer({ user, fetchUser }) {
  const [open, setOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState({
    name: "",
    contactNo: "",
    email: "",
    gstIN: "",
    purchaseDate: "",
    invoiceNo: "",
    items: [
      {
        itemName: "",
        name: "",
        units: 0,
        unitCost: 0,
        itemCode: "",
        hsnCode: "",
        amt: 0,
        gstPer: 0,
      },
    ],
    sgstAmt: 0,
    cgstAmt: 0,
    igstAmt: 0,
    finalAmt: 0,
    warehouseID: warehouses?._id || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPurchaseOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setPurchaseOrder((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index][field] =
        field === "units" || field === "unitCost" ? Math.max(0, value) : value;

      const baseAmount =
        parseFloat(updatedItems[index].units) *
          parseFloat(updatedItems[index].unitCost) || 0;

      const gstAmount =
        baseAmount * (parseFloat(updatedItems[index].gstPer) / 100);

      const cgstPerItem = gstAmount / 2;
      const sgstPerItem = gstAmount / 2;

      updatedItems[index].amt = baseAmount + gstAmount;

      const totalBaseAmount = updatedItems.reduce((sum, item) => {
        const itemBase =
          parseFloat(item.units) * parseFloat(item.unitCost) || 0;
        return sum + itemBase;
      }, 0);

      const totalGSTAmount = updatedItems.reduce((sum, item) => {
        const itemBase =
          parseFloat(item.units) * parseFloat(item.unitCost) || 0;
        const itemGST = itemBase * (parseFloat(item.gstPer) / 100);
        return sum + itemGST;
      }, 0);

      const totalCGST = totalGSTAmount / 2;
      const totalSGST = totalGSTAmount / 2;

      // const discountAmount = totalBaseAmount * (prev.discountPer / 100);

      const finalAmount = totalBaseAmount + totalGSTAmount;

      return {
        ...prev,
        items: updatedItems,
        sgstAmt: totalSGST,
        cgstAmt: totalCGST,
        igstAmt: 0,
        finalAmt: finalAmount,
      };
    });
  };

  const fetchHSNDetails = async (itemCode, index) => {
    if (!itemCode) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/hsn/hsnAdd/${itemCode}`
      );
      // const rponce = await fetch(`{import.meta.env.VITE_API_URL}/newCustomer/customer-list`,{name:name} );
      // const customerData = await response.json(),

      if (!response.ok) throw new Error("Item not found");

      const data = await response.json();
      setPurchaseOrder((prev) => {
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
    setPurchaseOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
          units: 0,
          unitCost: 0,
          amt: 0,
          itemCode: "",
          hsnCode: "",
          gstPer: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      const purchaseDetail = {
        userID: user._id,
        supplierDetails: {
          name: purchaseOrder.name,
          contactNo: purchaseOrder.contactNo,
          email: purchaseOrder.email,
          gstIN: purchaseOrder.gstIN,
        },
        invoiceNo: purchaseOrder.invoiceNo,
        // date: purchaseOrder.purchaseDate,
        items: purchaseOrder.items,
        warehouseID: purchaseOrder.warehouseID,
      };
      // console.log("Purchase Detail:", purchaseDetail);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/purchase/add-purchase`,
        { ...purchaseDetail }
      );

      // console.log("Purchase Order Data:", purchaseOrder);
      alert("Purchase Order Submitted");
      setOpen(false); // Close the drawer
      await fetchUser();

      setPurchaseOrder({
        name: "",
        contactNo: "",
        email: "",
        gstIN: "",
        purchaseDate: "",
        invoiceNo: "",
        items: [
          {
            itemName: "",
            name: "",
            units: 0,
            unitCost: 0,
            itemCode: "",
            hsnCode: "",
            amt: 0,
            gstPer: 0,
          },
        ],
        warehouseID: "",
        sgstAmt: 0,
        cgstAmt: 0,
        igstAmt: 0,
        finalAmt: 0,
      });
    } catch (error) {
      console.error("Error adding purchase order:", error);
      alert("Failed to add purchase order. Please try again.");
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      purchaseOrder.items.forEach((item, index) => {
        if (item.itemCode) {
          fetchHSNDetails(item.itemCode, index);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [purchaseOrder.items]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="m-4  bg-slate-600 hover:bg-gray-300">
          New Order
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[96vh] p-4">
        <DrawerHeader className="pb-4 border-b">
          <DrawerTitle className="text-2xl font-bold text-gray-900">
            New Purchase Order
          </DrawerTitle>
          <DrawerDescription className="text-gray-600">
            Fill in the details to create a new purchase order
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Invoice No.
                  </label>
                  <input
                    type="text"
                    name="invoiceNo"
                    value={purchaseOrder.invoiceNo}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter invoice number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Supplier Email
                </label>
                <input
                  type="text"
                  name="email"
                  value={purchaseOrder.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter supplier Email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Supplier Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={purchaseOrder.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter supplier name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Supplier Contact No.
                </label>
                <input
                  type="text"
                  name="contactNo"
                  value={purchaseOrder.contactNo}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter supplier Contact No."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Supplier GSTIN/UID
                </label>
                <input
                  type="text"
                  name="gstIN"
                  value={purchaseOrder.gstIN}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter supplier name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  WarehouseID
                </label>
                <select
                  name="warehouseID"
                  value={purchaseOrder.warehouseID}
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={purchaseOrder.purchaseDate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                <Button
                  onClick={addNewItem}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  + Add Item
                </Button>
              </div>

              {purchaseOrder.items.map((item, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4 space-y-4">
                    <Button
                      onClick={() => removeItem(index)}
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600"
                    >
                      ×
                    </Button>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Item
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, "name", e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          placeholder="Enter item name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Item Code
                        </label>
                        <input
                          type="text"
                          value={item.itemCode}
                          onChange={(e) =>
                            handleItemChange(index, "itemCode", e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          placeholder="Enter item code"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.itemName}
                          readOnly
                          className="w-full rounded-md bg-gray-50 border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          HSN Code
                        </label>
                        <input
                          type="text"
                          value={item.hsnCode}
                          readOnly
                          className="w-full rounded-md bg-gray-50 border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          GST (%)
                        </label>
                        <input
                          type="text"
                          value={item.gstPer}
                          readOnly
                          className="w-full rounded-md bg-gray-50 border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Item Amount
                        </label>
                        <input
                          type="text"
                          value={`₹${item.amt.toFixed(2)}`}
                          readOnly
                          className="w-full rounded-md bg-gray-50 border border-gray-300 px-3 py-2 font-medium text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Quantity (Units)
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
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
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
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          min="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SGST Amount:</span>
                  <span className="font-medium">
                    ₹{purchaseOrder.sgstAmt.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">CGST Amount:</span>
                  <span className="font-medium">
                    ₹{purchaseOrder.cgstAmt.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IGST Amount:</span>
                  <span className="font-medium">
                    ₹{purchaseOrder.igstAmt.toFixed(2)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Final Amount:</span>
                  <span className="text-blue-600">
                    ₹{purchaseOrder.finalAmt.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t bg-white px-6 py-4">
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
            >
              Submit Purchase Order
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
