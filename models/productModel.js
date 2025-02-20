const pool = require("../config/db");

const productModel = {
    create: async (data) => {
        const { id, name, price, type, createdAt, updatedAt } = data;
        await pool.query(
            `
            INSERT INTO products (id, name, price, type, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [id, name, price, type, createdAt, updatedAt]
        );
    },

    findMany: async () => {
        const [products] = await pool.query(
            `
            SELECT id, name, price, type, createdAt, updatedAt
            FROM products
            WHERE isDeleted = 0
            ORDER BY createdAt`
        );
        return products;
    },

    findById: async (id) => {
        const [product] = await pool.query(
            `
            SELECT id, name, price, type, createdAt, updatedAt 
            FROM products
            WHERE isDeleted = 0 and id = ?
            `,
            [id]
        );
        return product.length ? product[0] : null;
    },

    update: async (data) => {
        const { id, name, price, type, updatedAt } = data;
        await pool.query(
            `
            UPDATE products
            SET name = ?,
                price = ?,
                type = ?,
                updatedAt = ?
            WHERE isDeleted = 0 && id = ?
            `,
            [name, price, type, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE products
            SET isDeleted = 1
            WHERE id = ?
            `,
            [id]
        );
    },
};

module.exports = productModel;
