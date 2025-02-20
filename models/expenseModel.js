const pool = require("../config/db");

const expenseModel = {
    create: async (data) => {
        const { id, name, price, expenseDate, createdAt, updatedAt } = data;
        await pool.query(
            `
            INSERT INTO expenses (id, name, price, expenseDate, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [id, name, price, expenseDate, createdAt, updatedAt]
        );
    },

    findMany: async () => {
        const [expenses] = await pool.query(
            `
            SELECT id, name, price, expenseDate, createdAt, updatedAt
            FROM expenses
            WHERE isDeleted = 0
            ORDER BY createdAt DESC
            `
        );
        return expenses;
    },

    findManyByDate: async (date) => {
        const [expenses] = await pool.query(
            `
            SELECT id, name, price, expenseDate, createdAt, updatedAt
            FROM expenses
            WHERE isDeleted = 0 AND DATE(createdAt) = ?
            ORDER BY createdAt DESC
            `,
            [date]
        );
        return expenses;
    },

    findById: async (id) => {
        const [expense] = await pool.query(
            `
            SELECT id, name, price, expenseDate, createdAt, updatedAt
            FROM expenses
            WHERE isDeleted = 0 && id = ?
            `,
            [id]
        );
        return expense.length ? expense[0] : null;
    },

    update: async (data) => {
        const { id, name, price, expenseDate, updatedAt } = data;
        await pool.query(
            `
            UPDATE expenses 
            SET name = ?,
                price = ?,
                expenseDate = ?,
                updatedAt = ?
            WHERE isDeleted = 0 && id = ?
            `,
            [name, price, expenseDate, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE expenses
            SET isDeleted = 1
            WHERE id = ?
            `,
            [id]
        );
    },
};

module.exports = expenseModel;
