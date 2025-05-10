const handleValidationErrors = require("../middleware/validationMiddleware");
const { body } = require("express-validator");

const validateBaseUser = () => [
    body("name")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Name must not exceed 100 characters"),
    body("email")
        .isEmail()
        .withMessage("Email is invalid")
        .bail()
        .isLength({ min: 5 })
        .withMessage("Email must be at least 5 characters long")
        .bail()
        .isLength({ max: 50 })
        .withMessage("Email must not exceed 50 characters"),
    body("username")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .bail()
        .isLength({ max: 25 })
        .withMessage("Username must not exceed 25 characters")
        .bail()
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username may only contain letters, numbers, and underscores (_)"),
];

const validatePassword = () => [
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
    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password confirmation does not match password");
            }
            return true;
        }),
];

const validateBaseUserForRegister = () => [
    body("gender")
        .notEmpty()
        .withMessage("Gender is required")
        .isIn(["male", "female"])
        .withMessage("Gender must be either male or female"),
    body("language")
        .notEmpty()
        .withMessage("Language is required")
        .isIn(["en", "id"])
        .withMessage("Language must be either English or Indonesia"),
    body("phoneNumber")
        .matches(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/)
        .withMessage("Phone number is invalid")
        .bail()
        .isLength({ min: 10 })
        .withMessage("Phone number must be at least 10 characters long")
        .bail()
        .isLength({ max: 25 })
        .withMessage("Phone number must not exceed 15 characters"),
];

// Function for user validation (without ID, used for create)
const validateUser = () => [
    ...validateBaseUser(),
    ...validatePassword(),
    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "employee"])
        .withMessage("Role must be either 'admin' or 'employee'"),
];

// Additional function for ID validation (used for updates)
const validateUserWithId = () => [body("id").notEmpty().withMessage("User ID is required"), ...validateUser()];

// Additional function for register
const validateUserForRegister = () => [...validateUser(), ...validateBaseUserForRegister()];

// Additional function for update
const validateUserForUpdate = () => [...validateBaseUser(), ...validateBaseUserForRegister()];

const validateUserForUpdatePassword = () => [
    ...validatePassword(),
    body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required")
        .custom((value, { req }) => {
            if (value === req.body.password) {
                throw new Error("New password cannot be the same as the old password");
            }
            return true;
        }),
];

module.exports = {
    validateUser,
    validateUserWithId,
    validateUserForRegister,
    validateUserForUpdate,
    validateUserForUpdatePassword,
    handleValidationErrors,
};
