const prisma = require("../config/db");

const billModel = {
    create: async (data) => {
        const { id, billDate, customerId, userId, createdAt, updatedAt } = data;
        return await prisma.bill.create({
            data: {
                id,
                bill_date: billDate,
                customer_id: customerId,
                user_id: userId,
                created_at: createdAt,
                updated_at: updatedAt,
            },
            select: {
                id: true,
                bill_date: true,
                customer_id: true,
                user_id: true,
                created_at: true,
                updated_at: true,
            },
        });
    },

    findMany: async () => {
        return await prisma.bill.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: "desc" },
            include: {
                customer: true,
            },
        });
    },

    findReportIn: async (date) => {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        return await prisma.bill.findMany({
            where: {
                is_deleted: false,
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { created_at: "desc" },
            include: {
                customer: true,
            },
        });
    },

    findReportOut: async (date) => {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        return await prisma.bill.findMany({
            where: {
                is_deleted: false,
                bill_details: {
                    some: {
                        finish_date: {
                            gte: startDate,
                            lte: endDate,
                        },
                        payment_status: "paid",
                        status: { in: ["done", "taken"] },
                    },
                },
            },
            orderBy: { created_at: "desc" },
            include: {
                customer: true,
                bill_details: true,
            },
        });
    },

    findReportNotPaidOff: async (date) => {
        return await prisma.bill.findMany({
            where: {
                is_deleted: false,
                bill_details: {
                    some: {
                        finish_date: { lte: new Date(date) },
                        payment_status: "not-paid",
                    },
                },
            },
            orderBy: { created_at: "desc" },
            include: { customer: true, bill_details: true },
        });
    },

    findReportNotTakenYet: async (date) => {
        return await prisma.bill.findMany({
            where: {
                is_deleted: false,
                bill_details: {
                    some: {
                        finish_date: { lte: new Date(date) },
                        payment_status: "paid",
                        status: "done",
                    },
                },
            },
            orderBy: { created_at: "desc" },
            include: { customer: true, bill_details: true },
        });
    },

    findById: async (id) => {
        return await prisma.bill.findFirst({
            where: { id, is_deleted: false },
            include: { customer: true },
        });
    },

    update: async (data) => {
        const { id, customerId, userId, updatedAt } = data;
        return await prisma.bill.update({
            where: { id, is_deleted: false },
            data: {
                customer_id: customerId,
                user_id: userId,
                updated_at: updatedAt,
            },
            select: {
                id: true,
                bill_date: true,
                customer_id: true,
                user_id: true,
                created_at: true,
                updated_at: true,
            },
        });
    },

    delete: async (id) => {
        return await prisma.bill.update({
            where: { id },
            data: {
                is_deleted: true,
            },
        });
    },
};

module.exports = billModel;
