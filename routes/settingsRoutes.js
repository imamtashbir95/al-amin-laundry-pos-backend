const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/me", authenticate, settingsController.getCurrentUser);
router.put("/me", authenticate, settingsController.updateCurrentUser);
router.put("/me/password", authenticate, settingsController.updateCurrentUserPassword);

module.exports = router;
