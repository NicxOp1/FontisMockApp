import express from "express";
import { flaggedCalls } from "../data/mockData.js";
import { logCall } from "../services/callLogger.js";

const router = express.Router();

// flag_call → POST /tools/call/flag-call
// Excel schema: reason (required), customerInfo (optional)
router.post("/flag-call", (req, res) => {
    const { reason, customerInfo } = req.body;

    const entry = {
        id: `FLAG-${Date.now()}`,
        reason,
        customerInfo: customerInfo || "Not provided",
        timestamp: new Date().toISOString()
    };

    flaggedCalls.push(entry);
    logCall({ type: "flag_call", ...entry });

    res.json({
        result: `Call flagged successfully. Reason: ${reason}. A supervisor will follow up.`
    });
});

// end_call → POST /tools/call/end-call
// Excel schema: {} (no parameters, no required)
router.post("/end-call", (req, res) => {
    logCall({ type: "end_call", timestamp: new Date().toISOString() });

    res.json({
        result: "Call ended successfully."
    });
});

export default router;
