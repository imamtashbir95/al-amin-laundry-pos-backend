const formatExpense = (expense) => ({
    id: expense.id,
    name: expense.name,
    price: expense.price,
    expenseDate: expense.expense_date,
    createdAt: expense.created_at,
    updatedAt: expense.updated_at,
});

module.exports = {
    formatExpense,
};
