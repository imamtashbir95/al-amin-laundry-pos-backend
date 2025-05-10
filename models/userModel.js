const prisma = require("../config/db");

const userModel = {
    register: async (data) => {
        const { id, name, email, username, hashedPassword, passwordUpdatedAt, role, createdAt, updatedAt } = data;
        return await prisma.user.create({
            data: {
                id,
                name,
                email,
                username,
                password: hashedPassword,
                password_updated_at: passwordUpdatedAt,
                role,
                created_at: createdAt,
                updated_at: updatedAt,
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                created_at: true,
                updated_at: true,
            },
        });
    },

    findMany: async () => {
        return await prisma.user.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: "asc" },
        });
    },

    findById: async (id) => {
        return await prisma.user.findFirst({
            where: { id, is_deleted: false },
        });
    },

    findByIdWithDeleted: async (id) => {
        return await prisma.user.findUnique({
            where: { id },
        });
    },

    findByUsernameOrEmail: async (username, email) => {
        return await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
    },

    update: async (data) => {
        const { id, name, email, username, hashedPassword, passwordUpdatedAt, role, updatedAt } = data;
        return await prisma.user.update({
            where: { id, is_deleted: false },
            data: {
                name,
                email,
                username,
                password: hashedPassword,
                password_updated_at: passwordUpdatedAt,
                role,
                updated_at: updatedAt,
            },
        });
    },

    updateCurrent: async (data) => {
        const { id, name, email, username, gender, language, phoneNumber, updatedAt } = data;
        return await prisma.user.update({
            where: { id, is_deleted: false },
            data: {
                name,
                email,
                username,
                gender,
                language,
                phone_number: phoneNumber,
                updated_at: updatedAt
            }
        });
    },

    updatePassword: async (data) => {
        const { id, hashedPassword, passwordUpdatedAt, updatedAt } = data;
        return await prisma.user.update({
            where: { id, is_deleted: false },
            data: {
                password: hashedPassword,
                password_updated_at: passwordUpdatedAt,
                updated_at: updatedAt,
            },
        });
    },

    delete: async (id) => {
        return await prisma.$executeRaw`
        UPDATE "User"
        SET email = email || '_deleted_' || EXTRACT(EPOCH FROM NOW()),
            username = username || '_deleted_' || EXTRACT(EPOCH FROM NOW()),
            is_deleted = true
        WHERE id = ${id}
    `;
    },

    findManyExceptAdmin: async () => {
        return await prisma.user.findMany({
            where: { is_deleted: false, role: { not: "admin" } },
            orderBy: { created_at: "asc" },
        });
    },
};

module.exports = userModel;
