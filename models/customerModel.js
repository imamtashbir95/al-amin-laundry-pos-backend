const pool = require("../config/db");

const customerModel = {
    create: async (data) => {
        const { id, name, phoneNumber, address, createdAt, updatedAt } = data;
        await pool.query(
            `
            INSERT INTO customers (id, name, phone_number, address, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [id, name, phoneNumber, address, createdAt, updatedAt]
        );
    },

    findMany: async () => {
        const result = await pool.query(
            `
            SELECT id, name, phone_number, address, created_at, updated_at
            FROM customers
            WHERE is_deleted = false
            ORDER BY created_at`
        );
        return result.rows;
    },

    findById: async (id) => {
        const result = await pool.query(
            `
            SELECT id, name, phone_number, address, created_at, updated_at
            FROM customers
            WHERE is_deleted = false AND id = $1
            `,
            [id]
        );
        return result.rows[0] || null;
    },

    update: async (data) => {
        const { id, name, phoneNumber, address, updatedAt } = data;
        await pool.query(
            `
            UPDATE customers
            SET name = $1,
                phone_number = $2,
                address = $3,
                updated_at = $4
            WHERE is_deleted = false AND id = $5
            `,
            [name, phoneNumber, address, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE customers
            SET is_deleted = true
            WHERE id = $1
            `,
            [id]
        );
    },
};

module.exports = customerModel;
