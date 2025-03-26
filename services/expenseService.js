const generateId = require("../utils/generateId");
const expenseModel = require("../models/expenseModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { formatExpense } = require("../helpers/expenseHelper");
const { formatDate } = require("../helpers/formatDate");
const { redisClient } = require("../config/redis");
const CACHE_TTL = 3600; // 1 hour

const createExpense = async (name, price, expenseDate) => {
    // Delete the cache if data changed
    await redisClient.del("all_expenses");

    const id = generateId();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;
    const formattedExpenseDate = formatDate(expenseDate);

    const newExpense = await expenseModel.create({
        id,
        name,
        price,
        expenseDate: formattedExpenseDate,
        createdAt,
        updatedAt,
    });

    return formatExpense(newExpense);
};

const getAllExpenses = async () => {
    const cacheKey = "all_expenses";

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("📦 [Cache Hit] GET all expenses");
        return JSON.parse(cachedData);
    }
    console.log("❌ [Cache Miss] GET all expenses");

    // If not in the cache, fetch the data from the database
    const expenses = await expenseModel.findMany();
    const formattedExpenses = expenses.map(formatExpense);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedExpenses));

    return formattedExpenses;
};

const getDateExpenses = async (date) => {
    const cacheKey = `date_expenses_${date}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET date expenses ${date}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET date expenses ${date}`);

    // If not in the cache, fetch the data from the database
    const expenses = await expenseModel.findManyByDate(date);
    const formattedExpenses = expenses.map(formatExpense);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedExpenses));

    return formattedExpenses;
};

const getExpenseById = async (id) => {
    const cacheKey = `expense_${id}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET expense ${id}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET expense ${id}`);

    // If not in the cache, fetch the data from the database
    const existingExpense = await expenseModel.findById(id);
    if (!existingExpense) throw new Error("Expense not found");
    const formattedExpense = formatExpense(existingExpense);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedExpense));

    return formattedExpense;
};

const updateExpense = async (id, name, price, expenseDate) => {
    const updatedAt = getCurrentDateAndTime();
    const formattedExpenseDate = formatDate(expenseDate);

    // Clear related cache
    // Add cache invalidation for write operations
    await redisClient.del("all_expenses");
    await redisClient.del(`expense_${id}`);

    const existingExpense = await expenseModel.findById(id);
    if (!existingExpense) throw new Error("Expense not found");

    await expenseModel.update({
        id,
        name,
        price,
        expenseDate: formattedExpenseDate,
        updatedAt,
    });

    const updatedExpense = await expenseModel.findById(id);

    return formatExpense(updatedExpense);
};

const deleteExpense = async (id) => {
    // Delete the cache if data changed
    await redisClient.del("all_expenses");
    await redisClient.del(`expense_${id}`);

    const existingExpense = await expenseModel.findById(id);
    if (!existingExpense) throw new Error("Expense not found");

    await expenseModel.delete(id);
};

module.exports = {
    createExpense,
    getAllExpenses,
    getDateExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
};
