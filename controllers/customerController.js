const customerService = require("../services/customerService");
const { validateCustomer, handleValidationErrors, validateCustomerWithId } = require("../validators/customerValidator");

// Create a new customer
exports.createCustomer = [
    ...validateCustomer(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { name, phoneNumber, address } = req.body;
            const result = await customerService.createCustomer(name, phoneNumber, address);
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
    },
];

// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const result = await customerService.getAllCustomers();
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

// Get customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await customerService.getCustomerById(id);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(error.message.includes("Customer") ? 404 : 500).json({
            status: {
                code: error.message.includes("Customer") ? 404 : 500,
                description: error.message.includes("Customer") ? "Not Found" : "Internal Server Error",
            },
            error: error.message,
        });
    }
};

// Update existing customer
exports.updateCustomer = [
    ...validateCustomerWithId(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id, name, phoneNumber, address } = req.body;
            const result = await customerService.updateCustomer(id, name, phoneNumber, address);
            res.status(200).json({
                status: { code: 200, description: "Ok" },
                data: result,
            });
        } catch (error) {
            res.status(error.message.includes("Customer") ? 404 : 500).json({
                status: {
                    code: error.message.includes("Customer") ? 404 : 500,
                    description: error.message.includes("Customer") ? "Not Found" : "Error",
                },
                error: error.message,
            });
        }
    },
];

// Delete customer by ID
exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await customerService.deleteCustomer(id);
        res.status(204).end();
    } catch (error) {
        res.status(error.message.includes("Customer") ? 404 : 500).json({
            status: {
                code: error.message.includes("Customer") ? 404 : 500,
                description: error.message.includes("Customer") ? "Not Found" : "Error",
            },
            error: error.message,
        });
    }
};
