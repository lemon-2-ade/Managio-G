import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";
import { showError } from "@/lib/errors";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Warehouse as WarehouseIcon, Plus, Trash2, ChevronDown } from "lucide-react";

function Profile({ user, refreshUser }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [openLocation, setOpenLocation] = useState({});

  const fetchWarehouseDetail = async () => {
    try {
      const { data } = await api.get(`/api/warehouse/info`, {
        params: { userID: user?._id },
      });
      localStorage.setItem("warehouses", JSON.stringify(data.warehouseDetails));
      setWarehouses(data.warehouseDetails);
    } catch (err) {
      console.error("Failed to load warehouse details:", err);
    }
  };

  useEffect(() => {
    fetchWarehouseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({
    name: user.name || "",
    companyName: user.companyName || "",
    gstIN: user.gstIN || "",
    email: user.email || "",
  });

  const [warehouses, setWarehouses] = useState([
    {
      name: "",
      capacity: "",
      location: { line1: "", line2: "", city: "", state: "", pincode: "", country: "" },
      contactNo: "",
    },
  ]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWarehouseChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWarehouses = [...warehouses];

    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      updatedWarehouses[index] = {
        ...updatedWarehouses[index],
        location: { ...updatedWarehouses[index].location, [field]: value },
      };
    } else {
      updatedWarehouses[index] = { ...updatedWarehouses[index], [name]: value };
    }

    setWarehouses(updatedWarehouses);
  };

  const addWarehouse = () => {
    setWarehouses([
      ...warehouses,
      {
        name: "",
        capacity: "",
        location: { line1: "", line2: "", city: "", state: "", pincode: "", country: "" },
        contactNo: "",
      },
    ]);
  };

  const removeWarehouse = async (index) => {
    const previousWarehouses = warehouses;
    const removedID = warehouses[index]._id;
    setWarehouses(warehouses.filter((_, i) => i !== index));
    try {
      await api.delete(`/api/warehouse/info-delete`, {
        params: { userID: user._id, warehouseID: removedID },
      });
      toast.success("Warehouse deleted successfully!");
      fetchWarehouseDetail();
    } catch (error) {
      setWarehouses(previousWarehouses);
      showError(error, "Couldn't delete warehouse");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const submitData = { ...formData };
    const warehouseData = { userID: user?._id, warehouseDetails: warehouses };

    try {
      if (user?.isNewUser) {
        await api.post("/api/warehouse/info-add", warehouseData);
      } else {
        await api.put("/api/warehouse/info-update", warehouseData);
      }

      await api.put("/api/update", submitData);
      toast.success("Profile updated successfully!");
      await refreshUser();
      navigate("/dashboard");
    } catch (error) {
      showError(error, "Couldn't save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Company profile</h1>
        <p className="text-sm text-muted-foreground">Business details shown on your invoices and purchase orders.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Company details</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Contact name</Label>
              <Input id="profile-name" name="name" value={formData.name} onChange={handleProfileChange} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-gstin">GSTIN</Label>
              <Input
                id="profile-gstin"
                name="gstIN"
                value={formData.gstIN}
                onChange={handleProfileChange}
                placeholder="e.g. 22AAAAA0000A1Z5"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-company">Company name</Label>
              <Input
                id="profile-company"
                name="companyName"
                value={formData.companyName}
                onChange={handleProfileChange}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" name="email" value={formData.email} onChange={handleProfileChange} placeholder="you@company.com" />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <WarehouseIcon size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Warehouses</h2>
          </div>

          {warehouses.map((warehouse, index) => (
            <Card key={index} className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Warehouse #{index + 1}
                  {warehouse.name ? ` — ${warehouse.name}` : ""}
                </h3>
                {warehouses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWarehouse(index)}
                    className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`wh-name-${index}`}>Warehouse name</Label>
                  <Input
                    id={`wh-name-${index}`}
                    name="name"
                    value={warehouse.name}
                    onChange={(e) => handleWarehouseChange(index, e)}
                    placeholder="e.g. Main Warehouse"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`wh-capacity-${index}`}>Capacity (sq ft)</Label>
                  <Input
                    id={`wh-capacity-${index}`}
                    name="capacity"
                    value={warehouse.capacity}
                    onChange={(e) => handleWarehouseChange(index, e)}
                    placeholder="e.g. 5000"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`wh-contact-${index}`}>Contact number</Label>
                  <Input
                    id={`wh-contact-${index}`}
                    name="contactNo"
                    value={warehouse.contactNo}
                    onChange={(e) => handleWarehouseChange(index, e)}
                    placeholder="e.g. 9876543210"
                    className="font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenLocation((prev) => ({ ...prev, [index]: !prev[index] }))}
                className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary"
              >
                <ChevronDown size={13} className={`transition-transform ${openLocation[index] ? "rotate-180" : ""}`} />
                Location details
              </button>

              {openLocation[index] && (
                <div className="mt-3 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`wh-line1-${index}`}>Address line 1</Label>
                    <Input
                      id={`wh-line1-${index}`}
                      name="location.line1"
                      value={warehouse.location.line1}
                      onChange={(e) => handleWarehouseChange(index, e)}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`wh-line2-${index}`}>Address line 2</Label>
                    <Input
                      id={`wh-line2-${index}`}
                      name="location.line2"
                      value={warehouse.location.line2}
                      onChange={(e) => handleWarehouseChange(index, e)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`wh-city-${index}`}>City</Label>
                    <Input
                      id={`wh-city-${index}`}
                      name="location.city"
                      value={warehouse.location.city}
                      onChange={(e) => handleWarehouseChange(index, e)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`wh-state-${index}`}>State</Label>
                    <Input
                      id={`wh-state-${index}`}
                      name="location.state"
                      value={warehouse.location.state}
                      onChange={(e) => handleWarehouseChange(index, e)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`wh-pincode-${index}`}>Pincode</Label>
                    <Input
                      id={`wh-pincode-${index}`}
                      name="location.pincode"
                      value={warehouse.location.pincode}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`wh-country-${index}`}>Country</Label>
                    <Input
                      id={`wh-country-${index}`}
                      name="location.country"
                      value={warehouse.location.country}
                      onChange={(e) => handleWarehouseChange(index, e)}
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addWarehouse} className="gap-1.5">
            <Plus size={14} /> Add warehouse
          </Button>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
