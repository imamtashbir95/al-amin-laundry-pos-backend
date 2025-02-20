const pool = require("../config/db");

const billModel = {
    create: async (data) => {
        const { id, billDate, customerId, userId, createdAt, updatedAt } = data;
        await pool.query(
            `
            INSERT INTO bills (id, billDate, customerId, userId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [id, billDate, customerId, userId, createdAt, updatedAt]
        );
    },

    findMany: async () => {
        const [bills] = await pool.query(
            `
            SELECT
                b.id, b.billDate, b.createdAt, b.updatedAt, 
                c.id AS customerId, c.name AS customerName, c.phoneNumber, c.address,
                b.userId
            FROM bills b
            JOIN customers c ON b.customerId = c.id
            WHERE b.isDeleted = 0
            ORDER BY b.createdAt DESC
            `
        );
        return bills;
    },

    findReportIn: async (date) => {
        const [bills] = await pool.query(
            `
            SELECT
                b.id, b.billDate, b.createdAt, b.updatedAt, 
                c.id AS customerId, c.name AS customerName, c.phoneNumber, c.address,
                b.userId
            FROM bills b
            JOIN customers c ON b.customerId = c.id
            WHERE
                b.isDeleted = 0
                AND DATE(b.createdAt) = ?
            ORDER BY b.createdAt DESC
            `,
            [date]
        );
        return bills;
    },

    findReportOut: async (date) => {
        const [bills] = await pool.query(
            `
            SELECT
                b.id, b.billDate, b.createdAt, b.updatedAt, 
                c.id AS customerId, c.name AS customerName, c.phoneNumber, c.address,
                b.userId,
                bd.finishDate, bd.paymentStatus, bd.status
            FROM bills b
            JOIN customers c ON b.customerId = c.id
            JOIN bill_details bd ON b.id = bd.billId
            WHERE
                b.isDeleted = 0
                AND DATE(bd.finishDate) = ?
                AND bd.paymentStatus = "sudah-dibayar"
                AND (bd.status = "selesai" OR bd.status = "diambil")
            ORDER BY b.createdAt DESC
            `,
            [date]
        );
        return bills;
    },

    findReportNotPaidOff: async (date) => {
        const [bills] = await pool.query(
            `
            SELECT
                b.id, b.billDate, b.createdAt, b.updatedAt, 
                c.id AS customerId, c.name AS customerName, c.phoneNumber, c.address,
                b.userId,
                bd.finishDate, bd.paymentStatus, bd.status
            FROM bills b
            JOIN customers c ON b.customerId = c.id
            JOIN bill_details bd ON b.id = bd.billId
            WHERE
                b.isDeleted = 0
                AND DATE(bd.finishDate) <= ?
                AND bd.paymentStatus = "belum-dibayar"
            ORDER BY b.createdAt DESC
            `,
            [date]
        );
        return bills;
    },

    findReportNotTakenYet: async (date) => {
        const [bills] = await pool.query(
            `
            SELECT
                b.id, b.billDate, b.createdAt, b.updatedAt, 
                c.id AS customerId, c.name AS customerName, c.phoneNumber, c.address,
                b.userId,
                bd.finishDate, bd.paymentStatus, bd.status
            FROM bills b
            JOIN customers c ON b.customerId = c.id
            JOIN bill_details bd ON b.id = bd.billId
            WHERE
                b.isDeleted = 0
                AND DATE(bd.finishDate) <= ?
                AND bd.paymentStatus = "sudah-dibayar"
                AND bd.status = "selesai"
            ORDER BY b.createdAt DESC
            `,
            [date]
        );
        return bills;
    },

    findById: async (id) => {
        const [bill] = await pool.query(
            `
            SELECT  
                b.id, b.billDate, b.createdAt, b.updatedAt,
                c.id AS customerId, c.name AS customerName, c.phoneNumber, c.address,
                b.userId
            FROM bills b
            JOIN customers c ON b.customerId = c.id
            WHERE b.isDeleted = 0 && b.id = ?
            `,
            [id]
        );
        return bill.length ? bill[0] : null;
    },

    update: async (data) => {
        const { id, customerId, userId, updatedAt } = data;
        await pool.query(
            `
            UPDATE bills
            SET customerId = ?,
                userId = ?,
                updatedAt = ?
            WHERE isDeleted = 0 && id = ?
            `,
            [customerId, userId, updatedAt, id]
        );
    },

    delete: async (id) => {
        await pool.query(
            `
            UPDATE bills
            SET isDeleted = 1
            WHERE id = ?
            `,
            [id]
        );
    },
};

module.exports = billModel;
