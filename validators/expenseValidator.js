const handleValidationErrors = require("../middleware/validationMiddleware");
const { body } = require("express-validator");

// Function for expense validation (without ID, used for create)
const validateExpense = () => [
    body("name")
        .notEmpty()
        .withMessage("Expense name is required")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Expense name must not exceed 100 characters"),
    body("price")
        .notEmpty()
        .withMessage("Expense price is required")
        .bail()
        .isFloat({ gt: 0 })
        .withMessage("Expense price must be a positive number")
        .bail()
        .isFloat({ min: 1000 })
        .withMessage("Expense price cannot be less than 1,000")
        .bail()
        .isFloat({ max: 2147483647 })
        .withMessage("Expense price cannot be more than 2,147,483,647"),
    body("expenseDate")
        .notEmpty()
        .withMessage("Expense date is required")
        .bail()
        .isISO8601()
        .withMessage("Expense date must be a valid ISO 8601 date"),
];

// Additional function for ID validation (used for updates)
const validateExpenseWithId = () => [body("id").notEmpty().withMessage("Expense ID is required"), ...validateExpense()];

module.exports = {
    validateExpense,
    validateExpenseWithId,
    handleValidationErrors,
};
