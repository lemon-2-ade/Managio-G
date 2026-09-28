import { auth, isConfigured } from "../config/firebaseAdmin.js";
import { User } from "../models/user.js";

export async function resolveUserFromToken(idToken) {
  if (!idToken || !isConfigured) return null;

  const decoded = await auth().verifyIdToken(idToken);
  return User.findOne({ firebaseUid: decoded.uid });
}

export async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!isConfigured) {
    return res.status(500).json({ error: "Firebase Admin not configured" });
  }

  try {
    const user = await resolveUserFromToken(idToken);

    if (!user) {
      return res.status(401).json({ error: "User not synced", code: "USER_NOT_SYNCED" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
