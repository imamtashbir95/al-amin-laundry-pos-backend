const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAdmin } = require("../middleware/authMiddleware");

router.post("/", isAdmin, userController.registerUser);
router.get("/", isAdmin, userController.getAllUsersExceptAdmin);
router.get("/:id", isAdmin, userController.getUserById);
router.put("/", isAdmin, userController.updateUser);
router.delete("/:id", isAdmin, userController.deleteUser);

module.exports = router;
