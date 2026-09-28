import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { showError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

export default function SalesDrawers({ user }) {
  const [warehouses, setWarehouses] = useState([]);
  const [itemCatalog, setItemCatalog] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
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

      if (field === "name") {
        const catalogItem = itemCatalog.find((it) => it.name === value);
        if (catalogItem) {
          if (typeof catalogItem.unitCost === "number") {
            updatedItems[index].unitCost = catalogItem.unitCost;
          }
          updatedItems[index].itemCode = catalogItem.itemCode || "";
          updatedItems[index].hsnCode = catalogItem.hsnCode || "";
          updatedItems[index].gstPer = catalogItem.gstPer || 0;
        }
      }

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

  const addNewItem = () => {
    setSalesOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
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

  const selectedWarehouse = warehouses?.find((w) => w._id === salesOrder.warehouseID);
  const availableItems = selectedWarehouse?.items ?? [];

  const removeItem = (index) => {
    setSalesOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    toast.success("Item removed");
  };

  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      if (!user || !user._id) return;

      try {
        const response = await api.get(`/api/warehouse/info`, {
          params: { userID: user._id },
        });
        const data = response.data.warehouseDetails;
        setWarehouses(data);
      } catch (error) {
        console.error("Error fetching warehouse details:", error);
      }
    };
    fetchWarehouseDetails();
  }, [user]);

  useEffect(() => {
    const fetchItemCatalog = async () => {
      if (!user || !user._id) return;

      try {
        const response = await api.get(`/api/items/all-items`);
        setItemCatalog(response.data || []);
      } catch (error) {
        console.error("Error fetching item catalog:", error);
      }
    };
    fetchItemCatalog();
  }, [user]);

  const handleSubmit = async () => {
    if (!salesOrder.warehouseID) {
      toast.error("Select a warehouse before submitting.");
      return;
    }
    for (const item of salesOrder.items) {
      const stock = availableItems.find((wItem) => wItem.name === item.name);
      if (!item.name || !stock) {
        toast.error("Select a product for every item before submitting.");
        return;
      }
      if (item.units <= 0) {
        toast.error(`Enter a quantity greater than 0 for "${item.name}".`);
        return;
      }
      if (item.units > stock.units) {
        toast.error(`Only ${stock.units} unit(s) of "${item.name}" available.`);
        return;
      }
    }

    setSaving(true);
    try {
      const salesDetails = {
        userID: user._id,
        customerDetails: {
          name: salesOrder.name,
          contactNo: salesOrder.contactNo,
          email: salesOrder.email,
        },
        invoiceNo: salesOrder.invoiceNo,
        items: salesOrder.items,
        warehouseID: salesOrder.warehouseID,
        taxAmt: salesOrder.taxAmt,
        finalAmt: salesOrder.finalAmt,
      };

      await api.post(`/api/sales/add-sales`, { ...salesDetails });

      toast.success("Sales order submitted");
      setIsOpen(false);

      setSalesOrder({
        name: "",
        contactNo: "",
        email: "",
        purchaseDate: "",
        invoiceNo: "",
        items: [
          {
            name: "",
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
      showError(error, "Couldn't add sales order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="gap-1.5">
          <Plus size={16} /> New
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[96vh]">
        <DrawerHeader className="border-b text-left">
          <DrawerTitle>New sales order</DrawerTitle>
          <DrawerDescription>Fill in the details to create a new sales order.</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="so-name">Customer name</Label>
                <Input
                  id="so-name"
                  name="name"
                  value={salesOrder.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="so-contactNo">Mobile no.</Label>
                <Input
                  id="so-contactNo"
                  name="contactNo"
                  value={salesOrder.contactNo}
                  onChange={handleChange}
                  placeholder="Enter customer phone no."
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="so-email">Email address</Label>
                <Input
                  id="so-email"
                  name="email"
                  value={salesOrder.email}
                  onChange={handleChange}
                  placeholder="Enter email ID"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="so-salesID">Sales order #</Label>
                <Input id="so-salesID" value={salesOrder.salesID} readOnly className="bg-muted font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="so-invoiceNo">Invoice no.</Label>
                <Input
                  id="so-invoiceNo"
                  name="invoiceNo"
                  value={salesOrder.invoiceNo}
                  onChange={handleChange}
                  placeholder="Enter invoice number"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="so-date">Sales date</Label>
                <Input
                  id="so-date"
                  type="date"
                  name="date"
                  value={
                    salesOrder.date ? new Date(salesOrder.date).toISOString().split("T")[0] : ""
                  }
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="so-warehouse">Warehouse</Label>
                <Select
                  value={salesOrder.warehouseID}
                  onValueChange={(value) =>
                    setSalesOrder((prev) => ({
                      ...prev,
                      warehouseID: value,
                      items: prev.items.map((item) => ({ ...item, name: "" })),
                    }))
                  }
                >
                  <SelectTrigger id="so-warehouse">
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses &&
                      warehouses.length > 0 &&
                      warehouses.map((warehouse) => (
                        <SelectItem key={warehouse._id} value={warehouse._id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Order items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addNewItem} className="gap-1.5">
                  <Plus size={14} /> Add item
                </Button>
              </div>

              {salesOrder.items.map((item, index) => (
                <Card key={index} className="relative">
                  <CardContent className="space-y-4 p-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="absolute right-2 top-2 h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X size={14} />
                    </Button>

                    <div className="grid grid-cols-1 gap-4 pr-8 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label>Product name</Label>
                        <Select
                          value={item.name}
                          onValueChange={(value) => handleItemChange(index, "name", value)}
                          disabled={!salesOrder.warehouseID}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                salesOrder.warehouseID ? "Select an item" : "Select a warehouse first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableItems.length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No items in this warehouse
                              </div>
                            ) : (
                              availableItems.map((wItem) => (
                                <SelectItem
                                  key={wItem._id}
                                  value={wItem.name}
                                  disabled={!wItem.units || wItem.units <= 0}
                                >
                                  {wItem.name} —{" "}
                                  {wItem.units > 0 ? `${wItem.units} available` : "out of stock"}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Item code</Label>
                        <Input
                          value={item.itemCode}
                          readOnly
                          placeholder="Auto-filled from product"
                          className="bg-muted font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>HSN code</Label>
                        <Input
                          value={item.hsnCode}
                          readOnly
                          placeholder="Auto-filled from product"
                          className="bg-muted font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label>
                          Quantity
                          {item.name && (
                            <span className="ml-1 font-normal text-muted-foreground">
                              ({availableItems.find((wItem) => wItem.name === item.name)?.units ?? 0} available)
                            </span>
                          )}
                        </Label>
                        <Input
                          type="number"
                          value={item.units}
                          onChange={(e) =>
                            handleItemChange(index, "units", parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          max={availableItems.find((wItem) => wItem.name === item.name)?.units ?? undefined}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Unit price (₹)</Label>
                        <Input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) =>
                            handleItemChange(index, "unitCost", parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>GST (%)</Label>
                        <Input value={item.gstPer} readOnly className="bg-muted font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Discount (%)</Label>
                        <Input
                          type="number"
                          value={item.discountPer}
                          onChange={(e) =>
                            handleItemChange(index, "discountPer", parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          max="100"
                          className="font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-accent p-4 sm:grid-cols-4">
                      <div className="text-sm">
                        <span className="block text-muted-foreground">Amount</span>
                        <span className="font-mono font-semibold text-primary">₹{item.amt.toFixed(2)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="block text-muted-foreground">SGST</span>
                        <span className="font-mono font-semibold text-primary">₹{item.sgst.toFixed(2)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="block text-muted-foreground">CGST</span>
                        <span className="font-mono font-semibold text-primary">₹{item.cgst.toFixed(2)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="block text-muted-foreground">IGST</span>
                        <span className="font-mono font-semibold text-primary">₹{item.igst.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-lg bg-accent p-4">
              <h3 className="mb-3 text-sm font-semibold">Order summary</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax amount</span>
                  <span className="font-mono font-medium">₹{salesOrder.taxAmt.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Final amount</span>
                  <span className="font-mono text-primary">₹{salesOrder.finalAmt.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t">
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Submitting…" : "Submit order"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
