const {
    handleValidationErrors,
    validateUserForUpdate,
    validateUserForUpdatePassword,
} = require("../validators/userValidator");
const settingsService = require("../services/settingsService");

exports.getCurrentUser = async (req, res) => {
    try {
        const { id } = req.user;
        const result = await settingsService.getCurrentUser(id);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(error.message.includes("User") ? 404 : 500).json({
            status: {
                code: error.message.includes("User") ? 404 : 500,
                description: error.message.includes("User") ? "Not Found" : "Error",
            },
            error: error.message,
        });
    }
};

exports.updateCurrentUser = [
    ...validateUserForUpdate(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id } = req.user;
            const { name, email, username, gender, language, phoneNumber } = req.body;
            const result = await settingsService.updateCurrentUser(
                id,
                name,
                email,
                username,
                gender,
                language,
                phoneNumber,
            );
            res.status(200).json({
                status: { code: 200, description: "Ok" },
                data: result,
            });
        } catch (error) {
            let statusCode = 500;
            let description = "Internal Server Error";

            if (error.message.includes("not found")) {
                statusCode = 404;
                description = "Not Found";
            } else if (error.message.includes("already exists")) {
                statusCode = 409;
                description = "Conflict";
            }

            res.status(statusCode).json({
                status: {
                    code: statusCode,
                    description,
                },
                error: error.message,
            });
        }
    },
];

exports.updateCurrentUserPassword = [
    ...validateUserForUpdatePassword(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id } = req.user;
            const { oldPassword, password } = req.body;
            const result = await settingsService.updateCurrentUserPassword(id, oldPassword, password);
            res.status(200).json({
                status: { code: 200, description: "Ok" },
                data: result,
            });
        } catch (error) {
            let statusCode = 500;
            let description = "Internal Server Error";

            if (error.message.includes("not found")) {
                statusCode = 404;
                description = "Not Found";
            } else if (error.message.includes("is wrong")) {
                statusCode = 403;
                description = "Forbidden";
            }

            res.status(statusCode).json({
                status: {
                    code: statusCode,
                    description,
                },
                error: error.message,
            });
        }
    },
];
