import express from "express";
import { customers } from "../data/mockData.js";

const router = express.Router();

// route_stops → POST /tools/routes/stops
router.post("/stops", (req, res) => {
    const { route, routeDate, accountNumber } = req.body;

    // If filtering by account number, find customer
    if (accountNumber) {
        const c = customers.find(x => x.customerId === accountNumber);
        if (!c) return res.json({ result: "Customer not found on this route." });

        const stop = c.routeStops[0];
        if (!stop) return res.json({ result: "No stops found for this customer." });

        return res.json({
            result: `Route ${route} on ${routeDate}: Stop for account ${accountNumber} at ${c.address} (${stop.timeEstimate}). Status: Scheduled.`
        });
    }

    // Return all stops on the route
    const allStops = [];
    for (const c of customers) {
        if (c.deliverySchedule.routeId === `RT-${route}` || c.deliverySchedule.routeId === route) {
            for (const s of c.routeStops) {
                allStops.push(`Stop ${s.stop}: ${s.address} (${s.timeEstimate}) - Account ${c.customerId}`);
            }
        }
    }

    if (!allStops.length) {
        return res.json({ result: `No stops found for route ${route} on ${routeDate}.` });
    }

    res.json({ result: `Route ${route} on ${routeDate}: ${allStops.join("; ")}.` });
});

export default router;
