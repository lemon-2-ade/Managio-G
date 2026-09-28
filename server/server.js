import "./config/env.js";

import { createServer } from "http";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import { initSocket } from "./socket.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoute.js";
import hsnRoutes from "./routes/hsnRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import purchaseRoutes from "./routes/purchaseRoute.js";
import salesRoutes from "./routes/salesRoute.js";
import warehouseRoutes from "./routes/warehouseRoute.js";
import newCustomerRoute from "./routes/newCustomerRoute.js";
import supplierRoutes from "./routes/supplierRoutes.js";

const app = express();

//_______________________________________________________________________________________________________________________________________________
const MongoUri = process.env.DATABASE_URI;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());

mongoose
  .connect(MongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

//_______________________________________________________________________________________________________________________________________________

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/hsn", hsnRoutes);
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/newCustomer", newCustomerRoute);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/customer", customerRoutes);

//___________________________________________________________________________________________________________________________________________________
const port = process.env.PORT || 3000;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(3000, "0.0.0.0", () => {
  console.log(`Server running on port ${3000}`);
});
