import express from "express";
import { customers } from "../data/mockData.js";
import { simulateOutbound } from "../services/outboundEngine.js";

const router = express.Router();

// declined_payment_call → POST /admin/outbound/declined-payment
router.post("/declined-payment", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });
    res.json(simulateOutbound("declined", c));
});

// collections_call → POST /admin/outbound/collections
router.post("/collections", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });
    res.json(simulateOutbound("collections", c));
});

// delivery_reminder_call → POST /admin/outbound/delivery-reminder
router.post("/delivery-reminder", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });
    res.json(simulateOutbound("reminder", c));
});

export default router;
