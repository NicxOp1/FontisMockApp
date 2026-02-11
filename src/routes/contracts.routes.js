import express from "express";
import { customers } from "../data/mockData.js";

const router = express.Router();

// get_contracts → POST /tools/contracts/get-contracts
router.post("/get-contracts", (req, res) => {
    const { customerId } = req.body;
    const c = customers.find(x => x.customerId === customerId);

    if (!c) return res.json({ result: "Customer not found." });

    if (c.contract.monthToMonth) {
        return res.json({ result: "You are on a month-to-month agreement." });
    }

    const end = new Date(c.contract.endDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric"
    });

    res.json({
        result: `You are on a 12-month equipment agreement ending ${end}.`
    });
});

export default router;
