const userService = require("../services/userService");
const { handleValidationErrors, validateUser, validateUserWithId } = require("../validators/userValidator");

// Register a new user
exports.registerUser = [
    ...validateUser(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { name, email, username, password, role } = req.body;
            const result = await userService.registerUser(name, email, username, password, role);
            res.status(201).json({
                status: { code: 201, description: "Ok" },
                data: result,
            });
        } catch (error) {
            res.status(error.message.includes("Username") ? 409 : 500).json({
                status: {
                    code: error.message.includes("Username") ? 409 : 500,
                    description: error.message.includes("Username") ? "Conflict" : "Error",
                },
                error: error.message,
            });
        }
    },
];

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const result = await userService.getAllUsers();
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.getUserById(id);
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

// Update existing user
exports.updateUser = [
    ...validateUserWithId(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id, name, email, username, password, role } = req.body;
            const result = await userService.updateUser(id, name, email, username, password, role);
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

// Delete user by ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.status(204).end();
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

// Get all users except admin
exports.getAllUsersExceptAdmin = async (req, res) => {
    try {
        const result = await userService.getAllUsersExceptAdmin();
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(error.message.includes("User") ? 404 : 500).json({
            status: {
                code: error.message.includes("User") ? 404 : 500,
                description: error.message.includes("Username") ? "Not Found" : "Error",
            },
            error: error.message,
        });
    }
};
