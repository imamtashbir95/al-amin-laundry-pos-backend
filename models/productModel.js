const prisma = require("../config/db");

const productModel = {
    create: async (data) => {
        const { id, name, price, type, createdAt, updatedAt } = data;
        return await prisma.product.create({
            data: {
                id,
                name,
                price,
                type,
                created_at: createdAt,
                updated_at: updatedAt,
            },
            select: {
                id: true,
                name: true,
                price: true,
                type: true,
                created_at: true,
                updated_at: true,
            },
        });
    },

    findMany: async () => {
        return await prisma.product.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: "asc" },
        });
    },

    findById: async (id) => {
        return await prisma.product.findFirst({
            where: { id, is_deleted: false },
        });
    },

    update: async (data) => {
        const { id, name, price, type, updatedAt } = data;
        return await prisma.product.update({
            where: { id, is_deleted: false },
            data: {
                name,
                price,
                type,
                updated_at: updatedAt,
            },
        });
    },

    delete: async (id) => {
        return await prisma.product.update({
            where: { id },
            data: {
                is_deleted: true,
            },
        })
    },
};

module.exports = productModel;
