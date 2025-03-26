const generateId = require("../utils/generateId");
const productModel = require("../models/productModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { formatProduct } = require("../helpers/productHelper");
const { redisClient } = require("../config/redis");
const CACHE_TTL = 3600; // 1 hour

const createProduct = async (name, price, type) => {
    // Delete the cache if data changed
    await redisClient.del("all_products");

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
    const cacheKey = "all_products";

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("📦 [Cache Hit] GET all products");
        return JSON.parse(cachedData);
    }
    console.log("❌ [Cache Miss] GET all products");

    // If not in the cache, fetch the data from the database
    const products = await productModel.findMany();
    const formattedProducts = products.map(formatProduct);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedProducts))

    return formattedProducts;
};

const getProductById = async (id) => {
    const cacheKey = `product_${id}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET product ${id}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET product ${id}`);

    // If not in the cache, fetch the data from the database
    const existingProduct = await productModel.findById(id);
    if (!existingProduct) throw new Error("Product not found");
    const formattedProduct = formatProduct(existingProduct);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedProduct));

    return formattedProduct;
};

const updateProduct = async (id, name, price, type) => {
    const updatedAt = getCurrentDateAndTime();

    // Clear related cache
    // Add cache invalidation for write operations
    await redisClient.del("all_products");
    await redisClient.del(`product_${id}`);

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
    // Delete the cache if data chaned
    await redisClient.del("all_products");
    await redisClient.del(`product_${id}`);

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
