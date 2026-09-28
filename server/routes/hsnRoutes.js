import express from "express";
import { HSNItem } from "../models/hsnCodes.js";

const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/search", async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (q.length < 2) {
            return res.status(200).json([]);
        }

        const regex = new RegExp(escapeRegex(q), "i");
        const results = await HSNItem.find(
            { $or: [{ HSN_CD: regex }, { HSN_Description: regex }] },
            { HSN_CD: 1, HSN_Description: 1, GST_Rate: 1 }
        ).limit(25);

        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching HSN codes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/hsnAdd/:hsn_code", async (req, res) => {
    try {
        const { hsn_code } = req.params;
        const item = await HSNItem.findOne({ HSN_CD: hsn_code });

        if (!item) {
            return res.status(404).json({ error: "HSN Code not found" });
        }

        res.json(item);
    } catch (error) {
        console.error("Error fetching HSN details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;