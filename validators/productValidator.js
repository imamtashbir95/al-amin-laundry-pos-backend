const handleValidationErrors = require("../middleware/validationMiddleware");
const { body } = require("express-validator");

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
        .isFloat({ max: 2147483647 })
        .withMessage("Product price cannot be more than 2,147,483,647"),
    body("type")
        .notEmpty()
        .withMessage("Product type is required")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Product type must not exceed 100 characters"),
];

// Additional function for ID validation (used for updates)
const validateProductWithId = () => [body("id").notEmpty().withMessage("Product ID is required"), ...validateProduct()];

module.exports = {
    validateProduct,
    validateProductWithId,
    handleValidationErrors,
};
