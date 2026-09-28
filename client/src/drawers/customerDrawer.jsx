import React, { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/axios";
import { showError } from "@/lib/errors";

const AddCustomerModal = ({ isOpen, onClose, onAddCustomer, user }) => {
  const [formData, setFormData] = React.useState({
    customerNo: "",
    customerName: "",
    contactNo: "",
    emailAddress: "",
    address: "",
  });

  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    setIsSubmitting(true);

    try {
      await api.post("/newCustomer/customer/personal", submitData);
      await api.post("/newCustomer/customer-add", submitData);
      toast.success("Customer added successfully!");
      resetForm();
      onClose();
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.error) {
        toast.error(error.response.data.error);
      } else {
        showError(error, "Couldn't add customer");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerNo: "",
      customerName: "",
      contactNo: "",
      emailAddress: "",
      address: "",
    });
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Customer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="customerNo">
              Customer/GST ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerNo"
              name="customerNo"
              value={formData.customerNo}
              onChange={handleChange}
              placeholder="GSTIN27AADCB2230M1ZY/CUST-2020"
              className={errors.customerNo ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.customerNo && <p className="text-xs text-destructive">{errors.customerNo}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerName">
              Customer name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Aryan Bishwas"
              className={errors.customerName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.customerName && <p className="text-xs text-destructive">{errors.customerName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactNo">
              Contact number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className={errors.contactNo ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.contactNo && <p className="text-xs text-destructive">{errors.contactNo}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emailAddress">
              Email address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emailAddress"
              name="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="customer@example.com"
              className={errors.emailAddress ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.emailAddress && <p className="text-xs text-destructive">{errors.emailAddress}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">
              Business address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full business address..."
              rows={3}
              className={errors.address ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
