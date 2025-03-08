const generateId = require("../utils/generateId");
const expenseModel = require("../models/expenseModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");

const formatDate = (date) => {
    return new Date(date);
};

// Create a new expense
exports.createExpense = async (req, res) => {
    const { name, price, expenseDate } = req.body;
    const id = generateId();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;
    const formattedExpenseDate = formatDate(expenseDate);

    try {
        const newExpense = await expenseModel.create({
            id,
            name,
            price,
            expenseDate: formattedExpenseDate,
            createdAt,
            updatedAt,
        });

        const formatedExpense = {
            id: newExpense.id,
            name: newExpense.name,
            price: newExpense.price,
            expenseDate: newExpense.expense_date,
            createdAt: newExpense.created_at,
            updatedAt: newExpense.updated_at,
        };

        res.status(201).json({
            status: { code: 201, description: "Ok" },
            data: formatedExpense,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get all expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await expenseModel.findMany();

        const formattedExpenses = expenses.map(
            ({ id, name, price, expense_date, created_at, updated_at }) => ({
                id,
                name,
                price,
                expenseDate: expense_date,
                createdAt: created_at,
                updatedAt: updated_at,
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedExpenses,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get expenses by date
exports.getDateExpenses = async (req, res) => {
    try {
        const { date } = req.query;
        const expenses = await expenseModel.findManyByDate(date);

        const formattedExpenses = expenses.map(
            ({ id, name, price, expense_date, created_at, updated_at }) => ({
                id,
                name,
                price,
                expenseDate: expense_date,
                createdAt: created_at,
                updatedAt: updated_at,
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedExpenses,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
    const { id } = req.params;

    try {
        const existingExpense = await expenseModel.findById(id);

        if (!existingExpense) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Expense not found",
            });
        }

        const formattedExpense = {
            id: existingExpense.id,
            name: existingExpense.name,
            price: existingExpense.price,
            expenseDate: existingExpense.expense_date,
            createdAt: existingExpense.created_at,
            updatedAt: existingExpense.updated_at,
        };

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedExpense,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Update existing expense
exports.updateExpense = async (req, res) => {
    const { id, name, price, expenseDate } = req.body;
    const updatedAt = getCurrentDateAndTime();
    const formattedExpenseDate = formatDate(expenseDate);

    try {
        const existingExpense = await expenseModel.findById(id);

        if (!existingExpense) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Expense not found",
            });
        }

        await expenseModel.update({
            id,
            name,
            price,
            expenseDate: formattedExpenseDate,
            updatedAt,
        });

        const updatedExpense = await expenseModel.findById(id);

        const formattedExpense = {
            id: updatedExpense.id,
            name: updatedExpense.name,
            price: updatedExpense.price,
            expenseDate: updatedExpense.expense_date,
            createdAt: updatedExpense.created_at,
            updatedAt: updatedExpense.updated_at,
        };

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedExpense,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Delete expense by ID
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const existingExpense = await expenseModel.findById(id);

        if (!existingExpense) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Expense not found",
            });
        }

        await expenseModel.delete(id);

        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};
