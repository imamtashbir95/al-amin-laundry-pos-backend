const prisma = require("../config/db");

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
        return await prisma.billDetail.create({
            data: {
                id,
                bill_id: billId,
                invoice_id: invoiceId,
                product_id: productId,
                qty,
                price,
                payment_status: paymentStatus,
                status,
                finish_date: finishDate,
                created_at: createdAt,
                updated_at: updatedAt,
            },
            select: {
                id: true,
                bill_id: true,
                invoice_id: true,
                product_id: true,
                qty: true,
                price: true,
                payment_status: true,
                status: true,
                finish_date: true,
                created_at: true,
                updated_at: true,
            },
        });
    },

    find: async (data) => {
        const { billId } = data;
        return await prisma.billDetail.findMany({
            where: {
                bill_id: billId,
            },
            orderBy: {
                created_at: "desc",
            },
            include: {
                product: true,
            },
        });
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
        return await prisma.billDetail.update({
            where: { id },
            data: {
                invoice_id: invoiceId,
                product_id: productId,
                qty,
                price,
                payment_status: paymentStatus,
                status,
                finish_date: finishDate,
                updated_at: updatedAt,
            },
            select: {
                id: true,
                bill_id: true,
                invoice_id: true,
                product_id: true,
                qty: true,
                price: true,
                payment_status: true,
                status: true,
                finish_date: true,
                created_at: true,
                updated_at: true,
            },
        });
    },
};

module.exports = billDetailsModel;
