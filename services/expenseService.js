const generateId = require("../utils/generateId");
const expenseModel = require("../models/expenseModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { formatExpense } = require("../helpers/expenseHelper");
const { formatDate } = require("../helpers/formatDate");

const createExpense = async (name, price, expenseDate) => {
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
    const expenses = await expenseModel.findMany();

    return expenses.map(formatExpense);
};

const getDateExpenses = async (date) => {
    const expenses = await expenseModel.findManyByDate(date);

    return expenses.map(formatExpense);
};

const getExpenseById = async (id) => {
    const existingExpense = await expenseModel.findById(id);

    if (!existingExpense) throw new Error("Expense not found");

    return formatExpense(existingExpense);
};

const updateExpense = async (id, name, price, expenseDate) => {
    const updatedAt = getCurrentDateAndTime();
    const formattedExpenseDate = formatDate(expenseDate);
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
