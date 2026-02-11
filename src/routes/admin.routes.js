import express from "express";
import { customers } from "../data/mockData.js";
import { getLogs } from "../services/callLogger.js";

const router = express.Router();

router.get("/health", (req, res) => {
    res.json({ status: "ok", customers: customers.length });
});

router.get("/customers", (req, res) => {
    res.json(customers);
});

router.get("/logs", (req, res) => {
    res.json(getLogs());
});

export default router;
