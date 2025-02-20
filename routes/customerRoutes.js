const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, customerController.createCustomer);
router.get("/", authenticate, customerController.getAllCustomers);
router.get("/:id", authenticate, customerController.getCustomerById);
router.put("/", authenticate, customerController.updateCustomer);
router.delete("/:id", authenticate, customerController.deleteCustomer);

module.exports = router;
