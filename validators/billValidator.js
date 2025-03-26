const { body, validationResult } = require("express-validator");

// Function for bill validation (without ID, used for create)
const validateBill = () => [
    // Validate customerId
    body("customerId")
        .notEmpty()
        .withMessage("Customer ID is required")
        .bail()
        .isUUID()
        .withMessage("Customer ID must be a valid UUID"),

    // Validate billDetails as an array
    body("billDetails").isArray({ min: 1 }).withMessage("Bill details must be a non-empty array"),

    // Validate each item in billDetails
    body("billDetails.*.invoiceId")
        .notEmpty()
        .withMessage("Invoice ID is required")
        .bail()
        .isString()
        .withMessage("Invoice ID must be a string"),

    body("billDetails.*.product.id")
        .notEmpty()
        .withMessage("Product ID is required")
        .bail()
        .isUUID()
        .withMessage("Product ID must be a valid UUID"),

    body("billDetails.*.qty")
        .notEmpty()
        .withMessage("Quantity is required")
        .bail()
        .isInt({ min: 1 })
        .withMessage("Quantity must be an integer greater than 0")
        .bail()
        .isFloat({ gt: 0 })
        .withMessage("Quantity must be a positive number")
        .bail()
        .isFloat({ max: 9007199254740992n })
        .withMessage("Quantity cannot be more than 9,007,199,254,740,992"),
    body("billDetails.*.paymentStatus")
        .notEmpty()
        .withMessage("Payment status is required")
        .bail()
        .isIn(["sudah-dibayar", "belum-dibayar"])
        .withMessage("Payment status must be 'sudah-dibayar' or 'belum-dibayar'"),

    body("billDetails.*.status")
        .notEmpty()
        .withMessage("Status is required")
        .bail()
        .isIn(["baru", "proses", "selesai"])
        .withMessage("Status must be 'baru', 'proses', or 'selesai'"),

    body("billDetails.*.finishDate")
        .notEmpty()
        .withMessage("Finish date is required")
        .bail()
        .isISO8601()
        .withMessage("Finish date must be a valid ISO 8601 date"),
];

// Additional function for ID validation (used for updates)
const validateBillWithId = () => [body("id").notEmpty().withMessage("Bill ID is required"), ...validateBill()];

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
    validateBill,
    validateBillWithId,
    handleValidationErrors
};
