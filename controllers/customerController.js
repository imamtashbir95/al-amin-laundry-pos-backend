const generateId = require("../utils/generateId");
const customerModel = require("../models/customerModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");

// Create a new customer
exports.createCustomer = async (req, res) => {
    const { name, phoneNumber, address } = req.body;
    const id = generateId();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    try {
        await customerModel.create({
            id,
            name,
            phoneNumber,
            address,
            createdAt,
            updatedAt,
        });
        res.status(201).json({
            status: { code: 201, description: "Ok" },
            data: { id, name, phoneNumber, address, createdAt, updatedAt },
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await customerModel.findMany();
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: customers,
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
    const { id } = req.params;

    try {
        const customer = await customerModel.findById(id);
        if (!customer) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pelanggan tidak ditemukan",
            });
        }

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: customer,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Update existing customer
exports.updateCustomer = async (req, res) => {
    const { id, name, phoneNumber, address } = req.body;
    const updatedAt = getCurrentDateAndTime();

    try {
        const existingCustomer = await customerModel.findById(id);

        if (!existingCustomer) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pelanggan tidak ditemukan",
            });
        }

        await customerModel.update({
            id,
            name,
            phoneNumber,
            address,
            updatedAt,
        });
        const updatedCustomer = await customerModel.findById(id);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: updatedCustomer,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Delete customer by ID
exports.deleteCustomer = async (req, res) => {
    const { id } = req.params;

    try {
        const customer = await customerModel.findById(id);
        if (!customer) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pelanggan tidak ditemukan",
            });
        }
        await customerModel.delete(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};
