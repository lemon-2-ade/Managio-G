import mongoose from "mongoose";

const hsnSchema = new mongoose.Schema({
  HSN_CD: { type: String, required: true },
  HSN_Description: { type: String, required: true },
  GST_Rate: { type: String, required: false },
});

export const HSNItem = mongoose.model("HSNItem", hsnSchema, "hsn-codes");
