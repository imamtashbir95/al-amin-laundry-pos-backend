const customerModel = require("../models/customerModel");
const generateId = require("../utils/generateId");
const { formatCustomer } = require("../helpers/customerHelper");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { redisClient } = require("../config/redis");

const CACHE_TTL = 60 * 60; // 1 hour

const createCustomer = async (name, phoneNumber, address) => {
    // Delete the cache if data changed
    await redisClient.del("all_customers");

    const id = generateId();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    const newCustomer = await customerModel.create({
        id,
        name,
        phoneNumber,
        address,
        createdAt,
        updatedAt,
    });

    return formatCustomer(newCustomer);
};

const getAllCustomers = async () => {
    const cacheKey = "all_customers";

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("📦 [Cache Hit] GET all customers");
        return JSON.parse(cachedData);
    }
    console.log("❌ [Cache Miss] GET all customers");

    // If not in the cache, fetch the data from the database
    const customers = await customerModel.findMany();
    const formattedCustomers = customers.map(formatCustomer);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedCustomers));

    return formattedCustomers;
};

const getCustomerById = async (id) => {
    const cacheKey = `customer_${id}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET customer ${id}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET customer ${id}`);

    // If not in the cache, fetch the data from the database
    const existingCustomer = await customerModel.findById(id);
    if (!existingCustomer) throw new Error("Customer not found");
    const formattedCustomer = formatCustomer(existingCustomer);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedCustomer));

    return formattedCustomer;
};

const updateCustomer = async (id, name, phoneNumber, address) => {
    const updatedAt = getCurrentDateAndTime();

    // Clear related cache
    // Add cache invalidation for write operations
    await redisClient.del("all_customers");
    await redisClient.del(`customer_${id}`);

    const existingCustomer = await customerModel.findById(id);
    if (!existingCustomer) throw new Error("Customer not found");

    await customerModel.update({
        id,
        name,
        phoneNumber,
        address,
        updatedAt,
    });

    const updatedCustomer = await customerModel.findById(id);

    return formatCustomer(updatedCustomer);
};

const deleteCustomer = async (id) => {
    // Delete the cache if data changed
    await redisClient.del("all_customers");
    await redisClient.del(`customer_${id}`);

    const existingCustomer = await customerModel.findById(id);
    if (!existingCustomer) throw new Error("Customer not found");

    await customerModel.delete(id);
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};
