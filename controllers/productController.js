const productService = require("../services/productService");
const { handleValidationErrors, validateProduct, validateProductWithId } = require("../validators/productValidator");

// Create a new product
exports.createProduct = [
    ...validateProduct(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { name, price, type } = req.body;
            const result = await productService.createProduct(name, price, type);
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

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const result = await productService.getAllProducts();
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

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await productService.getProductById(id);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(error.message.includes("Product") ? 404 : 500).json({
            status: {
                code: error.message.includes("Product") ? 404 : 500,
                description: error.message.includes("Product") ? "Not Found" : "Internal Server Error",
            },
            error: error.message,
        });
    }
};

// Update existing product
exports.updateProduct = [
    ...validateProductWithId(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id, name, price, type } = req.body;
            const result = await productService.updateProduct(id, name, price, type);
            res.status(200).json({
                status: { code: 200, description: "Ok" },
                data: result,
            });
        } catch (error) {
            res.status(error.message.includes("Product") ? 404 : 500).json({
                status: {
                    code: error.message.includes("Product") ? 404 : 500,
                    description: error.message.includes("Product") ? "Not Found" : "Internal Server Error",
                },
                error: error.message,
            });
        }
    },
];

// Delete product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await productService.deleteProduct(id);
        res.status(204).end();
    } catch (error) {
        res.status(error.message.includes("Product") ? 404 : 500).json({
            status: {
                code: error.message.includes("Product") ? 404 : 500,
                description: error.message.includes("Product") ? "Not Found" : "Internal Server Error",
            },
            error: error.message,
        });
    }
};
