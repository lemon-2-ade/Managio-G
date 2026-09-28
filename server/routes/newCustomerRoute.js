import express from "express";
import { publicCustomer } from "../models/publicCustomers.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/customer-add", async (req, res) => {
  try {
    const { customerName, contactNo, emailAddress, address } = req.body;
    // console.log(req.body);
    if (!customerName || !contactNo || !emailAddress || !address) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }
    const publicnewCustomer = new publicCustomer({
      customerName,
      contactNo,
      emailAddress,
      address,
    });
    await publicnewCustomer.save().then((data) => {
      res.status(200).json({
        message: "Customer added successfully!",
        customer: data,
      });
    });
  } catch (error) {
    console.log("Error in posting the customer details", error.message);
  }
});

router.post("/customer/personal", verifyFirebaseToken, async (req, res) => {
  try {
    const { customerName, contactNo, emailAddress, address } = req.body;
    // console.log(req.body);

    const existingCustomer = await publicCustomer.findOne({
      emailAddress,
    });

    if (existingCustomer) {
      // console.log("Customer already exists");
      return res.status(400).json({ error: "Customer already exists" });
    } else {
      const publicnewCustomer = new publicCustomer({
        userID: req.user._id,
        customerName,
        contactNo,
        emailAddress,
        address,
      });

      const newCustomer = await publicnewCustomer.save();
      return res.status(200).json({
        message: "Customer added successfully!",
        customer: newCustomer,
      });
    }
  } catch (error) {
    console.log("Error in posting the customer details", error.message);
    return res.status(500).json({ error: "Server error: " + error.message });
  }
});

router.get("/customer-list", async (req, res) => {
  try {
    const { customerName } = req.query;
    // console.log(req.query);
    const customers = await publicCustomer.findOne({ customerName: customerName });
    res.status(200).json({ customers });
  } catch (error) {
    console.log("Customer not retrieved", error.message);
  }
});
export default router;
