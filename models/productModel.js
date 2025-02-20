const pool = require("../config/db");

const productModel = {
    create: async (data) => {
        const { id, name, price, type, createdAt, updatedAt } = data;
        await pool.query(
            `
            INSERT INTO products (id, name, price, type, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [id, name, price, type, createdAt, updatedAt]
        );
    },

    findMany: async () => {
        const result = await pool.query(
            `
            SELECT id, name, price, type, created_at, updated_at
            FROM products
            WHERE is_deleted = false
            ORDER BY created_at`
        );
        return result.rows;
    },

    findById: async (id) => {
        const result = await pool.query(
            `
            SELECT id, name, price, type, created_at, updated_at 
            FROM products
            WHERE is_deleted = false AND id = $1
            `,
            [id]
        );
        return result.rows[0] || null;
    },

    update: async (data) => {
        const { id, name, price, type, updatedAt } = data;
        await pool.query(
            `
            UPDATE products
            SET name = $1,
                price = $2,
                type = $3,
                updated_at = $4
            WHERE is_deleted = false AND id = $5
            `,
            [name, price, type, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE products
            SET is_deleted = true
            WHERE id = $1
            `,
            [id]
        );
    },
};

module.exports = productModel;
