const { body, validationResult } = require("express-validator");

// Function for product validation (without ID, used for create)
const validateProduct = () => [
    body("name")
        .notEmpty()
        .withMessage("Product name is required")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Product name must not exceed 100 characters"),
    body("price")
        .notEmpty()
        .withMessage("Product price is required")
        .bail()
        .isFloat({ gt: 0 })
        .withMessage("Product price must be a positive number")
        .bail()
        .isFloat({ min: 1000 })
        .withMessage("Product price cannot be less than 1,000")
        .bail()
        .isFloat({ max: 9007199254740992n })
        .withMessage("Product price cannot be more than 9,007,199,254,740,992"),
    body("type")
        .notEmpty()
        .withMessage("Product type is required")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Product type must not exceed 100 characters"),
];

// Additional function for ID validation (used for updates)
const validateProductWithId = () => [body("id").notEmpty().withMessage("Product ID is required"), ...validateProduct()];

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
    validateProduct,
    validateProductWithId,
    handleValidationErrors,
};
