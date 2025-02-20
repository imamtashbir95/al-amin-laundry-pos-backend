const generateId = require("../utils/generateId");
const expenseModel = require("../models/expenseModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { format } = require("date-fns-tz");
const timeZone = "UTC";

// Create a new expense
exports.createExpense = async (req, res) => {
    const { name, price, expenseDate } = req.body;
    const id = generateId();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = getCurrentDateAndTime();
    const formattedExpenseDate = format(expenseDate, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone: timeZone,
    }).replace("Z", "");

    try {
        await expenseModel.create({
            id,
            name,
            price,
            expenseDate: formattedExpenseDate,
            createdAt,
            updatedAt,
        });
        res.status(201).json({
            status: { code: 201, description: "Ok" },
            data: { id, name, price, expenseDate, createdAt, updatedAt },
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
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: expenses,
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
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: expenses,
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
        const expense = await expenseModel.findById(id);
        if (!expense) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pengeluaran tidak ditemukan",
            });
        }

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: expense,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Update expense by ID
exports.updateExpense = async (req, res) => {
    const { id, name, price, expenseDate } = req.body;
    const updatedAt = getCurrentDateAndTime();
    const formattedExpenseDate = format(expenseDate, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone: timeZone,
    }).replace("Z", "");

    try {
        const existingExpense = await expenseModel.findById(id);

        if (!existingExpense) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pengeluaran tidak ditemukan",
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
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: updatedExpense,
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
        const expense = await expenseModel.findById(id);
        if (!expense) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pengeluaran tidak ditemukan",
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
