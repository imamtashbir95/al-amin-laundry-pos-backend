const pool = require("../config/db");

const customerModel = {
    create: async (data) => {
        const { id, name, phoneNumber, address, createdAt, updatedAt } = data;
        await pool.query(
            `
            INSERT INTO customers (id, name, phoneNumber, address, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [id, name, phoneNumber, address, createdAt, updatedAt]
        );
    },

    findMany: async () => {
        const [customers] = await pool.query(
            `
            SELECT id, name, phoneNumber, address, createdAt, updatedAt
            FROM customers
            WHERE isDeleted = 0
            ORDER BY createdAt`
        );
        return customers;
    },

    findById: async (id) => {
        const [customer] = await pool.query(
            `
            SELECT id, name, phoneNumber, address, createdAt, updatedAt
            FROM customers
            WHERE isDeleted = 0 && id = ?
            `,
            [id]
        );
        return customer.length ? customer[0] : null;
    },

    update: async (data) => {
        const { id, name, phoneNumber, address, updatedAt } = data;
        await pool.query(
            `
            UPDATE customers
            SET name = ?,
                phoneNumber = ?,
                address = ?,
                updatedAt = ?
            WHERE isDeleted = 0 && id = ?
            `,
            [name, phoneNumber, address, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE customers
            SET isDeleted = 1
            WHERE id = ?
            `,
            [id]
        );
    },
};

module.exports = customerModel;
