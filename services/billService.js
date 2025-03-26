const generateId = require("../utils/generateId");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { enrichBillDetails, enrichBill } = require("../helpers/billHelper");
const customerModel = require("../models/customerModel");
const userModel = require("../models/userModel");
const billModel = require("../models/billModel");
const prisma = require("../config/db");
const { redisClient } = require("../config/redis");
const CACHE_TTL = 3600; // 1 hour

// Create a new bill
const createBill = async (customerId, billDetails, userId) => {
    // Delete the cache if data changed
    await redisClient.del("all_bills");

    const id = generateId();
    const billDate = getCurrentDateAndTime();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    return await prisma.$transaction(async (_prisma) => {
        const [customer, user] = await Promise.all([customerModel.findById(customerId), userModel.findById(userId)]);

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

        const enrichedBillDetails = await enrichBillDetails(billDetails, id, updatedAt, "create");

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
    const cacheKey = "all_bills";

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("📦 [Cache Hit] GET all bills");
        return JSON.parse(cachedData);
    }
    console.log("❌ [Cache Miss] GET all bills");

    // If not in the cache, fetch the data from the database
    const bills = await billModel.findMany();
    const result = await Promise.all(bills.map(enrichBill));

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
};

// Get report in
const getReportInBills = async (date) => {
    const cacheKey = `report_in_bills_${date}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET report in bills ${date}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET report in bills ${date}`);

    // If not in the cache, fetch the data from the database
    const bills = await billModel.findReportIn(date);
    const result = await Promise.all(bills.map(enrichBill));

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
};

// Get report out
const getReportOutBills = async (date) => {
    const cacheKey = `report_out_bills_${date}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET report out bills ${date}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET report out bill ${date}`);

    // If not in the cache, fetch the data from the database
    const bills = await billModel.findReportOut(date);
    const result = await Promise.all(bills.map(enrichBill));

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
};

// Get report not paid off
const getReportNotPaidOffBills = async (date) => {
    const cacheKey = `report_not_paid_off_bills_${date}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET report not paid off bills ${date}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET report not paid off bills ${date}`);

    // If not in the cache, fetch the data from the database
    const bills = await billModel.findReportNotPaidOff(date);
    const result = await Promise.all(bills.map(enrichBill));

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
};

// Get report not taken yet
const getReportNotTakenYetBills = async (date) => {
    const cacheKey = `report_not_taken_yet_bills_${date}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET report not taken yet bills ${date}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET report not taken yet bills ${date}`);

    // If not in the cache, fetch the data from the database
    const bills = await billModel.findReportNotTakenYet(date);
    const result = await Promise.all(bills.map(enrichBill));

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
};

// Get bill by ID
const getBillById = async (id) => {
    const cacheKey = `bill_${id}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET bill ${id}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET bill ${id}`);

    // If not in the cache, fetch the data from the database
    const bill = await billModel.findById(id);
    if (!bill) throw new Error("Bill not found");
    const result = enrichBill(bill);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
};

// Update bill
const updateBill = async (id, customerId, billDetails, userId) => {
    const updatedAt = getCurrentDateAndTime();

    // Clear related cache
    // Add cache invalidation for write operations
    await redisClient.del("bills");
    await redisClient.del(`bill${id}`);

    return await prisma.$transaction(async (_prisma) => {
        const [customer, user] = await Promise.all([customerModel.findById(customerId), userModel.findById(userId)]);

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

        const updatedBill = await billModel.findById(id);

        const enrichedBillDetails = await enrichBillDetails(billDetails, id, updatedAt, "update");

        return {
            id: updatedBill.id,
            billDate: updatedBill.bill_date,
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
            createdAt: updatedBill.created_at,
            updatedAt: updatedBill.updated_at,
        };
    });
};

// Delete bill
const deleteBill = async (id) => {
    // Delete the cache if data changed
    await redisClient.del("bills");
    await redisClient.del(`bill_${id}`);

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
