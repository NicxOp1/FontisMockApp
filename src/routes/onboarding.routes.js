import express from "express";

const router = express.Router();

// send_contract → POST /tools/onboarding/send-contract
// Excel schema: name (req), email (req), phone (req), address (req)
// Backend devs sheet: MUST return email_sent, sms_sent, sms_error
router.post("/send-contract", (req, res) => {
    const {
        name,
        email,
        phone,
        address
    } = req.body;

    const contractUrl = `https://form.jotform.com/253003948016452?customerName=${encodeURIComponent(name || "")}&email=${encodeURIComponent(email || "")}&phoneNumber=${encodeURIComponent(phone || "")}&address=${encodeURIComponent(address || "")}`;

    // Simulate: email may fail, SMS always works
    const emailSent = !!email;
    const smsSent = !!phone;
    const smsError = smsSent ? null : "No phone number provided";

    res.json({
        email_sent: emailSent,
        sms_sent: smsSent,
        sms_error: smsError,
        contract_url: contractUrl,
        form_id: "253003948016452",
        customer_name: name
    });
});

export default router;
