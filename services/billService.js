const generateId = require("../utils/generateId");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { enrichBillDetails, enrichBill } = require("../helpers/billHelper");
const customerModel = require("../models/customerModel");
const userModel = require("../models/userModel");
const billModel = require("../models/billModel");
const prisma = require("../config/db");

// Create a new bill
const createBill = async (customerId, billDetails, userId) => {
    const id = generateId();
    const billDate = getCurrentDateAndTime();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    return await prisma.$transaction(async (_prisma) => {
        const [customer, user] = await Promise.all([
            customerModel.findById(customerId),
            userModel.findById(userId),
        ]);

        if (!customer || !user) {
            throw new Error("Customer or employee not found");
        }

        const newBill = await billModel.create({
            id,
            billDate,
            customerId,
            userId,
            createdAt,
            updatedAt,
        });

        const enrichedBillDetails = await enrichBillDetails(
            billDetails,
            id,
            updatedAt,
            "create"
        );

        return {
            id: newBill.id,
            billDate: newBill.bill_date,
            customer: {
                id: customer.id,
                name: customer.name,
                phoneNumber: customer.phone_number,
                address: customer.address,
                createdAt: customer.created_at,
                updatedAt: customer.updated_at,
            },
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            },
            billDetails: enrichedBillDetails,
            createdAt: newBill.created_at,
            updatedAt: newBill.updated_at,
        };
    });
};

// Get all bills
const getAllBills = async () => {
    const bills = await billModel.findMany();
    return Promise.all(bills.map(enrichBill));
};

// Get report in
const getReportInBills = async (date) => {
    const bills = await billModel.findReportIn(date);
    return Promise.all(bills.map(enrichBill));
};

// Get report out
const getReportOutBills = async (date) => {
    const bills = await billModel.findReportOut(date);
    return Promise.all(bills.map(enrichBill));
};

// Get report not paid off
const getReportNotPaidOffBills = async (date) => {
    const bills = await billModel.findReportNotPaidOff(date);
    return Promise.all(bills.map(enrichBill));
};

// Get report not taken yet
const getReportNotTakenYetBills = async (date) => {
    const bills = await billModel.findReportNotTakenYet(date);
    return Promise.all(bills.map(enrichBill));
};

// Get bill by ID
const getBillById = async (id) => {
    const bill = await billModel.findById(id);
    if (!bill) throw new Error("Bill not found");
    return enrichBill(bill);
};

// Update bill
const updateBill = async (id, customerId, billDetails, userId) => {
    const updatedAt = getCurrentDateAndTime();

    return await prisma.$transaction(async (_prisma) => {
        const [customer, user] = await Promise.all([
            customerModel.findById(customerId),
            userModel.findById(userId),
        ]);

        if (!customer || !user) {
            throw new Error("Customer or employee not found");
        }

        const existingBill = await billModel.findById(id);
        if (!existingBill) {
            throw new Error("Bill not found");
        }

        await billModel.update({
            id,
            customerId,
            userId,
            updatedAt,
        });

        const enrichedBillDetails = await enrichBillDetails(
            billDetails,
            id,
            updatedAt,
            "update"
        );

        return {
            id: existingBill.id,
            billDate: existingBill.bill_date,
            customer: {
                id: customer.id,
                name: customer.name,
                phoneNumber: customer.phone_number,
                address: customer.address,
                createdAt: customer.created_at,
                updatedAt: customer.updated_at,
            },
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            },
            billDetails: enrichedBillDetails,
            createdAt: existingBill.created_at,
            updatedAt: enrichedBillDetails[0].updatedAt,
        };
    });
};

// Delete bill
const deleteBill = async (id) => {
    return await prisma.$transaction(async (_prisma) => {
        const existingBill = await billModel.findById(id);
        if (!existingBill) {
            throw new Error("Bill not found");
        }

        await billModel.delete(id);
    });
};

module.exports = {
    createBill,
    getAllBills,
    getReportInBills,
    getReportOutBills,
    getReportNotPaidOffBills,
    getReportNotTakenYetBills,
    getBillById,
    updateBill,
    deleteBill,
};
