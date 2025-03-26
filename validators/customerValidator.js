const { body, validationResult } = require("express-validator");

// Function for customer validation (without ID, used for create)
const validateCustomer = () => [
    body("name")
        .notEmpty()
        .withMessage("Customer name is required")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Customer name must not exceed 100 characters"),
    body("phoneNumber")
        .isLength({ min: 10 })
        .withMessage("Phone number must be at least 10 characters long")
        .bail()
        .isLength({ max: 25 })
        .withMessage("Phone number must not exceed 15 characters")
        .matches(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/)
        .withMessage("Phone number is invalid"),
    body("address")
        .notEmpty()
        .withMessage("Address is required")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Address must not exceed 100 characters")
];

// Additional function for ID validation (used for updates)
const validateCustomerWithId = () => [body("id").notEmpty().withMessage("Customer ID is required"), ...validateCustomer()];

// Middleware to handle validation erros
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: { code: 400, description: "Bad Request" },
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateCustomer,
    validateCustomerWithId,
    handleValidationErrors
}