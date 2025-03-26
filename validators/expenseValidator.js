const { body, validationResult } = require("express-validator");

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
        .isInt({ max: 9007199254740992n })
        .withMessage("Expense price cannot be more than 9,007,199,254,740,992"),
    body("expenseDate")
        .notEmpty()
        .withMessage("Expense date is required")
        .bail()
        .isISO8601()
        .withMessage("Expense date must be a valid ISO 8601 date"),
];

// Additional function for ID validation (used for updates)
const validateExpenseWithId = () => [body("id").notEmpty().withMessage("Expense ID is required"), ...validateExpense()];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: { code: 400, description: "Bad Request" },
            errors: errors.array(),
        });
    }
    next();
};

module.exports = {
    validateExpense,
    validateExpenseWithId,
    handleValidationErrors,
};
