const request = require("supertest");
const app = require("../app");
const prisma = require("../config/db");
const { loginTestUser, registerTestUser } = require("./testUtils");

let token;

beforeAll(async () => {
    await prisma.billDetail.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
    await registerTestUser();
});

beforeEach(async () => {
    token = await loginTestUser();
    // console.log("Token:", token); // Debugging untuk melihat apakah token valid
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Product controller", () => {
    test("POST /products should create a new product", async () => {
        const response = await request(app)
            .post("/products")
            .send({
                name: "Cuci 2 Hari",
                price: 6000,
                type: "kg",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Cuci 2 Hari");
        expect(response.body.data.price).toBe(6000);
        expect(response.body.data.type).toBe("kg");
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
    });

    test("GET /products should get all products", async () => {
        const response = await request(app).get("/products").set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    test("GET /products/:id should get product by ID", async () => {
        const { id } = await prisma.product.findFirst();

        const response = await request(app).get(`/products/${id}`).set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });

    test("GET /products/:id should get product by ID but not found", async () => {
        const response = await request(app).get(`/products/9999`).set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBeDefined();
    });

    test("PUT /products should update existing product", async () => {
        const { id } = await prisma.product.findFirst();

        const response = await request(app)
            .put("/products")
            .send({
                id,
                name: "Cuci Express",
                price: 8000,
                type: "kg",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Cuci Express");
        expect(response.body.data.price).toBe(8000);
        expect(response.body.data.type).toBe("kg");
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
    });

    test("DELETE /products should delete product by ID", async () => {
        const { id } = await prisma.product.findFirst();

        const response = await request(app).delete(`/products/${id}`).set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(204);
    });

    test("DELETE /products/:id should delete product by ID but not found", async () => {
        const response = await request(app).delete(`/products/9999`).set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBeDefined();
    });
});
