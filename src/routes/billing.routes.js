import express from "express";
import { customers, products as productCatalog } from "../data/mockData.js";

const router = express.Router();

// account_balance → POST /tools/billing/balance
router.post("/balance", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);

    if (!c) return res.json({ result: "Customer not found." });

    if (c.pastDue > 0) {
        return res.json({
            result: `Current balance: $${c.balance}. Past due: $${c.pastDue}.`
        });
    }

    res.json({ result: `Current balance: $${c.balance}.` });
});

// payment_methods → POST /tools/billing/payment-methods
// NOTE: Vapi sends "customer_id" not "customerId"
router.post("/payment-methods", (req, res) => {
    const customerId = req.body.customer_id || req.body.customerId;
    const c = customers.find(x => x.customerId === customerId);

    if (!c) return res.json({ result: "Customer not found." });

    res.json({
        result: `${c.paymentMethod.type} ending in ${c.paymentMethod.last4}. Autopay ${c.autopay ? "enabled" : "disabled"}.`
    });
});

// invoice_history → POST /tools/billing/invoice-history
router.post("/invoice-history", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    if (!c.invoices.length) {
        return res.json({ result: "No invoices found." });
    }

    const summary = c.invoices.map(inv =>
        `${inv.date} - $${inv.total}`
    ).join(", ");

    res.json({ result: `Invoice history: ${summary}` });
});

// invoice_detail → POST /tools/billing/invoice-detail
// NOTE: Vapi sends "customer_id" not "customerId"
router.post("/invoice-detail", (req, res) => {
    const customerId = req.body.customer_id || req.body.customerId;
    const { invoice_key, invoice_date } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    const invoice = c.invoices.find(i =>
        i.key === invoice_key || i.date === invoice_date
    );

    if (!invoice) return res.json({ result: "Invoice not found." });

    const items = invoice.items
        .map(i => `${i.quantity} ${i.product}`)
        .join(", ");

    res.json({
        result: `Invoice from ${invoice.date} includes ${items}. Total $${invoice.total}`
    });
});

// products → POST /tools/billing/products
router.post("/products", (req, res) => {
    const customerId = req.body.customerId;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    const { categories } = req.body;

    let filtered = productCatalog;
    if (categories && categories.length) {
        filtered = productCatalog.filter(p =>
            categories.some(cat => p.category.toLowerCase() === cat.toLowerCase())
        );
    }

    const summary = filtered
        .map(p => `${p.name}: $${p.price}/${p.unit}`)
        .join("; ");

    res.json({ result: `Available products: ${summary}.` });
});

// payment_expiry_alerts → POST /tools/billing/payment-expiry-alerts
router.post("/payment-expiry-alerts", (req, res) => {
    const { customerId, daysThreshold } = req.body;
    const c = customers.find(x => x.customerId === customerId);
    if (!c) return res.json({ result: "Customer not found." });

    const expiryDate = new Date(
        parseInt(c.cardExpiry.year),
        parseInt(c.cardExpiry.month) - 1,
        28
    );
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    const threshold = daysThreshold || 60;

    if (daysUntilExpiry <= 0) {
        return res.json({
            result: `ALERT: ${c.paymentMethod.type} ending in ${c.paymentMethod.last4} is EXPIRED (${c.cardExpiry.month}/${c.cardExpiry.year}). Please update payment method.`
        });
    }

    if (daysUntilExpiry <= threshold) {
        return res.json({
            result: `WARNING: ${c.paymentMethod.type} ending in ${c.paymentMethod.last4} expires in ${daysUntilExpiry} days (${c.cardExpiry.month}/${c.cardExpiry.year}).`
        });
    }

    res.json({
        result: `Payment method ${c.paymentMethod.type} ending in ${c.paymentMethod.last4} is current. Expires ${c.cardExpiry.month}/${c.cardExpiry.year}.`
    });
});

export default router;
