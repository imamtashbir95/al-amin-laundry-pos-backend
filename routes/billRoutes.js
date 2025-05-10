const billController = require("../controllers/billController");
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, billController.createBill);
router.get("/", authenticate, billController.getAllBills);
router.get("/report/in", authenticate, billController.getReportInBills);
router.get("/report/out", authenticate, billController.getReportOutBills);
router.get("/report/not-paid-off", authenticate, billController.getReportNotPaidOffBills);
router.get("/report/not-taken-yet", authenticate, billController.getReportNotTakenYetBills);
router.get("/:id", authenticate, billController.getBillById);
router.put("/", authenticate, billController.updateBill);
router.delete("/:id", authenticate, billController.deleteBill);

module.exports = router;
