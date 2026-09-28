import { useState, useEffect, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Plus, X, ChevronsUpDown } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { showError } from "@/lib/errors";

function HsnCodePicker({ value, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [portalContainer, setPortalContainer] = useState(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    // Vaul's Drawer traps focus/pointer-events within its own DOM subtree, so a
    // Popover portaled to document.body (outside that subtree) becomes unclickable
    // and loses focus. Portaling into the drawer's own container fixes both.
    if (triggerRef.current) {
      setPortalContainer(triggerRef.current.closest("[data-vaul-drawer]"));
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get("/hsn/search", { params: { q } });
        setResults(response.data || []);
      } catch (error) {
        console.error("Error searching HSN codes:", error);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          className="h-10 w-full justify-between px-3 font-mono font-normal"
        >
          <span className="truncate">{value || "Search HSN code…"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start" container={portalContainer}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by code or description…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">Searching…</div>
            )}
            {!loading && query.trim().length < 2 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <CommandEmpty>No matching HSN code.</CommandEmpty>
            )}
            <CommandGroup>
              {results.map((item) => (
                <CommandItem
                  key={item._id}
                  value={item.HSN_CD}
                  onSelect={() => {
                    onSelect(item);
                    setSelectedInfo(item);
                    setOpen(false);
                  }}
                  className="flex flex-col items-start gap-0.5"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium">{item.HSN_CD}</span>
                    {item.GST_Rate && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary">
                        {item.GST_Rate} GST
                      </span>
                    )}
                  </div>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {item.HSN_Description}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {value && selectedInfo?.HSN_CD === value && (
        <div className="mt-1 flex items-start justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">{selectedInfo.HSN_Description}</p>
          {selectedInfo.GST_Rate && (
            <span className="shrink-0 font-mono text-xs font-medium text-primary">
              {selectedInfo.GST_Rate} GST
            </span>
          )}
        </div>
      )}
    </Popover>
  );
}

export default function PurchaseDrawer({ user, fetchUser }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [itemCatalog, setItemCatalog] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState({
    name: "",
    contactNo: "",
    email: "",
    gstIN: "",
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

      if (field === "name") {
        const catalogItem = itemCatalog.find(
          (it) => it.name.toLowerCase() === value.trim().toLowerCase()
        );
        if (catalogItem) {
          updatedItems[index].itemCode = catalogItem.itemCode || "";
          updatedItems[index].hsnCode = catalogItem.hsnCode || "";
          updatedItems[index].gstPer = catalogItem.gstPer || 0;
          if (typeof catalogItem.unitCost === "number") {
            updatedItems[index].unitCost = catalogItem.unitCost;
          }
        }
      }

      const baseAmount =
        parseFloat(updatedItems[index].units) *
          parseFloat(updatedItems[index].unitCost) || 0;

      const gstAmount =
        baseAmount * (parseFloat(updatedItems[index].gstPer) / 100);

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

  const selectedWarehouse = warehouses.find((w) => w._id === purchaseOrder.warehouseID);
  const remainingCapacity =
    selectedWarehouse && selectedWarehouse.capacity !== undefined && selectedWarehouse.capacity !== ""
      ? Number(selectedWarehouse.capacity)
      : null;

  const handleSubmit = async () => {
    const incomingUnits = purchaseOrder.items.reduce((sum, item) => sum + (Number(item.units) || 0), 0);
    if (remainingCapacity !== null && !Number.isNaN(remainingCapacity) && incomingUnits > remainingCapacity) {
      toast.error(
        `This warehouse only has ${remainingCapacity} unit(s) of capacity remaining (requested ${incomingUnits}).`
      );
      return;
    }

    setSaving(true);
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
        items: purchaseOrder.items,
        warehouseID: purchaseOrder.warehouseID,
      };

      await api.post(`/api/purchase/add-purchase`, { ...purchaseDetail });

      toast.success("Purchase order submitted");
      setOpen(false);
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
      showError(error, "Couldn't add purchase order");
    } finally {
      setSaving(false);
    }
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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="gap-1.5">
          <Plus size={16} /> New order
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[96vh]">
        <DrawerHeader className="border-b text-left">
          <DrawerTitle>New purchase order</DrawerTitle>
          <DrawerDescription>Fill in the details to create a new purchase order.</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="po-invoiceNo">Invoice no.</Label>
                <Input
                  id="po-invoiceNo"
                  name="invoiceNo"
                  value={purchaseOrder.invoiceNo}
                  onChange={handleChange}
                  placeholder="Enter invoice number"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="po-email">Supplier email</Label>
                <Input
                  id="po-email"
                  name="email"
                  value={purchaseOrder.email}
                  onChange={handleChange}
                  placeholder="Enter supplier email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="po-name">Supplier name</Label>
                <Input
                  id="po-name"
                  name="name"
                  value={purchaseOrder.name}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="po-contactNo">Supplier contact no.</Label>
                <Input
                  id="po-contactNo"
                  name="contactNo"
                  value={purchaseOrder.contactNo}
                  onChange={handleChange}
                  placeholder="Enter supplier contact no."
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="po-gstIN">Supplier GSTIN/UID</Label>
                <Input
                  id="po-gstIN"
                  name="gstIN"
                  value={purchaseOrder.gstIN}
                  onChange={handleChange}
                  placeholder="Enter supplier GSTIN"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="po-warehouse">
                  Warehouse
                  {remainingCapacity !== null && !Number.isNaN(remainingCapacity) && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({remainingCapacity} unit(s) of capacity remaining)
                    </span>
                  )}
                </Label>
                <Select
                  value={purchaseOrder.warehouseID}
                  onValueChange={(value) =>
                    setPurchaseOrder((prev) => ({ ...prev, warehouseID: value }))
                  }
                >
                  <SelectTrigger id="po-warehouse">
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
              <div className="space-y-1.5">
                <Label htmlFor="po-purchaseDate">Purchase date</Label>
                <Input
                  id="po-purchaseDate"
                  type="date"
                  name="purchaseDate"
                  value={purchaseOrder.purchaseDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addNewItem} className="gap-1.5">
                  <Plus size={14} /> Add item
                </Button>
              </div>

              {purchaseOrder.items.map((item, index) => (
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
                        <Label>Item</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => handleItemChange(index, "name", e.target.value)}
                          placeholder="Enter item name"
                          list={`purchase-item-catalog-${index}`}
                        />
                        <datalist id={`purchase-item-catalog-${index}`}>
                          {itemCatalog.map((catalogItem) => (
                            <option key={catalogItem._id} value={catalogItem.name} />
                          ))}
                        </datalist>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Item code</Label>
                        <Input
                          value={item.itemCode}
                          onChange={(e) => handleItemChange(index, "itemCode", e.target.value)}
                          placeholder="Auto-filled for known items"
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>HSN code</Label>
                        <HsnCodePicker
                          value={item.hsnCode}
                          onSelect={(hsnItem) => {
                            handleItemChange(index, "hsnCode", hsnItem.HSN_CD);
                            const parsedRate = parseFloat(hsnItem.GST_Rate);
                            if (!Number.isNaN(parsedRate)) {
                              handleItemChange(index, "gstPer", parsedRate);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label>Quantity (units)</Label>
                        <Input
                          type="number"
                          value={item.units}
                          onChange={(e) =>
                            handleItemChange(index, "units", parseFloat(e.target.value) || 0)
                          }
                          min="0"
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
                        <Input
                          type="number"
                          value={item.gstPer}
                          onChange={(e) =>
                            handleItemChange(index, "gstPer", parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          max="100"
                          placeholder="Auto-filled for known items"
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Item amount</Label>
                        <Input
                          value={`₹${item.amt.toFixed(2)}`}
                          readOnly
                          className="bg-muted font-mono font-medium"
                        />
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
                  <span className="text-muted-foreground">SGST amount</span>
                  <span className="font-mono font-medium">₹{purchaseOrder.sgstAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST amount</span>
                  <span className="font-mono font-medium">₹{purchaseOrder.cgstAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGST amount</span>
                  <span className="font-mono font-medium">₹{purchaseOrder.igstAmt.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Final amount</span>
                  <span className="font-mono text-primary">₹{purchaseOrder.finalAmt.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t">
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Submitting…" : "Submit purchase order"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
