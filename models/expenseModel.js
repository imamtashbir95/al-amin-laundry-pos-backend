const pool = require("../config/db");

const expenseModel = {
    create: async (data) => {
        const { id, name, price, expenseDate, createdAt, updatedAt } = data;
        const result = await pool.query(
            `
            INSERT INTO expenses (id, name, price, expense_date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, price, expense_date, created_at, updated_at
            `,
            [id, name, price, expenseDate, createdAt, updatedAt]
        );
        return result.rows[0];
    },

    findMany: async () => {
        const result = await pool.query(
            `
            SELECT id, name, price, expense_date, created_at, updated_at
            FROM expenses
            WHERE is_deleted = false
            ORDER BY created_at DESC
            `
        );
        return result.rows;
    },

    findManyByDate: async (date) => {
        const result = await pool.query(
            `
            SELECT id, name, price, expense_date, created_at, updated_at
            FROM expenses
            WHERE is_deleted = false AND DATE(created_at) = $1
            ORDER BY created_at DESC
            `,
            [date]
        );
        return result.rows;
    },

    findById: async (id) => {
        const result = await pool.query(
            `
            SELECT id, name, price, expense_date, created_at, updated_at
            FROM expenses
            WHERE is_deleted = false AND id = $1
            `,
            [id]
        );
        return result.rows[0] || null;
    },

    update: async (data) => {
        const { id, name, price, expenseDate, updatedAt } = data;
        await pool.query(
            `
            UPDATE expenses 
            SET name = $1,
                price = $2,
                expense_date = $3,
                updated_at = $4
            WHERE is_deleted = false AND id = $5
            `,
            [name, price, expenseDate, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE expenses
            SET is_deleted = true
            WHERE id = $1
            `,
            [id]
        );
    },
};

module.exports = expenseModel;
