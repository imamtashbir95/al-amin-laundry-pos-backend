const bcrypt = require("bcrypt");
const generateId = require("../utils/generateId");
const userModel = require("../models/userModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const pool = require("../config/db");

// Register a new user
exports.registerUser = async (req, res) => {
    const { name, email, username, password, role } = req.body;
    const id = generateId();
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    try {
        const [existingUser] = await userModel.findByUsernameOrEmail(
            username,
            email
        );

        if (!existingUser) {
            return res.status(409).json({
                status: { code: 409, description: "Conflict" },
                error: "Username atau e-mail sudah ada",
            });
        }

        await userModel.register({
            id,
            name,
            email,
            username,
            hashedPassword,
            role,
            createdAt,
            updatedAt,
        });
        res.status(201).json({
            status: { code: 201, description: "Ok" },
            data: {
                id,
                name,
                email,
                username,
                role,
                createdAt,
                updatedAt,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.findMany();
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: users,
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
    const { id } = req.params;

    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Karyawan tidak ditemukan",
            });
        }

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Update existing user
exports.updateUser = async (req, res) => {
    const { id, name, email, username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedAt = getCurrentDateAndTime();

    try {
        const existingUser = await userModel.findById(id);

        if (!existingUser) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Karyawan tidak ditemukan",
            });
        }

        await userModel.update({
            id,
            name,
            email,
            username,
            hashedPassword,
            role,
            updatedAt,
        });
        const updatedUser = await userModel.findById(id);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Karyawan tidak ditemukan",
            });
        }
        await userModel.delete(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get all users except admin
exports.getAllUsersExceptAdmin = async (req, res) => {
    try {
        const users = await userModel.findManyExceptAdmin();
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};
