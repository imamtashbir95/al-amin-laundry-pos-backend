const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            status: { code: 401, description: "Unauthorized" },
            error: "Token not found",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [
            decoded.userId,
        ]);

        const user = result.rows;
        if (!user) throw new Error("User not found");

        req.user = user[0];
        next();
    } catch (error) {
        res.status(401).json({
            status: { code: 401, description: "Unauthorized" },
            error: error.message,
        });
    }
};

const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            status: { code: 401, description: "Unauthorized" },
            error: "Token not found",
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
        return res.status(403).json({
            status: { code: 403, description: "Forbidden" },
            error: "Access denied. Only admin users are allowed",
        });
    }
    next();
};

module.exports = { authenticate, isAdmin };
