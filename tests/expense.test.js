const request = require("supertest");
const app = require("../app");
const prisma = require("../config/db");
const { loginTestUser, registerTestUser } = require("./testUtils");

let token;

beforeAll(async () => {
    await prisma.billDetail.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.user.deleteMany();
    await prisma.expense.deleteMany();
    await registerTestUser();
});

beforeEach(async () => {
    token = await loginTestUser();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Expense controller", () => {
    test("POST /expenses should create a new expense", async () => {
        const newDate = new Date().toISOString();

        const response = await request(app)
            .post("/expenses")
            .send({
                name: "Gas 3 kg",
                price: 28000,
                expenseDate: newDate,
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Gas 3 kg");
        expect(response.body.data.price).toBe(28000);
        expect(response.body.data.expenseDate).toBeDefined();
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
    });

    test("GET /expenses should get all expenses", async () => {
        const response = await request(app)
            .get("/customers")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    test("GET /expenses should get expenses by date", async () => {
        const { created_at: date } = await prisma.expense.findFirst();

        const response = await request(app)
            .get(`/expenses/date?date=${date}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    test("GET /expenses/:id should get expense by ID", async () => {
        const { id } = await prisma.expense.findFirst();

        const response = await request(app)
            .get(`/expenses/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });

    test("GET /expenses/:id should get customer by ID but not found", async () => {
        const response = await request(app)
            .get(`/expenses/9999`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBeDefined();
    });

    test("PUT /expenses should update existing expense", async () => {
        const { id } = await prisma.expense.findFirst();
        const { expense_date: date } = await prisma.expense.findFirst();

        const response = await request(app)
            .put("/expenses")
            .send({
                id,
                name: "Gas 3 kg",
                price: 28000,
                expenseDate: date,
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Gas 3 kg");
        expect(response.body.data.price).toBe(28000);
        expect(response.body.data.expenseDate).toBeDefined();
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
    });

    test("DELETE /expenses should delete expense by ID", async () => {
        const { id } = await prisma.expense.findFirst();

        const response = await request(app)
            .delete(`/expenses/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(204);
    });

    test("DELETE /expenses/:id should delete expense by ID but not found", async () => {
        const response = await request(app)
            .delete(`/expenses/9999`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBeDefined();
    });
});
