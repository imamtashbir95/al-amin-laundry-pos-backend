const app = require("../app");
const request = require("supertest");

const registerTestUser = async () => {
    return await request(app).post("/api/v1/auth/register").send({
        name: "Eka Tiara",
        email: "tiaraeka66@gmail.com",
        username: "ekatiara",
        gender: "male",
        language: "en",
        phoneNumber: "082142378894",
        password: "dJvJ30%7gH6#%Oz",
        confirmPassword: "dJvJ30%7gH6#%Oz",
        role: "admin",
    });
};

const loginTestUser = async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
        username: "ekatiara",
        password: "dJvJ30%7gH6#%Oz",
    });

    console.log("Login response:", response.body); // Debugging

    return response.body.data.token;
};

const createTestProduct = async (token) => {
    return await request(app)
        .post("/api/v1/products")
        .send({
            name: "Cuci 2 Hari",
            price: 6000,
            type: "kg",
        })
        .set("Authorization", `Bearer ${token}`);
};

const createTestCustomer = async (token) => {
    return await request(app)
        .post("/api/v1/customers")
        .send({
            name: "Andi Wijaya",
            phoneNumber: "081265270252",
            address: "Jl. Sudirman No. 10, Jakarta Pusat",
        })
        .set("Authorization", `Bearer ${token}`);
};

module.exports = {
    registerTestUser,
    loginTestUser,
    createTestProduct,
    createTestCustomer,
};
