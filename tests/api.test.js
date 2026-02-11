import request from "supertest";
import app from "../src/app.js";
import { clearDuplicates } from "../src/services/duplicateGuard.js";
import { clearLogs, getLogs } from "../src/services/callLogger.js";

const AUTH = { Authorization: "Bearer Igw7K6gNIBKiGh9FPbDZAhJAjFm_O3LNUWY_PBoN-mg" };

beforeEach(() => {
    clearDuplicates();
    clearLogs();
});

// ── Auth ────────────────────────────────────────────
describe("Auth", () => {
    test("401 without token", async () => {
        const res = await request(app).post("/tools/customer/search").send({ lookup: "002864" });
        expect(res.status).toBe(401);
    });
});

// ── customer_search ─────────────────────────────────
describe("customer_search", () => {
    test("by customerId", async () => {
        const res = await request(app).post("/tools/customer/search").set(AUTH).send({ lookup: "002864" });
        expect(res.body.result).toContain("Jamie");
    });
    test("by phone", async () => {
        const res = await request(app).post("/tools/customer/search").set(AUTH).send({ lookup: "7705957594" });
        expect(res.body.result).toContain("Jamie");
    });
    test("by name", async () => {
        const res = await request(app).post("/tools/customer/search").set(AUTH).send({ lookup: "jamie" });
        expect(res.body.result).toContain("Jamie");
    });
    test("not found", async () => {
        const res = await request(app).post("/tools/customer/search").set(AUTH).send({ lookup: "999999" });
        expect(res.body.result).toContain("not found");
    });
});

// ── customer_details ────────────────────────────────
describe("customer_details", () => {
    test("returns full profile", async () => {
        const res = await request(app).post("/tools/customer/details").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("Jamie Carroll");
        expect(res.body.result).toContain("592 Shannon Drive");
        expect(res.body.result).toContain("7705957594");
    });
});

// ── finance_info ────────────────────────────────────
describe("finance_info", () => {
    test("Jamie finance (no past due)", async () => {
        const res = await request(app).post("/tools/customer/finance-info").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("Balance: $0");
        expect(res.body.result).toContain("VISA");
        expect(res.body.result).toContain("Autopay enabled");
    });
    test("Edward finance (past due)", async () => {
        const res = await request(app).post("/tools/customer/finance-info").set(AUTH).send({ customerId: "002302" });
        expect(res.body.result).toContain("Past due: $84.32");
        expect(res.body.result).toContain("Autopay disabled");
    });
});

// ── account_balance ─────────────────────────────────
describe("account_balance", () => {
    test("Jamie zero balance", async () => {
        const res = await request(app).post("/tools/billing/balance").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("$0");
    });
    test("Edward past due", async () => {
        const res = await request(app).post("/tools/billing/balance").set(AUTH).send({ customerId: "002302" });
        expect(res.body.result).toContain("Past due");
        expect(res.body.result).toContain("$84.32");
    });
});

// ── payment_methods ─────────────────────────────────
describe("payment_methods", () => {
    test("accepts customer_id (Vapi format)", async () => {
        const res = await request(app).post("/tools/billing/payment-methods").set(AUTH).send({ customer_id: "002864" });
        expect(res.body.result).toContain("VISA");
        expect(res.body.result).toContain("3758");
        expect(res.body.result).toContain("enabled");
    });
    test("accepts customerId too", async () => {
        const res = await request(app).post("/tools/billing/payment-methods").set(AUTH).send({ customerId: "002302" });
        expect(res.body.result).toContain("Mastercard");
        expect(res.body.result).toContain("disabled");
    });
});

// ── invoice_history ─────────────────────────────────
describe("invoice_history", () => {
    test("Jamie has invoices", async () => {
        const res = await request(app).post("/tools/billing/invoice-history").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("Invoice history");
        expect(res.body.result).toContain("$42.15");
    });
    test("Edward no invoices", async () => {
        const res = await request(app).post("/tools/billing/invoice-history").set(AUTH).send({ customerId: "002302" });
        expect(res.body.result).toContain("No invoices");
    });
});

// ── invoice_detail ──────────────────────────────────
describe("invoice_detail", () => {
    test("by invoice_key with customer_id", async () => {
        const res = await request(app).post("/tools/billing/invoice-detail").set(AUTH)
            .send({ customer_id: "002864", invoice_key: "INV001" });
        expect(res.body.result).toContain("5 Gallon Spring Water");
        expect(res.body.result).toContain("$42.15");
    });
    test("not found", async () => {
        const res = await request(app).post("/tools/billing/invoice-detail").set(AUTH)
            .send({ customer_id: "002864", invoice_key: "FAKE" });
        expect(res.body.result).toContain("Invoice not found");
    });
});

// ── products ────────────────────────────────────────
describe("products", () => {
    test("list all products", async () => {
        const res = await request(app).post("/tools/billing/products").set(AUTH)
            .send({ customerId: "002864", postalCode: "30066", deliveryId: "DEL-2864-01", internetOnly: true, categories: [] });
        expect(res.body.result).toContain("5 Gallon Spring Water");
        expect(res.body.result).toContain("Cooler Rental");
    });
    test("filter by category", async () => {
        const res = await request(app).post("/tools/billing/products").set(AUTH)
            .send({ customerId: "002864", postalCode: "30066", deliveryId: "DEL-2864-01", internetOnly: true, categories: ["Equipment"] });
        expect(res.body.result).toContain("Cooler Rental");
        expect(res.body.result).not.toContain("5 Gallon Spring Water");
    });
});

// ── payment_expiry_alerts ───────────────────────────
describe("payment_expiry_alerts", () => {
    test("detects expired/expiring card", async () => {
        const res = await request(app).post("/tools/billing/payment-expiry-alerts").set(AUTH)
            .send({ customerId: "002864" });
        // Jamie card expiry 12/2025 — should be expired or expiring by now
        expect(res.body.result).toMatch(/VISA/);
    });
});

// ── delivery_stops ──────────────────────────────────
describe("delivery_stops", () => {
    test("Jamie delivery stops", async () => {
        const res = await request(app).post("/tools/delivery/stops").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("DEL-2864-01");
        expect(res.body.result).toContain("592 Shannon Drive");
    });
});

// ── next_scheduled_delivery ─────────────────────────
describe("next_scheduled_delivery", () => {
    test("Jamie next delivery", async () => {
        const res = await request(app).post("/tools/delivery/next-scheduled").set(AUTH)
            .send({ customerId: "002864", deliveryId: "DEL-2864-01" });
        expect(res.body.result).toContain("November");
        expect(res.body.result).toContain("592 Shannon Drive");
    });
});

// ── default_products ────────────────────────────────
describe("default_products", () => {
    test("Jamie standing order", async () => {
        const res = await request(app).post("/tools/delivery/default-products").set(AUTH)
            .send({ customerId: "002864", deliveryId: "DEL-2864-01" });
        expect(res.body.result).toContain("5 Gallon Spring Water");
        expect(res.body.result).toContain("Cooler Rental");
    });
    test("Edward no standing order", async () => {
        const res = await request(app).post("/tools/delivery/default-products").set(AUTH)
            .send({ customerId: "002302", deliveryId: "DEL-2302-01" });
        expect(res.body.result).toContain("do not have a standing order");
    });
});

// ── delivery_schedule ───────────────────────────────
describe("delivery_schedule", () => {
    test("Jamie schedule", async () => {
        const res = await request(app).post("/tools/delivery/schedule").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("Bi-weekly");
        expect(res.body.result).toContain("Monday");
        expect(res.body.result).toContain("RT-101");
    });
});

// ── delivery_summary ────────────────────────────────
describe("delivery_summary", () => {
    test("Jamie full summary", async () => {
        const res = await request(app).post("/tools/delivery/summary").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("RT-101");
        expect(res.body.result).toContain("Standing order");
        expect(res.body.result).toContain("Next delivery");
    });
    test("Edward summary (no history)", async () => {
        const res = await request(app).post("/tools/delivery/summary").set(AUTH).send({ customerId: "002302" });
        expect(res.body.result).toContain("RT-205");
    });
});

// ── search_orders ───────────────────────────────────
describe("search_orders", () => {
    test("Jamie has pending order", async () => {
        const res = await request(app).post("/tools/delivery/orders/search").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("ORD001");
        expect(res.body.result).toContain("Pending");
    });
    test("Edward no orders", async () => {
        const res = await request(app).post("/tools/delivery/orders/search").set(AUTH).send({ customerId: "002302" });
        expect(res.body.result).toContain("No orders found");
    });
});

// ── order_change_status ─────────────────────────────
describe("order_change_status", () => {
    test("Jamie pending change", async () => {
        const res = await request(app).post("/tools/delivery/order-change-status").set(AUTH).send({ customerId: "002864" });
        expect(res.body.result).toContain("pending order change");
    });
    test("Edward no changes", async () => {
        const res = await request(app).post("/tools/delivery/order-change-status").set(AUTH).send({ customerId: "002302" });
        expect(res.body.result).toContain("No pending order changes");
    });
});

// ── work_order_status ───────────────────────────────
describe("work_order_status", () => {
    test("Jamie has work order", async () => {
        const res = await request(app).post("/tools/delivery/work-orders").set(AUTH).send({ customerId: "002864", limit: 5 });
        expect(res.body.result).toContain("Cooler Pickup");
        expect(res.body.result).toContain("Scheduled");
    });
    test("Edward no work orders", async () => {
        const res = await request(app).post("/tools/delivery/work-orders").set(AUTH).send({ customerId: "002302", limit: 5 });
        expect(res.body.result).toContain("No work orders found");
    });
});

// ── pricing_breakdown ───────────────────────────────
describe("pricing_breakdown", () => {
    test("Jamie standing order pricing", async () => {
        const res = await request(app).post("/tools/delivery/pricing-breakdown").set(AUTH)
            .send({ customerId: "002864", postalCode: "30066" });
        expect(res.body.result).toContain("Standing order pricing");
        expect(res.body.result).toContain("5 Gallon Spring Water");
    });
    test("Edward no standing order", async () => {
        const res = await request(app).post("/tools/delivery/pricing-breakdown").set(AUTH)
            .send({ customerId: "002302", postalCode: "30066" });
        expect(res.body.result).toContain("No standing order");
    });
});

// ── get_contracts ───────────────────────────────────
describe("get_contracts", () => {
    test("Jamie month-to-month", async () => {
        const res = await request(app).post("/tools/contracts/get-contracts").set(AUTH)
            .send({ customerId: "002864", deliveryId: "DEL-2864-01" });
        expect(res.body.result).toContain("month-to-month");
    });
    test("Edward 12-month equipment", async () => {
        const res = await request(app).post("/tools/contracts/get-contracts").set(AUTH)
            .send({ customerId: "002302", deliveryId: "DEL-2302-01" });
        expect(res.body.result).toContain("12-month equipment agreement");
    });
});

// ── send_contract ───────────────────────────────────
describe("send_contract", () => {
    test("sends contract with JotForm link", async () => {
        const res = await request(app).post("/tools/onboarding/send-contract").set(AUTH).send({
            name: "Test User",
            email: "test@test.com",
            phone: "+17705551234",
            address: "100 Main St"
        });
        expect(res.body.email_sent).toBe(true);
        expect(res.body.sms_sent).toBe(true);
        expect(res.body.contract_url).toContain("jotform.com");
        expect(res.body.customer_name).toBe("Test User");
    });
});

// ── route_stops ─────────────────────────────────────
describe("route_stops", () => {
    test("by route code", async () => {
        const res = await request(app).post("/tools/routes/stops").set(AUTH)
            .send({ route: "101", routeDate: "2025-11-24" });
        expect(res.body.result).toContain("592 Shannon Drive");
    });
    test("by account number", async () => {
        const res = await request(app).post("/tools/routes/stops").set(AUTH)
            .send({ route: "101", routeDate: "2025-11-24", accountNumber: "002864" });
        expect(res.body.result).toContain("002864");
    });
});

// ── Outbound: declined_payment_call ─────────────────
describe("declined_payment_call", () => {
    test("triggers outbound", async () => {
        const res = await request(app).post("/admin/outbound/declined-payment").set(AUTH)
            .send({ customerId: "002302", customerPhone: "+17701112222", customerName: "Edward Carroll" });
        expect(res.body.result).toContain("declined");
    });
});

// ── Outbound: collections_call ──────────────────────
describe("collections_call", () => {
    test("triggers collections", async () => {
        const res = await request(app).post("/admin/outbound/collections").set(AUTH)
            .send({ customerId: "002302", customerPhone: "+17701112222", customerName: "Edward Carroll", pastDueAmount: 84.32 });
        expect(res.body.result).toContain("Past due balance");
    });
});

// ── Outbound: delivery_reminder_call ────────────────
describe("delivery_reminder_call", () => {
    test("triggers reminder", async () => {
        const res = await request(app).post("/admin/outbound/delivery-reminder").set(AUTH)
            .send({ customerId: "002864", customerPhone: "+17705957594", customerName: "Jamie Carroll", deliveryDate: "2025-11-24" });
        expect(res.body.result).toContain("Reminder");
    });
});

// ── Outbound duplication ────────────────────────────
describe("Duplicate prevention", () => {
    test("blocks second outbound call", async () => {
        await request(app).post("/admin/outbound/declined-payment").set(AUTH).send({ customerId: "002302" });
        const res = await request(app).post("/admin/outbound/declined-payment").set(AUTH).send({ customerId: "002302" });
        expect(res.body.result).toContain("Duplicate prevented");
    });
});

// ── flag_call ───────────────────────────────────────
describe("flag_call", () => {
    test("flags a call with reason + customerInfo", async () => {
        const res = await request(app).post("/tools/call/flag-call").set(AUTH)
            .send({ reason: "Customer upset", customerInfo: "Jamie Carroll #002864" });
        expect(res.body.result).toContain("flagged successfully");
        expect(res.body.result).toContain("Customer upset");
    });
});

// ── end_call ────────────────────────────────────────
describe("end_call", () => {
    test("ends call with no params", async () => {
        const res = await request(app).post("/tools/call/end-call").set(AUTH)
            .send({});
        expect(res.body.result).toContain("Call ended successfully");
    });
});

// ── Admin ───────────────────────────────────────────
describe("Admin", () => {
    test("health check", async () => {
        const res = await request(app).get("/admin/health").set(AUTH);
        expect(res.body.status).toBe("ok");
        expect(res.body.customers).toBe(2);
    });
    test("list customers", async () => {
        const res = await request(app).get("/admin/customers").set(AUTH);
        expect(res.body.length).toBe(2);
    });
    test("call logger records", async () => {
        await request(app).post("/admin/outbound/collections").set(AUTH).send({ customerId: "002302" });
        const logs = getLogs();
        expect(logs.length).toBe(1);
        expect(logs[0].type).toBe("collections");
    });
});
