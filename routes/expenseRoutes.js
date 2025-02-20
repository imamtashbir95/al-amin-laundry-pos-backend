const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, expenseController.createExpense);
router.get("/", authenticate, expenseController.getAllExpenses);
router.get("/date", authenticate, expenseController.getDateExpenses);
router.get("/:id", authenticate, expenseController.getExpenseById);
router.put("/", authenticate, expenseController.updateExpense);
router.delete("/:id", authenticate, expenseController.deleteExpense);

module.exports = router;
