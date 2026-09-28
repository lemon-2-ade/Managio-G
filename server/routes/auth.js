import express from "express";
import { auth, isConfigured } from "../config/firebaseAdmin.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { User } from "../models/user.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const router = express.Router();

router.post("/sync", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!isConfigured) {
    return res.status(500).json({ error: "Firebase Admin not configured" });
  }

  try {
    const decoded = await auth().verifyIdToken(idToken);
    const authType = decoded.firebase?.sign_in_provider === "google.com" ? "google" : "password";

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = new User({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || "",
        profileImg: decoded.picture || undefined,
        authType,
        isNewUser: true,
      });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /auth/sync:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.get("/user", verifyFirebaseToken, (req, res) => {
  res.status(200).json(req.user);
});

export default router;
