const pool = require("../config/db");

const billDetailsModel = {
    create: async (data) => {
        const {
            id,
            billId,
            invoiceId,
            productId,
            qty,
            price,
            paymentStatus,
            status,
            finishDate,
            createdAt,
            updatedAt,
        } = data;
        await pool.query(
            `
            INSERT INTO bill_details (id, billId, invoiceId, productId, qty, price, paymentStatus, status, finishDate, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                id,
                billId,
                invoiceId,
                productId,
                qty,
                price,
                paymentStatus,
                status,
                finishDate,
                createdAt,
                updatedAt,
            ]
        );
    },

    find: async (data) => {
        const { billId } = data;
        const [details] = await pool.query(
            `
            SELECT 
                bd.id AS detailId, bd.invoiceId, p.id AS productId,
                p.name AS productName, p.price AS unitPrice, p.type, 
                bd.qty, bd.price, bd.paymentStatus, bd.status, bd.finishDate, bd.createdAt, bd.updatedAt
            FROM bill_details bd
            JOIN products p ON bd.productId = p.id
            WHERE bd.billId = ?
            ORDER BY bd.createdAt DESC
            `,
            [billId]
        );
        return details;
    },

    update: async (data) => {
        const {
            id,
            invoiceId,
            productId,
            qty,
            price,
            paymentStatus,
            status,
            finishDate,
            updatedAt,
        } = data;
        await pool.query(
            `
            UPDATE bill_details
            SET invoiceId = ?,
                productId = ?,
                qty = ?,
                price = ?,
                paymentStatus = ?,
                status = ?,
                finishDate = ?,
                updatedAt = ?
            WHERE id = ?`,
            [
                invoiceId,
                productId,
                qty,
                price,
                paymentStatus,
                status,
                finishDate,
                updatedAt,
                id,
            ]
        );
    },
};

module.exports = billDetailsModel;
