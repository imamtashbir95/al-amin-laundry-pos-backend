const pool = require("../config/db");

const billModel = {
    create: async (data) => {
        const { id, billDate, customerId, userId, createdAt, updatedAt } = data;
        const result = await pool.query(
            `
            INSERT INTO bills (id, bill_date, customer_id, user_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, bill_date, customer_id, user_id, created_at, updated_at
            `,
            [id, billDate, customerId, userId, createdAt, updatedAt]
        );
        return result.rows[0];
    },

    findMany: async () => {
        const result = await pool.query(
            `
            SELECT
                b.id, b.bill_date, b.created_at, b.updated_at, 
                c.id AS customer_id, c.name AS customer_name, c.phone_number, c.address,
                b.user_id
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            WHERE b.is_deleted = false
            ORDER BY b.created_at DESC
            `
        );
        return result.rows;
    },

    findReportIn: async (date) => {
        const result = await pool.query(
            `
            SELECT
                b.id, b.bill_date, b.created_at, b.updated_at, 
                c.id AS customer_id, c.name AS customer_name, c.phone_number, c.address,
                b.user_id
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            WHERE
                b.is_deleted = false
                AND DATE(b.created_at) = $1
            ORDER BY b.created_at DESC
            `,
            [date]
        );
        return result.rows;
    },

    findReportOut: async (date) => {
        const result = await pool.query(
            `
            SELECT
                b.id, b.bill_date, b.created_at, b.updated_at, 
                c.id AS customer_id, c.name AS customer_name, c.phone_number, c.address,
                b.user_id,
                bd.finish_date, bd.payment_status, bd.status
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN bill_details bd ON b.id = bd.bill_id
            WHERE
                b.is_deleted = false
                AND DATE(bd.finish_date) = $1
                AND bd.payment_status = 'sudah-dibayar'
                AND (bd.status = 'selesai' OR bd.status = 'diambil')
            ORDER BY b.created_at DESC
            `,
            [date]
        );
        return result.rows;
    },

    findReportNotPaidOff: async (date) => {
        const result = await pool.query(
            `
            SELECT
                b.id, b.bill_date, b.created_at, b.updated_at, 
                c.id AS customer_id, c.name AS customer_name, c.phone_number, c.address,
                b.user_id,
                bd.finish_date, bd.payment_status, bd.status
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN bill_details bd ON b.id = bd.bill_id
            WHERE
                b.is_deleted = false
                AND DATE(bd.finish_date) <= $1
                AND bd.payment_status = 'belum-dibayar'
            ORDER BY b.created_at DESC
            `,
            [date]
        );
        return result.rows;
    },

    findReportNotTakenYet: async (date) => {
        const result = await pool.query(
            `
            SELECT
                b.id, b.bill_date, b.created_at, b.updated_at, 
                c.id AS customer_id, c.name AS customer_name, c.phone_number, c.address,
                b.user_id,
                bd.finish_date, bd.payment_status, bd.status
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN bill_details bd ON b.id = bd.bill_id
            WHERE
                b.is_deleted = false
                AND DATE(bd.finish_date) <= $1
                AND bd.payment_status = 'sudah-dibayar'
                AND bd.status = 'selesai'
            ORDER BY b.created_at DESC
            `,
            [date]
        );
        return result.rows;
    },

    findById: async (id) => {
        const result = await pool.query(
            `
            SELECT  
                b.id, b.bill_date, b.created_at, b.updated_at,
                c.id AS customer_id, c.name AS customer_name, c.phone_number, c.address,
                b.user_id
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            WHERE b.is_deleted = false AND b.id = $1
            `,
            [id]
        );
        return result.rows[0] || null;
    },

    update: async (data) => {
        const { id, customerId, userId, updatedAt } = data;
        await pool.query(
            `
            UPDATE bills
            SET customer_id = $1,
                user_id = $2,
                updated_at = $3
            WHERE is_deleted = false AND id = $4
            `,
            [customerId, userId, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE bills
            SET is_deleted = true
            WHERE id = $1
            `,
            [id]
        );
    },
};

module.exports = billModel;
