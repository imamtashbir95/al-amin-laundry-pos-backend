const bcrypt = require("bcrypt");
const generateId = require("../utils/generateId");
const userModel = require("../models/userModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { formatUser } = require("../helpers/userHelper");
const { redisClient } = require("../config/redis");
const CACHE_TTL = 3600; // 1 hour

const registerUser = async (name, email, username, password, role) => {
    // Delete the cache if data chaned
    await redisClient.del("all_users");

    const id = generateId();
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    const existingUser = await userModel.findByUsernameOrEmail(username, email);

    if (existingUser) throw new Error("Username or email already exists");

    const newUser = await userModel.register({
        id,
        name,
        email,
        username,
        hashedPassword,
        role,
        createdAt,
        updatedAt,
    });

    return formatUser(newUser);
};

const getAllUsers = async () => {
    const cacheKey = "all_users";

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("📦 [Cache Hit] GET all users");
        return JSON.parse(cachedData);
    }
    console.log("❌ [Cache Miss] GET all users");

    // If not in the cache, fetch the data from the database
    const users = await userModel.findMany();
    const formattedUsers = users.map(formatUser);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedUsers));

    return formattedUsers;
};

const getUserById = async (id) => {
    const cacheKey = `user_${id}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET user ${id}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET user ${id}`);

    // If not in the cache, fetch the data from the database
    const existingUser = await userModel.findById(id);
    if (!existingUser) throw new Error("User not found");
    const formattedUser = formatUser(existingUser);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedUser));

    return formattedUser;
};

const updateUser = async (id, name, email, username, password, role) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedAt = getCurrentDateAndTime();

    // Clear related cache
    // Add cache invalidation for write operations
    await redisClient.del("all_users");
    await redisClient.del(`user_${id}`);

    const existingUser = await userModel.findById(id);
    if (!existingUser) throw new Error("User not found");

    await userModel.update({
        id,
        name,
        email,
        username,
        hashedPassword,
        role,
        updatedAt,
    });

    const updatedUser = await userModel.findById(id);

    return formatUser(updatedUser);
};

const deleteUser = async (id) => {
    // Delete the cache if data changed
    await redisClient.del("all_users");
    await redisClient.del(`user_${id}`);

    const existingUser = await userModel.findById(id);
    if (!existingUser) throw new Error("User not found");

    await userModel.delete(id);
};

const getAllUsersExceptAdmin = async () => {
    const cacheKey = "all_users_except_admin";

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("📦 [Cache Hit] GET all users except admin");
        return JSON.parse(cachedData);
    }
    console.log("❌ [Cache Miss] GET all users except admin");

    // If not in the cache, fetch the data from the database
    const users = await userModel.findManyExceptAdmin();
    const formattedUsers = users.map(formatUser);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedUsers));

    return formattedUsers;
};

module.exports = {
    registerUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsersExceptAdmin,
};
