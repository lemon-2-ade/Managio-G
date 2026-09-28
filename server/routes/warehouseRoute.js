import express from "express";
import { User } from "../models/user.js";
import { Warehouse } from "../models/warehouse.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyFirebaseToken);

// work in progress
router.post("/item-add", async (req, res) => {
  try {
    const userID = req.user._id;
    const { warehouseDetails } = req.body;
    let query = Warehouse.findOne({ userID: userID });
    const existingWarehouse = await query.exec();

    if (!existingWarehouse) {
      const newWarehouse = new Warehouse({ userID, warehouseDetails });
      await newWarehouse.save();
      res.status(201).json({ message: "Items added to the warehouse!" });
    }
  } catch (error) {
    console.log(error.message);
  }
});

router.post("/info-add", async (req, res) => {
  try {
    const userID = req.user._id;
    const { warehouseDetails } = req.body;

    const newWarehouses = new Warehouse({ userID, warehouseDetails });
    await newWarehouses.save().then((data) => {
      res.status(200).json({
        message: "Warehouse details added successfully!",
        warehouse: data,
      });
    });

    // updating the warehouses in User schema
    const warehouseIDs = newWarehouses.warehouseDetails.map(
      (warehouse) => warehouse._id
    );

    await User.findOneAndUpdate(
      { _id: userID },
      { $set: { warehouses: warehouseIDs } }
    );
  } catch (error) {
    console.log(error.message);
  }
});

router.put("/info-update", async (req, res) => {
  const userID = req.user._id;
  const { warehouseDetails } = req.body;

  for (const warehouse of warehouseDetails) {
    let query = Warehouse.findOne({
      userID: userID,
      "warehouseDetails._id": warehouse._id,
    });
    let doc = await query.exec();

    if (doc) {
      const existingWarehouse = doc.warehouseDetails.find(
        (existingWarehouse) => existingWarehouse._id.toString() === warehouse._id.toString()
      );
      
      if (existingWarehouse.totalUnits) {
        const remaining = warehouse.capacity - existingWarehouse.totalUnits;
        existingWarehouse.capacity = remaining;
      } else {
        existingWarehouse.capacity = warehouse.capacity;
      }
      
      existingWarehouse.name = warehouse.name;
      existingWarehouse.location = warehouse.location;
      existingWarehouse.contactNo = warehouse.contactNo;

      await doc.save();
    } else {
      query = Warehouse.findOne({ userID: userID });
      doc = await query.exec();
      const existingWarehouses = doc.warehouseDetails;
      existingWarehouses.push(warehouse);

      const updatedWarehouses = await Warehouse.findOneAndUpdate(
        { userID: userID },
        { $set: { warehouseDetails: existingWarehouses } }
      );
    }
  }

  // updating the warehouses in User schema
  let query = Warehouse.findOne({ userID: userID });
  let doc = await query.exec();

  const warehouseIDs = [];
  doc.warehouseDetails.forEach((warehouse) => {
    warehouseIDs.push(warehouse._id);
  });

  await User.findOneAndUpdate(
    { _id: userID },
    { $set: { warehouses: warehouseIDs } }
  );

  res.status(200).json({ message: "Warehouse details updated successfully!" });
});

router.get("/info", async (req, res) => {
  try {
    const userID = req.user._id;

    let query = Warehouse.findOne({ userID: userID });
    const existingWarehouses = await query.exec();
    const warehouseDetails = existingWarehouses.warehouseDetails;

    for (const warehouse of warehouseDetails) {
      warehouse.perUsed = (
        (Number(warehouse.totalUnits) /
          (Number(warehouse.capacity) + Number(warehouse.totalUnits))) *
        100
      ).toFixed(2);
      
      if (warehouse.totalUnits) {
        warehouse.totalCapacity = Number(warehouse.capacity) + Number(warehouse.totalUnits);
      } else {
        warehouse.totalCapacity = Number(warehouse.capacity);
      }
    }

    res.status(200).json({
      warehouseDetails: warehouseDetails,
    });
  } catch (error) {
    console.log("error: ", error.message);
  }
});

router.delete("/info-delete", async (req, res) => {
  const userID = req.user._id;
  const { warehouseID } = req.query;

  let query = Warehouse.findOne({ userID: userID });
  let doc = await query.exec();
  if (!doc) {
    return res.status(404).json({ message: "Warehouse not found!" });
  }
  console.log("Before Deletion", doc);

  // updating the Warehouse schema
  const warehouses = doc.warehouseDetails;
  warehouses.forEach((warehouse, index) => {
    if (warehouse._id.toString() == warehouseID) warehouses.splice(index, 1);
  });

  await Warehouse.findOneAndUpdate(
    { userID: userID },
    { $set: { warehouseDetails: warehouses } },
    { new: true }
  );

  // updating the User schema
  query = User.findOne({ _id: userID });
  const user = await query.exec();
  user.warehouses.forEach((_id, index) => {
    if (_id.toString() === warehouseID) {
      user.warehouses.splice(index, 1);
    }
  });

  await User.findOneAndUpdate(
    { _id: userID },
    { $set: { warehouses: user.warehouses } }
  ).then((data) => {
    res.status(201).json({ message: "Warehouse deleted successfully!" });
  });
});

router.put("/item-update", async (req, res) => {
  const userID = req.user._id;
  const { warehouseDetails } = req.body;

  const warehouseQuery = await Warehouse.findOne({ userID: userID });
  const existingWarehouses = warehouseQuery.warehouseDetails;

  for (const warehouse of warehouseDetails) {
    const existingWarehouse = existingWarehouses.find(
      (existingWarehouse) => warehouse._id == existingWarehouse._id
    );

    warehouse.items.forEach((item) => {
      const existingItem = existingWarehouse.items.find(
        (existingItem) => item._id == existingItem._id
      );
      
      existingWarehouse.capacity =
        Number(existingWarehouse.capacity) + Number(existingItem.units) - Number(item.units);
      existingWarehouse.totalUnits =
        Number(existingWarehouse.totalUnits) - (Number(existingItem.units) - Number(item.units));

      existingWarehouse.perUsed =
        (Number(existingWarehouse.totalUnits) /
          (Number(existingWarehouse.capacity) + Number(existingWarehouse.totalUnits))) *
        100;
      existingItem.units = item.units;

    });
  }



  res.status(200).json({
    message: "received!",
  });
});

// work under progress
router.get("/available-space", async (req, res) => {
  try {
    const userID = req.user._id;
    const { warehouseID } = req.query;
    
    let query = Warehouse.findOne(
      {
        userID: userID,
        "warehouseDetails._id": warehouseID,
      },
      {
        "warehouseDetails.capacity.$": 1,
        "warehouseDetails.totalUnits": 1,
      }
    );
    const existingWarehouse = await query.exec();
    console.log(existingWarehouse);
  } catch (error) {
    console.log(error.message);
  }
});

export default router;
