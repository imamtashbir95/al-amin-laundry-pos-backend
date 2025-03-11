const bcrypt = require("bcrypt");
const generateId = require("../utils/generateId");
const userModel = require("../models/userModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { formatUser } = require("../helpers/userHelper");

const registerUser = async (name, email, username, password, role) => {
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
    const users = await userModel.findMany();

    return users.map(formatUser);
};

const getUserById = async (id) => {
    const existingUser = await userModel.findById(id);

    if (!existingUser) throw new Error("User not found");

    return formatUser(existingUser);
};

const updateUser = async (id, name, email, username, password, role) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedAt = getCurrentDateAndTime();

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
    const existingUser = await userModel.findById(id);
    if (!existingUser) throw new Error("User not found");

    await userModel.delete(id);
};

const getAllUsersExceptAdmin = async () => {
    const users = await userModel.findManyExceptAdmin();

    return users.map(formatUser);
};

module.exports = {
    registerUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsersExceptAdmin,
};
