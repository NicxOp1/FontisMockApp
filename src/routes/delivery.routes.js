import express from "express";
import { customers } from "../data/mockData.js";

const router = express.Router();

// delivery_stops → POST /tools/delivery/stops
router.post("/stops", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    if (!c.deliveryStops || !c.deliveryStops.length) {
        return res.json({ result: "No delivery stops found." });
    }

    const stops = c.deliveryStops
        .map(s => `Stop ${s.deliveryId}: ${s.address}, ${s.city} ${s.state} ${s.postalCode}`)
        .join("; ");

    res.json({ result: stops });
});

// next_scheduled_delivery → POST /tools/delivery/next-scheduled
router.post("/next-scheduled", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    const date = new Date(c.nextDelivery);
    const formatted = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric"
    });

    res.json({
        result: `Your next scheduled delivery is on ${formatted} at ${c.address}.`
    });
});

// default_products → POST /tools/delivery/default-products
router.post("/default-products", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    if (!c.standingOrder.length) {
        return res.json({ result: "You do not have a standing order." });
    }

    const summary = c.standingOrder
        .map(p => `${p.quantity} ${p.product}`)
        .join(", ");

    res.json({ result: `Your standing order includes ${summary}.` });
});

// delivery_schedule → POST /tools/delivery/schedule
router.post("/schedule", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    const sched = c.deliverySchedule;
    res.json({
        result: `Delivery schedule: ${sched.frequency} on ${sched.dayOfWeek}, ${sched.timeWindow}. Route ${sched.routeId}.`
    });
});

// delivery_summary → POST /tools/delivery/summary
router.post("/summary", (req, res) => {
    const { customerId, includeDefaults, includeNextDelivery } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    let parts = [];

    // Route & schedule
    const sched = c.deliverySchedule;
    parts.push(`Route ${sched.routeId}, ${sched.frequency} on ${sched.dayOfWeek} (${sched.timeWindow})`);

    // Standing order
    if (includeDefaults !== false && c.standingOrder.length) {
        const defaults = c.standingOrder.map(p => `${p.quantity} ${p.product}`).join(", ");
        parts.push(`Standing order: ${defaults}`);
    }

    // Next delivery
    if (includeNextDelivery !== false) {
        const date = new Date(c.nextDelivery);
        const formatted = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
        parts.push(`Next delivery: ${formatted}`);
    }

    // Delivery history
    if (c.deliveryHistory.length) {
        parts.push(`Last delivery: ${c.deliveryHistory[0].date} (${c.deliveryHistory[0].status})`);
    }

    res.json({ result: parts.join(". ") + "." });
});

// search_orders → POST /tools/delivery/orders/search
router.post("/orders/search", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    if (!c.orders.length)
        return res.json({ result: "No orders found." });

    const summary = c.orders.map(o =>
        `Order ${o.id}: ${o.status}${o.changeRequested ? " (change requested)" : ""}`
    ).join("; ");

    res.json({ result: summary });
});

// order_change_status → POST /tools/delivery/order-change-status
router.post("/order-change-status", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    const pending = c.orders.find(o => o.changeRequested);

    if (!pending)
        return res.json({ result: "No pending order changes." });

    res.json({ result: "You have a pending order change." });
});

// work_order_status → POST /tools/delivery/work-orders
router.post("/work-orders", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    if (!c.workOrders.length)
        return res.json({ result: "No work orders found." });

    const summary = c.workOrders.map(w =>
        `${w.type} scheduled on ${w.date} (${w.status})`
    ).join(", ");

    res.json({ result: summary });
});

// pricing_breakdown → POST /tools/delivery/pricing-breakdown
router.post("/pricing-breakdown", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    if (!c.standingOrder.length) {
        return res.json({ result: "No standing order to price." });
    }

    const breakdown = c.standingOrder
        .map(p => `${p.quantity}x ${p.product} @ $${p.unitPrice || "N/A"} = $${p.lineTotal || "N/A"}`)
        .join("; ");

    res.json({
        result: `Standing order pricing: ${breakdown}.`
    });
});

export default router;
