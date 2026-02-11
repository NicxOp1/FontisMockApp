import express from "express";
import cors from "cors";
import auth from "./middleware/auth.js";
import customerRoutes from "./routes/customer.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import contractsRoutes from "./routes/contracts.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js";
import routesRoutes from "./routes/routes.routes.js";
import outboundRoutes from "./routes/outbound.routes.js";
import callRoutes from "./routes/call.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(auth);

// Retell Compatibility: Automatically un-nest "args" into top-level req.body
app.use((req, res, next) => {
    if (req.body && req.body.args) {
        let args = req.body.args;
        if (typeof args === 'string') {
            try { args = JSON.parse(args); } catch (e) { }
        }
        if (typeof args === 'object' && args !== null) {
            Object.assign(req.body, args);
        }
    }
    next();
});

// Echo route for testing
app.post("/debug/echo", (req, res) => res.json({
    received: req.body,
    final_customerId: req.body.customerId,
    final_lookup: req.body.lookup
}));

// Vapi tool routes — exact path match
app.use("/tools/customer", customerRoutes);
app.use("/tools/billing", billingRoutes);
app.use("/tools/delivery", deliveryRoutes);
app.use("/tools/contracts", contractsRoutes);
app.use("/tools/onboarding", onboardingRoutes);
app.use("/tools/routes", routesRoutes);
app.use("/tools/call", callRoutes);

// Admin routes
app.use("/admin/outbound", outboundRoutes);
app.use("/admin", adminRoutes);

export default app;
