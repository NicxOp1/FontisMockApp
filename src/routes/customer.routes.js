import express from "express";
import { customers } from "../data/mockData.js";

const router = express.Router();

// customer_search → POST /tools/customer/search
router.post("/search", (req, res) => {
    console.log("Customer Search Body:", req.body);

    // Try to find the search term in various possible fields
    const lookup = req.body.lookup ||
        req.body.query ||
        req.body.name ||
        req.body.customer_name ||
        req.body.phone ||
        req.body.account ||
        req.body.customerId ||
        (req.body.args && req.body.args.lookup); // Nested check

    if (!lookup) {
        return res.json({ result: "Please provide a name, phone number, or account number to search." });
    }

    const customer = customers.find(c =>
        c.customerId === lookup ||
        c.phone === lookup ||
        (c.name && c.name.toLowerCase().includes(lookup.toLowerCase())) ||
        (c.address && c.address.toLowerCase().includes(lookup.toLowerCase()))
    );

    if (!customer) return res.json({ result: "Customer not found." });

    res.json({ result: `Customer found: ${customer.name}` });
});

// customer_details → POST /tools/customer/details
router.post("/details", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);

    if (!c) return res.json({ result: "Customer not found." });

    res.json({
        result: `Name: ${c.name}. Phone: ${c.phone}. Address: ${c.address}, ${c.city}, ${c.state} ${c.postalCode}. Account #${c.customerId}.`
    });
});

// finance_info → POST /tools/customer/finance-info
router.post("/finance-info", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);

    if (!c) return res.json({ result: "Customer not found." });

    const cardStatus = `${c.paymentMethod.type} ending in ${c.paymentMethod.last4}`;
    const expiry = `expires ${c.cardExpiry.month}/${c.cardExpiry.year}`;
    const autopayStatus = c.autopay ? "Autopay enabled" : "Autopay disabled";
    const balanceInfo = c.pastDue > 0
        ? `Balance: $${c.balance}, Past due: $${c.pastDue}`
        : `Balance: $${c.balance}`;

    res.json({
        result: `${balanceInfo}. Payment: ${cardStatus} (${expiry}). ${autopayStatus}.`
    });
});

export default router;
