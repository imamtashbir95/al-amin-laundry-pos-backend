const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const generateId = require("../utils/generateId");
const {
    getCurrentDateAndTime,
    getCurrentTimestampUnix,
} = require("../utils/getCurrent");
const userModel = require("../models/userModel");
const prisma = require("../config/db");

exports.login = [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: { code: 400, description: "Bad Request" },
                errors: errors.array(),
            });
        }

        try {
            const { username, password } = req.body;

            const user = await prisma.user.findFirst({
                where: { username },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    password: true,
                    role: true,
                    created_at: true,
                    updated_at: true,
                },
            });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({
                    status: { code: 401, description: "Unauthorized" },
                    error: "Username or password is wrong",
                });
            }

            const token = jwt.sign(
                {
                    iss: `${process.env.JWT_ISSUER}`,
                    iat: getCurrentTimestampUnix(),
                    userId: user.id,
                    name: user.name,
                    role: user.role,
                },
                `${process.env.JWT_SECRET}`,
                {
                    expiresIn: `${process.env.JWT_LIFE_TIME}h`,
                },
            );

            res.status(201).json({
                status: { code: 201, description: "Ok" },
                data: { token },
            });
        } catch (error) {
            res.status(500).json({
                status: { code: 500, description: "Internal Server Error" },
                error: error.message,
            });
        }
    },
];

exports.register = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Email is invalid"),
    body("username").notEmpty().withMessage("Username is required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    body("role")
        .isIn(["admin", "employee"])
        .withMessage("Role must be either admin or employee"),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: { code: 400, description: "Bad Request" },
                errors: errors.array(),
            });
        }

        const { name, email, username, password, role } = req.body;
        const id = generateId();
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = getCurrentDateAndTime();
        const updatedAt = createdAt;

        try {
            const existingUser = await userModel.findByUsernameOrEmail(
                username,
                email,
            );

            if (existingUser) {
                return res.status(409).json({
                    status: { code: 409, description: "Conflict" },
                    error: "Username or e-mail already exists",
                });
            }

            const newUser = await prisma.user.create({
                data: {
                    id,
                    name,
                    email,
                    username,
                    password: hashedPassword,
                    role,
                    created_at: createdAt,
                    updated_at: updatedAt,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    role: true,
                    created_at: true,
                    updated_at: true,
                },
            });

            res.status(201).json({
                status: { code: 201, description: "Ok" },
                data: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    role: newUser.role,
                    createdAt: newUser.created_at,
                    updatedAt: newUser.updated_at,
                },
            });
        } catch (error) {
            res.status(500).json({
                status: { code: 500, description: "Internal Server Error" },
                error: error.message,
            });
        }
    },
];
