import express from "express";
import mongoose from "mongoose";
import { Item } from "../models/items.js";
import { Purchase } from "../models/purchase.js";
import { Supplier } from "../models/supplier.js";
import { User } from "../models/user.js";
import { Warehouse } from "../models/warehouse.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { getIO } from "../socket.js";

const router = express.Router();
router.use(verifyFirebaseToken);

async function getItemsByWarehouseID(userID, warehouseID) {
  try {
    const result = await Warehouse.aggregate([
      { $match: { userID: new mongoose.Types.ObjectId(userID) } },
      { $unwind: "$warehouseDetails" },
      {
        $match: {
          "warehouseDetails._id": new mongoose.Types.ObjectId(warehouseID),
        },
      },
      {
        $project: {
          items: "$warehouseDetails.items",
          _id: 0,
        },
      },
    ]);

    if (result.length > 0) {
      return result[0].items;
    } else {
      return [];
    }
  } catch (error) {
    return { error: error.message };
  }
}

async function calculateCosts(items) {
  let finalAmt = 0;
  let taxAmt = 0;

  items.forEach((item) => {
    const amt = item.units * item.unitCost;
    const tax = (amt * item.gstPer) / 100;

    item.amt = amt + tax;
    finalAmt += amt + tax;
    taxAmt += tax;
  });

  return { finalAmt, taxAmt };
}

async function validateWarehouseCapacity(userID, warehouseID, items) {
  const warehouseDoc = await Warehouse.findOne({
    userID,
    "warehouseDetails._id": warehouseID,
  });
  const warehouseDetails = warehouseDoc?.warehouseDetails.find(
    (warehouse) => warehouse._id.toString() === warehouseID
  );

  if (!warehouseDetails) {
    return "Selected warehouse could not be found.";
  }

  // An unset capacity means the warehouse has no declared space limit yet.
  if (warehouseDetails.capacity === undefined || warehouseDetails.capacity === null || warehouseDetails.capacity === "") {
    return null;
  }

  const remaining = Number(warehouseDetails.capacity);
  if (Number.isNaN(remaining)) {
    return null;
  }

  const incomingUnits = (items || []).reduce((sum, item) => sum + (Number(item.units) || 0), 0);

  if (incomingUnits > remaining) {
    return `This warehouse only has ${remaining} unit(s) of capacity remaining (requested ${incomingUnits}).`;
  }

  return null;
}

async function addNewEntries(purchaseDetails) {
  const { userID, supplierDetails, invoiceNo, items, warehouseID } =
    purchaseDetails;
  const { finalAmt, taxAmt } = await calculateCosts(items);

  /* adding new purchase to db */
  const newPurchase = new Purchase({
    userID: userID,
    purchaseDetails: [
      {
        supplierDetails: supplierDetails,
        invoiceNo: invoiceNo,
        items: items,
        taxAmt: taxAmt,
        finalAmt: finalAmt,
        warehouseID: warehouseID,
      },
    ],
  });
  await newPurchase.save();

  purchaseDetails = newPurchase.purchaseDetails[0];
  const totalItems = items.reduce((acc, item) => acc + item.units, 0);

  /* updating the warehouse details */
  let query = Warehouse.findOne({ userID: userID });
  let doc = await query.exec();

  const warehouseDetails = doc.warehouseDetails[0];
  for (const item of purchaseDetails.items) {
    warehouseDetails.items.push({
      _id: item._id,
      name: item.name,
      units: item.units,
    });
  }

  warehouseDetails.totalUnits = totalItems;
  warehouseDetails.totalAmt = finalAmt;
  warehouseDetails.capacity -= totalItems;

  await doc.save();

  /* adding items to the db */
  const newItems = new Item({ userID: userID });
  for (const item of purchaseDetails.items) {
    newItems.itemDetails.push({
      _id: item.id,
      name: item.name,
      hsnCode: item.hsnCode ? item.hsnCode : "",
      itemCode: item.itemCode ? item.itemCode : "",
      gstPer: item.gstPer,
      warehouses: [
        {
          _id: warehouseID,
          units: item.units,
        },
      ],
      unitCost: item.unitCost,
      supplierID: [purchaseDetails.supplierDetails._id],
      totalUnits: item.units,
    });
  }
  await newItems.save();

  /* adding supplier details to the db */
  const purchaseID = purchaseDetails._id;
  const newSupplier = new Supplier({
    userID: userID,
    supplierDetails: [
      {
        purchaseID: purchaseID,
        ...purchaseDetails.supplierDetails,
      },
    ],
  });
  await newSupplier.save();
}

async function updateEntries(purchaseDetails) {
  let { userID, supplierDetails, invoiceNo, items, warehouseID } =
    purchaseDetails;
  const { finalAmt, taxAmt } = await calculateCosts(items);

  /* updating the purchase details */
  const purchaseQuery = Purchase.findOne({ userID: userID });
  const user = await purchaseQuery.exec();

  let existingSuppliers = await Supplier.findOne({
    userID: userID,
    "supplierDetails.gstIN": supplierDetails.gstIN,
  }); // this will give 'null' if no such match is found
  let supplierExists = false;

  /* retrieving the supplierID is it exists */
  if (existingSuppliers) {
    supplierExists = true;
    supplierDetails._id = existingSuppliers.supplierDetails.find(
      (supplier) => supplier.name === supplierDetails.name
    )?._id;
  }

  /* retirieving the item IDs if they exist */
  let existingItems = await Item.findOne({
    userID: userID,
    "itemDetails.name": { $in: items.map((item) => item.name) },
  }); // this will give 'null' if no such match is found

  if (existingItems) {
    items.forEach((item) => {
      item._id = existingItems.itemDetails.find(
        (existingItem) => existingItem.name === item.name
      )?._id;
    });
  }

  /* adding new purchase details */
  user.purchaseDetails.push({
    supplierDetails: supplierDetails,
    invoiceNo: invoiceNo,
    items: items,
    taxAmt: taxAmt,
    finalAmt: finalAmt,
    warehouseID: warehouseID,
  });

  await user.save();
  // console.log("Sales saved successfully!");

  const lastPurchaseDetails =
    user.purchaseDetails[user.purchaseDetails.length - 1];
  items = lastPurchaseDetails.items;
  supplierDetails._id = lastPurchaseDetails.supplierDetails._id;
  const totalItems = items.reduce((acc, item) => acc + item.units, 0);

  /* updating the warehouse details */
  const existingWarehouses = await Warehouse.findOne({ userID: userID });
  const warehouseDetails = existingWarehouses.warehouseDetails.find(
    (warehouse) => warehouse._id == warehouseID
  );
  // console.log(existingWarehouses.warehouseDetails);

  items.forEach((item) => {
    const existingItem = warehouseDetails.items.find(
      (warehouseItem) => warehouseItem._id.toString() === item._id.toString()
    );

    // console.log(existingItem);
    if (existingItem) {
      existingItem.units += item.units;
    } else {
      warehouseDetails.items.push({
        _id: item._id,
        name: item.name,
        units: item.units,
      });
    }
  });

  if (!warehouseDetails.totalUnits) {
    warehouseDetails.totalUnits = totalItems;
  } else {
    warehouseDetails.totalUnits += totalItems;
  }

  if (!warehouseDetails.totalAmt) {
    warehouseDetails.totalAmt = finalAmt;
  } else {
    warehouseDetails.totalAmt += finalAmt;
  }

  if (!warehouseDetails.capacity) {
    warehouseDetails.capacity = totalItems;
  } else {
    warehouseDetails.capacity -= totalItems;
  }

  await existingWarehouses.save();
  // console.log("Warehouse saved successfully!");

  if (existingItems) {
    items.forEach((item) => {
      const existingItem = existingItems.itemDetails.find(
        (existingItem) => existingItem._id.toString() === item._id.toString()
      );

      if (existingItem) {
        if (item.unitCost > existingItem.unitCost) {
          existingItem.unitCost = item.unitCost;
        }
        if (item.hsnCode) {
          existingItem.hsnCode = item.hsnCode;
        }
        if (item.itemCode) {
          existingItem.itemCode = item.itemCode;
        }
        if (item.gstPer) {
          existingItem.gstPer = item.gstPer;
        }

        existingItem.totalUnits += item.units;
        const warehouse = existingItem.warehouses.find(
          (warehouse) => warehouse._id.toString() === warehouseID
        );

        if (warehouse) {
          warehouse.units += item.units;
        } else {
          existingItem.warehouses.push({
            _id: warehouseID,
            units: item.units,
          });
        }

        const supplier = existingItem.supplierID.find(
          (supplier) => supplier.toString() === supplierDetails._id.toString()
        );

        if (!supplier) {
          existingItem.supplierID.push(supplierDetails._id);
        }
      } else {
        existingItems.itemDetails.push({
          _id: item._id,
          name: item.name,
          hsnCode: item.hsnCode ? item.hsnCode : "",
          itemCode: item.itemCode ? item.itemCode : "",
          gstPer: item.gstPer,
          warehouses: [{ _id: warehouseID, units: item.units }],
          unitCost: item.unitCost,
          supplierID: [supplierDetails._id],
          totalUnits: item.units,
        });
      }
    });
  } else {
    existingItems = await Item.findOne({ userID: userID });
    
    for (const item of items) {
      existingItems.itemDetails.push({
        _id: item._id,
        name: item.name,
        hsnCode: item.hsnCode ? item.hsnCode : "",
        itemCode: item.itemCode ? item.itemCode : "",
        gstPer: item.gstPer,
        warehouses: [{ _id: warehouseID, units: item.units }],
        unitCost: item.unitCost,
        supplierID: [supplierDetails._id],
        totalUnits: item.units,
      });
    }
  }
  
  await existingItems.save();
  // console.log("Items saved successfully!");

  /* updating the supplier details */
  if (existingSuppliers) {
    const existingSupplier = existingSuppliers.supplierDetails.find(
      (supplier) => supplier.gstIN === supplierDetails.gstIN
    );
    existingSupplier.purchaseID.push(lastPurchaseDetails._id);
    // console.log(existingSupplier)
  } else {
    existingSuppliers = await Supplier.findOne({ userID: userID });
    existingSuppliers.supplierDetails.push({
      purchaseID: [lastPurchaseDetails._id],
      ...supplierDetails,
    });
  }

  await existingSuppliers.save();
  // console.log("Supplier saved successfully!");
}

router.get("/all-purchases", async (req, res) => {
  try {
    const userID = req.user._id;
    const query = Purchase.findOne({ userID: userID });
    const doc = await query.exec();

    if (!doc) {
      res.status(400).json({ purchaseDetails: null });
      return;
    } else {
      res.status(200).json({
        purchaseDetails: doc.purchaseDetails,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

router.post("/add-purchase", async (req, res) => {
  try {
    const purchaseDetails = req.body;
    purchaseDetails.userID = req.user._id;

    const capacityError = await validateWarehouseCapacity(
      purchaseDetails.userID,
      purchaseDetails.warehouseID,
      purchaseDetails.items
    );
    if (capacityError) {
      return res.status(400).json({ error: capacityError });
    }

    let purchaseQuery = Purchase.findOne({ userID: purchaseDetails.userID });
    const existingUser = await purchaseQuery.exec();

    if (!existingUser) {
      await addNewEntries(purchaseDetails);
    } else {
      await updateEntries(purchaseDetails);
    }

    getIO().to(String(req.user._id)).emit("dashboard:refresh");
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong while creating the purchase order." });
  }
});

router.get("/report", async (req, res) => {
  try {
    const userID = req.user._id;
    const { purchaseID } = req.query;

    let purchaseReport = await Purchase.findOne({
      userID: userID,
      "purchaseDetails._id": purchaseID,
    });
    purchaseReport = purchaseReport.purchaseDetails.find((purchase) => 
      purchase._id.toString() === purchaseID
    );

    res.status(200).json(purchaseReport);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/total-purchase", async (req, res) => {
  try {
    const userID = req.user._id;
    const { fromDate, toDate } = req.query;

    const startDate = fromDate ? new Date(fromDate) : new Date();
    const endDate = toDate ? new Date(toDate) : new Date();

    const totalPurchase = await Purchase.aggregate([
      { $match: { userID: userID } },
      { $unwind: "$purchaseDetails" },
      {
        $match: {
          "purchaseDetails.date": { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmt: { $sum: "$purchaseDetails.finalAmt" },
          totalTax: { $sum: "$purchaseDetails.taxAmt" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmt: "$totalAmt",
          totalTax: "$totalTax",
        },
      }
    ]);
    
    res.status(200).json(totalPurchase);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
