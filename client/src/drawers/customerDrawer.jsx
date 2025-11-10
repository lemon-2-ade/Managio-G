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
import axios from "axios";

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

    try {
      const userID = user._id;
      console.log(userID);

      const newCustomerPersonal = await axios.post(
        `${import.meta.env.VITE_API_URL}/newCustomer/customer/personal`,
        { userID, ...submitData },
        { withCredentials: true }
      );
      console.log(newCustomerPersonal.data);
      alert("Customer Already exists");

      const newCustomer = await axios.post(
        `${import.meta.env.VITE_API_URL}/newCustomer/customer-add`,
        submitData,
        { withCredentials: true }
      );
      console.log(newCustomer.data);
      toast.success("Customer added successfully!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding customer:", error);
      // setErrors({ form: "Failed to add customer. Please try again." });
      alert("Failed to add customer. Please try again.");
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
          <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-700 text-sm">
            {/* <toast className="h-5 w-5 text-red-500 mt-0.5" /> */}
            <p>{errors.form}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerNo" className="text-gray-700">
              Customer/GST ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerNo"
              name="customerNo"
              value={formData.customerNo}
              onChange={handleChange}
              placeholder="GSTIN27AADCB2230M1ZY/CUST-2020"
              className={
                errors.customerNo ? "border-red-300 focus:border-red-500" : ""
              }
            />

            <p className="text-sm text-red-500">{errors.customerNo}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerNo" className="text-gray-700">
              Customer/GST ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Aryan Bishwas"
              className={
                errors.customerName ? "border-red-300 focus:border-red-500" : ""
              }
            />

            <p className="text-sm text-red-500">{errors.customerNo}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNo" className="text-gray-700">
              Contact Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className={
                errors.contactNo ? "border-red-300 focus:border-red-500" : ""
              }
            />

            <p className="text-sm text-red-500">{errors.contactNo}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailAddress" className="text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="emailAddress"
              name="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="customer@example.com"
              className={
                errors.emailAddress ? "border-red-300 focus:border-red-500" : ""
              }
            />
            {errors.emailAddress && (
              <p className="text-sm text-red-500">{errors.emailAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-700">
              Business Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full business address..."
              rows={3}
              className={
                errors.address ? "border-red-300 focus:border-red-500" : ""
              }
            />

            <p className="text-sm text-red-500">{errors.address}</p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-400 hover:bg-cyan-900 transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
