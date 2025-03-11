const generateId = require("../utils/generateId");
const productModel = require("../models/productModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { formatProduct } = require("../helpers/productHelper");

const createProduct = async (name, price, type) => {
    const id = generateId();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    const newProduct = await productModel.create({
        id,
        name,
        price,
        type,
        createdAt,
        updatedAt,
    });

    return formatProduct(newProduct);
};

const getAllProducts = async () => {
    const products = await productModel.findMany();

    return products.map(formatProduct);
};

const getProductById = async (id) => {
    const existingProduct = await productModel.findById(id);

    if (!existingProduct) throw new Error("Product not found");

    return formatProduct(existingProduct);
};

const updateProduct = async (id, name, price, type) => {
    const updatedAt = getCurrentDateAndTime();
    const existingProduct = await productModel.findById(id);

    if (!existingProduct) throw new Error("Product not found");

    await productModel.update({
        id,
        name,
        price,
        type,
        updatedAt,
    });

    const updatedProduct = await productModel.findById(id);

    return formatProduct(updatedProduct);
};

const deleteProduct = async (id) => {
    const existingProduct = await productModel.findById(id);
    if (!existingProduct) throw new Error("Product not found");

    await productModel.delete(id);
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
