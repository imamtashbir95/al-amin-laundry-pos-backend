const express = require("express");
const notificationController = require("../controllers/notificationController");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");

router.post("/send-whatsapp", authenticate, notificationController.sendWhatsApp);

module.exports = router;
