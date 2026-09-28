import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  profileImg: {
    type: String,
    default: "https://lh3.googleusercontent.com/a/default-user-photo.jpg",
    required: true,
  },
  firebaseUid: { type: String, required: true, unique: true },
  gstIN: { type: String, default: "" },
  companyName: { type: String, default: "" },
  warehouses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: false },
  ],
  isNewUser: { type: Boolean, default: true },
  authType: { type: String, enum: ["google", "password"], required: true },
});

export const User = mongoose.model("User", userSchema);
