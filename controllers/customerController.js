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
        const newCustomer = await customerModel.create({
            id,
            name,
            phoneNumber,
            address,
            createdAt,
            updatedAt,
        });

        const formattedCustomer = {
            id: newCustomer.id,
            name: newCustomer.name,
            phoneNumber: newCustomer.phone_number,
            address: newCustomer.address,
            createdAt: newCustomer.created_at,
            updatedAt: newCustomer.updated_at,
        };

        res.status(201).json({
            status: { code: 201, description: "Ok" },
            data: formattedCustomer,
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

        const formattedCustomers = customers.map(
            ({ id, name, phone_number, address, created_at, updated_at }) => ({
                id,
                name,
                phoneNumber: phone_number,
                address,
                createdAt: created_at,
                updatedAt: updated_at,
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedCustomers,
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
        const existingCustomer = await customerModel.findById(id);

        if (!existingCustomer) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pelanggan tidak ditemukan",
            });
        }

        const formattedCustomer = {
            id: existingCustomer.id,
            name: existingCustomer.name,
            phoneNumber: existingCustomer.phone_number,
            address: existingCustomer.address,
            createdAt: existingCustomer.created_at,
            updatedAt: existingCustomer.updated_at,
        };

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedCustomer,
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

        const formattedCustomer = {
            id: updatedCustomer.id,
            name: updatedCustomer.name,
            phoneNumber: updatedCustomer.phone_number, // Konversi snake_case ke camelCase
            address: updatedCustomer.address,
            createdAt: updatedCustomer.created_at,
            updatedAt: updatedCustomer.updated_at,
        };

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedCustomer,
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
        const existingCustomer = await customerModel.findById(id);

        if (!existingCustomer) {
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
