const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { formatCurrentUser } = require("../helpers/userHelper");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { redisClient } = require("../config/redis");

const CACHE_TTL = 60 * 60; // 1 hour

const getCurrentUser = async (id) => {
    const cacheKey = `user_settings_${id}`;

    // Check if the data is already in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log(`📦 [Cache Hit] GET user settings ${id}`);
        return JSON.parse(cachedData);
    }
    console.log(`❌ [Cache Miss] GET user settings ${id}`);

    // If not in the cache, fetch the data from the database
    const existingUser = await userModel.findById(id);
    if (!existingUser) throw new Error("User not found");
    const formattedCurrentUser = formatCurrentUser(existingUser);

    // Store the data in the cache
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(formattedCurrentUser));

    return formattedCurrentUser;
};

const updateCurrentUser = async (id, name, email, username, gender, language, phoneNumber) => {
    const updatedAt = getCurrentDateAndTime();

    // Clear related cache
    // Add cache invalidation for write operations
    await redisClient.del(`user_settings_${id}`);

    const existingUser = await userModel.findById(id);
    if (!existingUser) throw new Error("User not found");

    // Check if the found user is NOT the user being updated
    const existingUserByEmail = await userModel.findByUsernameOrEmail(username, email);
    if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new Error("Username or email already exists");
    }

    await userModel.updateCrrent({
        id,
        name,
        email,
        username,
        gender,
        language,
        phoneNumber,
        updatedAt,
    });

    const updatedCurrentUser = await userModel.findById(id);

    return formatCurrentUser(updatedCurrentUser);
};

const updateCurrentUserPassword = async (id, oldPassword, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const passwordUpdatedAt = getCurrentDateAndTime();
    const updatedAt = getCurrentDateAndTime();

    // Clear related cache
    // Add cache invalidation for write operations
    await redisClient.del(`user_settings_${id}`);

    const existingUser = await userModel.findById(id);
    if (!existingUser) throw new Error("User not found");

    const isPasswordValid = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isPasswordValid) throw new Error("Old password is wrong");

    await userModel.updatePassword({
        id,
        hashedPassword,
        passwordUpdatedAt,
        updatedAt,
    });

    const updatedCurrentUser = await userModel.findById(id);

    return formatCurrentUser(updatedCurrentUser);
};

module.exports = {
    getCurrentUser,
    updateCurrentUser,
    updateCurrentUserPassword,
};
