export default function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token || !token.includes("Igw7K6gNIBKiGh9FPbDZAhJAjFm_O3LNUWY_PBoN-mg")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}
