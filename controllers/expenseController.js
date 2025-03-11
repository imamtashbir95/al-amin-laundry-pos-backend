const expenseService = require("../services/expenseService");

// Create a new expense
exports.createExpense = async (req, res) => {
    try {
        const { name, price, expenseDate } = req.body;
        const result = await expenseService.createExpense(
            name,
            price,
            expenseDate,
        );
        res.status(201).json({
            status: { code: 201, description: "Ok" },
            data: result,
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
        const result = await expenseService.getAllExpenses();
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
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
        const result = await expenseService.getDateExpenses(date);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
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
    try {
        const { id } = req.params;
        const result = await expenseService.getExpenseById(id);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(error.message.includes("Expense") ? 404 : 500).json({
            status: {
                code: error.message.includes("Expense") ? 404 : 500,
                description: error.message.includes("Expense")
                    ? "Not Found"
                    : "Error",
            },
            error: error.message,
        });
    }
};

// Update existing expense
exports.updateExpense = async (req, res) => {
    try {
        const { id, name, price, expenseDate } = req.body;
        const result = await expenseService.updateExpense(
            id,
            name,
            price,
            expenseDate,
        );
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(error.message.includes("Expense") ? 404 : 500).json({
            status: {
                code: error.message.includes("Expense") ? 404 : 500,
                description: error.message.includes("Expense")
                    ? "Not Found"
                    : "Error",
            },
            error: error.message,
        });
    }
};

// Delete expense by ID
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await expenseService.deleteExpense(id);
        res.status(204).end();
    } catch (error) {
        res.status(error.message.includes("Expense") ? 404 : 500).json({
            status: {
                code: error.message.includes("Expense") ? 404 : 500,
                description: error.message.includes("Expense")
                    ? "Not Found"
                    : "Error",
            },
            error: error.message,
        });
    }
};
