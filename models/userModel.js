const pool = require("../config/db");

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
        await pool.query(
            `
            INSERT INTO users (id, name, email, username, password, role, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    },

    findMany: async () => {
        const [users] = await pool.query(
            `
            SELECT id, name, email, username, password, role, createdAt, updatedAt
            FROM users
            WHERE isDeleted = 0
            ORDER BY createdAt`
        );
        return users;
    },

    findById: async (id) => {
        const [user] = await pool.query(
            `
            SELECT id, name, email, username, password, role, createdAt, updatedAt
            FROM users
            WHERE isDeleted = 0 && id = ?
            `,
            [id]
        );
        return user.length ? user[0] : null;
    },

    findByUsernameOrEmail: async (username, email) => {
        const [user] = await pool.query(
            `
            SELECT id, name, email, username, password, role, createdAt, updatedAt
            FROM users
            WHERE username = ? || email = ?
            `,
            [username, email]
        );
        return user.length ? user[0] : null;
    },

    update: async (data) => {
        const { id, name, email, username, hashedPassword, role, updatedAt } =
            data;
        await pool.query(
            `
            UPDATE users
            SET name = ?,
                email = ?,
                username = ?,
                password = ?,
                role = ?,
                updatedAt = ?
            WHERE isDeleted = 0 && id = ?
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
                isDeleted = 1
            WHERE id = ?
            `,
            [id]
        );
    },

    findManyExceptAdmin: async () => {
        const [users] = await pool.query(
            `
            SELECT id, name, email, username, password, role, createdAt, updatedAt
            FROM users
            WHERE isDeleted = 0 && role != 'admin'
            ORDER BY createdAt
            `
        );
        return users;
    },
};

module.exports = userModel;
