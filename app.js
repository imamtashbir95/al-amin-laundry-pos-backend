const express = require("express");
const twilio = require("twilio");
const winston = require("winston");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const billRoutes = require("./routes/billRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
);

app.post("/send-whatsapp", async (req, res) => {
    const { phoneNumber, message } = req.body;

    const toInternationalPhone = (phone) => phone.replace(/^0/, "62");

    try {
        const response = await client.messages.create({
            body: message,
            from: `whatsapp:+${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:+${toInternationalPhone(phoneNumber)}`,
        });

        res.status(200).json({
            success: true,
            message: "WhatsApp message sent successfully",
            sid: response.sid,
        });
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send WhatsApp message",
            error: error.message,
        });
    }
});

// client.messages
//     .create({
//         body: `
// As-salāmu ʿalaikum wa-raḥmatu -llāhi wa-barakātuhᵘ̄
// Selamat datang di *Umi Laundry*! 🧺✨

// Perum. Vila Rizki Ilhami, Kel. Bojong Nangka, Kec. Kelapa Dua, Kab. Tangerang, Banten 15810
// 📍 Depan Masjid Khoirurroziqin
// 🕒 Buka setiap hari, Jam 08.00 - 20.00 WIB

// Mohon pilih layanan yang Anda butuhkan:
// 1️⃣ *Cek Status Cucian*
// 2️⃣ *Jemput Laundry*
// 3️⃣ *Harga & Layanan*
// 4️⃣ *Promo & Diskon*
// 5️⃣ *Bantuan*

// Silakan ketik angka sesuai pilihan Anda. Kami siap membantu! 🤗

// Terima kasih telah mempercayakan cucian Anda kepada *Ummi Laundry*!
// `,
//         from: `whatsapp:+${process.env.TWILIO_WHATSAPP_NUMBER}`,
//         to: `whatsapp:+6282128321689`,
//     })
//     .then((message) => console.log(message.sid))
//     .done();

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/bills", billRoutes);
app.use("/expenses", expenseRoutes);

app.use(errorHandler);

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        }),
    ),
    transports: [
        new winston.transports.File({ filename: `${process.env.LOG_FILE}` }),
    ],
});

module.exports = app;
