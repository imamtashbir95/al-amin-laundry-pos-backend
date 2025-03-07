const prisma = require("../config/db");

const customerModel = {
    create: async (data) => {
        const { id, name, phoneNumber, address, createdAt, updatedAt } = data;
        return await prisma.customer.create({
            data: {
                id,
                name,
                phone_number: phoneNumber,
                address,
                created_at: createdAt,
                updated_at: updatedAt,
            },
            select: {
                id: true,
                name: true,
                phone_number: true,
                address: true,
                created_at: true,
                updated_at: true,
            },
        });
    },

    findMany: async () => {
        return await prisma.customer.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: "asc" },
        });
    },

    findById: async (id) => {
        return await prisma.customer.findFirst({
            where: { id, is_deleted: false },
        });
    },

    findByIdWithDeleted: async (id) => {
        return await prisma.customer.findUnique({
            where: { id },
        });
    },

    update: async (data) => {
        const { id, name, phoneNumber, address, updatedAt } = data;
        return await prisma.customer.update({
            where: { id, is_deleted: false },
            data: {
                name,
                phone_number: phoneNumber,
                address,
                updated_at: updatedAt,
            },
        });
    },

    delete: async (id) => {
        return await prisma.customer.update({
            where: { id },
            data: {
                is_deleted: true,
            },
        });
    },
};

module.exports = customerModel;
