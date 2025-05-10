const handleValidationErrors = require("../middleware/validationMiddleware");
const { body } = require("express-validator");

const validateWhatsAppMessage = () => [
    body("phoneNumber")
        .matches(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/)
        .withMessage("Phone number is invalid")
        .bail()
        .isLength({ min: 10 })
        .withMessage("Phone number must be at least 10 characters long")
        .bail()
        .isLength({ max: 25 })
        .withMessage("Phone number must not exceed 15 characters"),
    body("message").isLength({ min: 1, max: 2200 }).withMessage("Messages must be between 1–2,200 characters."),
];

module.exports = {
    validateWhatsAppMessage,
    handleValidationErrors,
};
