const request = require("supertest");
const app = require("../app");

const registerTestUser = async () => {
    return await request(app).post("/auth/register").send({
        name: "Eka Tiara",
        email: "tiaraeka66@gmail.com",
        username: "ekatiara",
        password: "dJvJ30%7gH6#%Oz",
        role: "admin",
    });
};

const loginTestUser = async () => {
    const response = await request(app).post("/auth/login").send({
        username: "ekatiara",
        password: "dJvJ30%7gH6#%Oz",
    });

    // console.log("Login response:", response.body); // Debugging

    return response.body.data.token;
};

const createTestProduct = async (token) => {
    return await request(app)
        .post("/products")
        .send({
            name: "Cuci 2 Hari",
            price: 6000,
            type: "kg",
        })
        .set("Authorization", `Bearer ${token}`);
};

const createTestCustomer = async (token) => {
    return await request(app)
        .post("/customers")
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
