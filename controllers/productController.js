const generateId = require("../utils/generateId");
const productModel = require("../models/productModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");

// Create a new product
exports.createProduct = async (req, res) => {
    const { name, price, type } = req.body;
    const id = generateId();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    try {
        await productModel.create({
            id,
            name,
            price,
            type,
            createdAt,
            updatedAt,
        });
        res.status(201).json({
            status: { code: 201, description: "Ok" },
            data: { id, name, price, type, createdAt, updatedAt },
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await productModel.findMany();

        const formattedProducts = products.map(
            ({ id, name, price, type, created_at, updated_at }) => ({
                id,
                name,
                price,
                type,
                createdAt: created_at,
                updatedAt: updated_at,
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedProducts,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Produk tidak ditemukan",
            });
        }

        const formattedProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            type: product.type,
            createdAt: product.created_at,
            updatedAt: product.updated_at,
        };

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedProduct,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Update existing product
exports.updateProduct = async (req, res) => {
    const { id, name, price, type } = req.body;
    const updatedAt = getCurrentDateAndTime();

    try {
        const existingProduct = await productModel.findById(id);

        if (!existingProduct) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Produk tidak ditemukan",
            });
        }

        await productModel.update({
            id,
            name,
            price,
            type,
            updatedAt,
        });

        const updatedProduct = await productModel.findById(id);

        const formattedProduct = {
            id: updatedProduct.id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            type: updatedProduct.type,
            createdAt: updatedProduct.created_at,
            updatedAt: updatedProduct.updated_at,
        };

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: formattedProduct,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Delete product by ID
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Produk tidak ditemukan",
            });
        }
        await productModel.delete(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};
