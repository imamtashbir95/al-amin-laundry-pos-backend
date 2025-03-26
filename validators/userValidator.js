const { body, validationResult } = require("express-validator");

// Function for user validation (without ID, used for create)
const validateUser = () => [
    body("name")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Name must not exceed 100 characters"),
    body("username")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .bail()
        .isLength({ max: 25 })
        .withMessage("Username must not exceed 25 characters")
        .bail()
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username may only contain letters, numbers, and underscores (_)"),
    body("password")
        .isLength({ min: 3 })
        .withMessage("Password must be at least 3 characters long")
        .bail()
        .isLength({ max: 255 })
        .withMessage("Password must not exceed 255 characters")
        .bail()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()]).*$/)
        .withMessage(
            "Password must consist of one uppercase letter, one number, and one special character (!@#$%^&*())",
        ),
    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "employee"])
        .withMessage("Role must be either admin or employee"),
];

// Additional function for ID validation (used for updates)
const validateUserWithId = () => [body("id").notEmpty().withMessage("User ID is required"), ...validateUser()];

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
    validateUser,
    validateUserWithId,
    handleValidationErrors,
};
