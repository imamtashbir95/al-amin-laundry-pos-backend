const generateId = require("../utils/generateId");
const customerModel = require("../models/customerModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { formatCustomer } = require("../helpers/customerHelper");

const createCustomer = async (name, phoneNumber, address) => {
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
    const customers = await customerModel.findMany();

    return customers.map(formatCustomer);
};

const getCustomerById = async (id) => {
    const existingCustomer = await customerModel.findById(id);

    if (!existingCustomer) throw new Error("Customer not found");

    return formatCustomer(existingCustomer);
};

const updateCustomer = async (id, name, phoneNumber, address) => {
    const updatedAt = getCurrentDateAndTime();
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
