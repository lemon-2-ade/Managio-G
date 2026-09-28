import express from "express";
import { Purchase } from "../models/purchase.js";
import { Supplier } from "../models/supplier.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyFirebaseToken);

router.get("/all-suppliers", async (req, res) => {
  try {
    const existingSuppliers = await Supplier.findOne({ userID: req.user._id });

    res.status(200).json(existingSuppliers?.supplierDetails || []);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/top-suppliers", async (req, res) => {
  const { fromDate, toDate } = req.query;

  const startDate = fromDate ? new Date(fromDate) : new Date("1996-01-01");
  const endDate = toDate ? new Date(toDate) : new Date();

  try {
    const topSuppliers = await Purchase.aggregate([
      {
        $match: {
          userID: req.user._id,
        },
      },
      { $unwind: "$purchaseDetails" },
      {
        $match: {
          "purchaseDetails.date": {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$purchaseDetails.supplierDetails._id",
          name: { $first: "$purchaseDetails.supplierDetails.name" },
          amount: { $sum: "$purchaseDetails.finalAmt" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$name",
          amount: "$amount",
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 7 },
    ]);

    const result = topSuppliers.reduce((acc, supliers) => {
      const existingSupplier = acc.find(s => s.name === supliers.name);
      if (existingSupplier) {
        existingSupplier.amount += supliers.amount;
      } else {
        acc.push(supliers);
      }
      return acc;
    }, []);

    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
