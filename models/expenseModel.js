const prisma = require("../config/db");

const expenseModel = {
    create: async (data) => {
        const { id, name, price, expenseDate, createdAt, updatedAt } = data;
        return await prisma.expense.create({
            data: {
                id,
                name,
                price,
                expense_date: expenseDate,
                created_at: createdAt,
                updated_at: updatedAt,
            },
            select: {
                id: true,
                name: true,
                price: true,
                expense_date: true,
                created_at: true,
                updated_at: true,
            },
        });
    },

    findMany: async () => {
        return await prisma.expense.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: "asc" },
        });
    },

    findManyByDate: async (date) => {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        return await prisma.expense.findMany({
            where: {
                is_deleted: false,
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { created_at: "asc" },
        });
    },

    findById: async (id) => {
        return await prisma.expense.findFirst({
            where: { id, is_deleted: false },
        });
    },

    update: async (data) => {
        const { id, name, price, expenseDate, updatedAt } = data;
        return await prisma.expense.update({
            where: { id, is_deleted: false },
            data: {
                name,
                price,
                expense_date: expenseDate,
                updated_at: updatedAt,
            },
        });
    },

    delete: async (id) => {
        return await prisma.expense.update({
            where: { id },
            data: {
                is_deleted: true,
            },
        });
    },
};

module.exports = expenseModel;
