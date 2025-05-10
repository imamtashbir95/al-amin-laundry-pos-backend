const express = require("express");
const cors = require("cors");
const winston = require("winston");
const errorHandler = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const billRoutes = require("./routes/billRoutes");
const customerRoutes = require("./routes/customerRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const productRoutes = require("./routes/productRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bills", billRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/users", userRoutes);

app.use(errorHandler);

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        }),
    ),
    transports: [new winston.transports.File({ filename: `${process.env.LOG_FILE}` })],
});

module.exports = app;
