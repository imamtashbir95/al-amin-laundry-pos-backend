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
        const result = await pool.query(
            `
            INSERT INTO bill_details (id, bill_id, invoice_id, product_id, qty, price, payment_status, status, finish_date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, bill_id, invoice_id, product_id, qty, price, payment_status, status, finish_date, created_at, updated_at
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
        return result.rows[0];
    },

    find: async (data) => {
        const { billId } = data;
        const result = await pool.query(
            `
            SELECT 
                bd.id AS detail_id, bd.invoice_id, p.id AS product_id,
                p.name AS product_name, p.price AS unit_price, p.type, 
                bd.qty, bd.price, bd.payment_status, bd.status, bd.finish_date, bd.created_at, bd.updated_at
            FROM bill_details bd
            JOIN products p ON bd.product_id = p.id
            WHERE bd.bill_id = $1
            ORDER BY bd.created_at DESC
            `,
            [billId]
        );
        return result.rows;
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
            SET invoice_id = $1,
                product_id = $2,
                qty = $3,
                price = $4,
                payment_status = $5,
                status = $6,
                finish_date = $7,
                updated_at = $8
            WHERE id = $9`,
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
