const app = require("../app");
const prisma = require("../config/db");
const request = require("supertest");
const { redisClient } = require("../config/redis");
const { loginTestUser, registerTestUser } = require("./testUtils");

let token;

beforeAll(async () => {
    await redisClient.connect();
    await prisma.billDetail.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.user.deleteMany();
    await prisma.customer.deleteMany();
    await registerTestUser();
});

beforeEach(async () => {
    token = await loginTestUser();
    // console.log("Token:", token); // Debugging untuk melihat apakah token valid
});

afterAll(async () => {
    await redisClient.quit();
    await prisma.$disconnect();
});

describe("Customer controller", () => {
    test("POST /customers should create a new customer", async () => {
        const response = await request(app)
            .post("/api/v1/customers")
            .send({
                name: "Andi Wijaya",
                phoneNumber: "081265270252",
                address: "Jl. Sudirman No. 10, Jakarta Pusat",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Andi Wijaya");
        expect(response.body.data.phoneNumber).toBe("081265270252");
        expect(response.body.data.address).toBe("Jl. Sudirman No. 10, Jakarta Pusat");
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
    });

    test("GET /customers should get all customers", async () => {
        const response = await request(app).get("/api/v1/customers").set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    test("GET /customers/:id should get customer by ID", async () => {
        const { id } = await prisma.customer.findFirst();

        const response = await request(app).get(`/api/v1/customers/${id}`).set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });

    test("GET /customers/:id should get customer by ID but not found", async () => {
        const response = await request(app).get(`/api/v1/customers/9999`).set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBeDefined();
    });

    test("PUT /customers should update existing customer", async () => {
        const { id } = await prisma.customer.findFirst();

        const response = await request(app)
            .put("/api/v1/customers")
            .send({
                id,
                name: "Andi Wijaya 2",
                phoneNumber: "081265270252",
                address: "Jl. Sudirman No. 10, Jakarta Pusat",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Andi Wijaya 2");
        expect(response.body.data.phoneNumber).toBe("081265270252");
        expect(response.body.data.address).toBe("Jl. Sudirman No. 10, Jakarta Pusat");
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
    });

    test("DELETE /customers should delete customer by ID", async () => {
        const { id } = await prisma.customer.findFirst();

        const response = await request(app).delete(`/api/v1/customers/${id}`).set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(204);
    });

    test("DELETE /customers/:id should delete customer by ID but not found", async () => {
        const response = await request(app).delete(`/api/v1/customers/9999`).set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBeDefined();
    });
});
