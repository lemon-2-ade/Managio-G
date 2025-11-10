import express from "express";
import { User } from "../models/user.js";

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/update", async (req, res) => {
  try {
    const use_id = req.user._id;
    const { name, companyName, gstIN } = req.body;

    // console.log(req.body);
    const updateUserData = await User.findByIdAndUpdate(
      use_id,
      { name, companyName, gstIN, isNewUser: false },
      { new: true, runValidators: true }
    );
    // console.log(updateUserData);
    if (!updateUserData) {
      return res.status(400).json({ error: "User not found" });
    }
    res.json({ message: "User updated successfully", user: updateUserData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
