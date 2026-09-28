import { useState } from "react";
import api from "@/lib/axios";
import { showError, showSuccess } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditProductPopup = ({ isOpen, onClose, product, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    unitCost: product?.unitCost || 0,
    totalUnits: product?.totalUnits || 0,
    gstPer: product?.gstPer || 0,
  });

  const [selectedWarehouse, setSelectedWarehouse] = useState(
    product?.warehouses?.[0]?._id || ""
  );

  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put("/api/items/update-item", {
        warehouseID: selectedWarehouse.toString(),
        items: formData,
      });

      onUpdate(res.data.updatedItem);
      showSuccess("Product updated");
      onClose();
    } catch (error) {
      showError(error, "Couldn't update product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit product</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-accent p-3">
          <p className="text-xs text-muted-foreground">Product name</p>
          <p className="text-sm font-semibold">{product.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-unitCost">Unit cost</Label>
            <Input
              id="edit-unitCost"
              type="number"
              name="unitCost"
              value={formData.unitCost}
              onChange={handleInputChange}
              className="font-mono"
              required
              step="0.01"
              min="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-totalUnits">Total units</Label>
            <Input
              id="edit-totalUnits"
              type="number"
              name="totalUnits"
              value={formData.totalUnits}
              onChange={handleInputChange}
              className="font-mono"
              required
              min="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-warehouse">Warehouse</Label>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse} required>
              <SelectTrigger id="edit-warehouse">
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                {product.warehouses &&
                  product.warehouses.map((warehouse) => (
                    <SelectItem key={warehouse._id} value={warehouse._id}>
                      {warehouse.name || `Warehouse ${warehouse._id}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductPopup;
