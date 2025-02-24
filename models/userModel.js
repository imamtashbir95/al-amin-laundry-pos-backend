const pool = require("../config/db");
const { findByIdWithDeleted } = require("./customerModel");

const userModel = {
    register: async (data) => {
        const {
            id,
            name,
            email,
            username,
            hashedPassword,
            role,
            createdAt,
            updatedAt,
        } = data;
        const result = await pool.query(
            `
            INSERT INTO users (id, name, email, username, password, role, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, email, username, role, created_at, updated_at
            `,
            [
                id,
                name,
                email,
                username,
                hashedPassword,
                role,
                createdAt,
                updatedAt,
            ]
        );
        return result.rows[0];
    },

    findMany: async () => {
        const result = await pool.query(
            `
            SELECT id, name, email, username, password, role, created_at, updated_at
            FROM users
            WHERE is_deleted = false
            ORDER BY created_at`
        );
        return result.rows;
    },

    findById: async (id) => {
        const result = await pool.query(
            `
            SELECT id, name, email, username, password, role, created_at, updated_at
            FROM users
            WHERE is_deleted = false AND id = $1
            `,
            [id]
        );
        return result.rows[0] || null;
    },

    findByIdWithDeleted: async (id) => {
        const result = await pool.query(
            `
            SELECT id, name, email, username, password, role, created_at, updated_at
            FROM users
            WHERE id = $1
            `,
            [id]
        );
        return result.rows[0] || null;
    },

    findByUsernameOrEmail: async (username, email) => {
        const result = await pool.query(
            `
            SELECT id, name, email, username, password, role, created_at, updated_at
            FROM users
            WHERE username = $1 OR email = $2
            `,
            [username, email]
        );
        return result.rows[0] || null;
    },

    update: async (data) => {
        const { id, name, email, username, hashedPassword, role, updatedAt } =
            data;
        await pool.query(
            `
            UPDATE users
            SET name = $1,
                email = $2,
                username = $3,
                password = $4,
                role = $5,
                updated_at = $6
            WHERE is_deleted = false AND id = $7
            `,
            [name, email, username, hashedPassword, role, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE users
            SET email = CONCAT(email, '_deleted_', UNIX_TIMESTAMP()),
                username = CONCAT(username, '_deleted_', UNIX_TIMESTAMP()),
                is_deleted = true
            WHERE id = $1
            `,
            [id]
        );
    },

    findManyExceptAdmin: async () => {
        const result = await pool.query(
            `
            SELECT id, name, email, username, password, role, created_at, updated_at
            FROM users
            WHERE is_deleted = false AND role != 'admin'
            ORDER BY created_at
            `
        );
        return result.rows;
    },
};

module.exports = userModel;
