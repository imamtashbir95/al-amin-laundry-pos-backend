const request = require("supertest");
const app = require("../app");
const prisma = require("../config/db");
const {
    loginTestUser,
    registerTestUser,
    createTestProduct,
    createTestCustomer,
} = require("./testUtils");

let token;

beforeAll(async () => {
    await prisma.billDetail.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();

    await registerTestUser();
    token = await loginTestUser();

    await createTestProduct(token);
    await createTestCustomer(token);
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Bill controller", () => {
    test("POST /bills should create a new bill", async () => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        const newDate = date.toISOString();

        const { id: customerId } = await prisma.customer.findFirst();
        const { id: productId } = await prisma.product.findFirst();

        const response = await request(app)
            .post("/bills")
            .send({
                customerId,
                billDetails: [
                    {
                        invoiceId: "0001",
                        product: {
                            id: productId,
                        },
                        qty: 3,
                        paymentStatus: "sudah-dibayar",
                        status: "baru",
                        finishDate: newDate,
                    },
                ],
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.billDate).toBeDefined();
        expect(response.body.data.customer).toBeDefined();
        expect(response.body.data.customer.id).toBe(customerId);
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.billDetails[0].id).toBeDefined();
        expect(response.body.data.billDetails[0].billId).toBeDefined();
        expect(response.body.data.billDetails[0].invoiceId).toBe("0001");
        expect(response.body.data.billDetails[0].product).toBeDefined();
        expect(response.body.data.billDetails[0].product.id).toBe(productId);
        expect(response.body.data.billDetails[0].qty).toBe(3);
        expect(response.body.data.billDetails[0].price).toBeDefined();
        expect(response.body.data.billDetails[0].paymentStatus).toBe(
            "sudah-dibayar",
        );
        expect(response.body.data.billDetails[0].status).toBe("baru");
        expect(response.body.data.billDetails[0].finishDate).toBeDefined();
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
        console.log("POST /bills", response.body.data);
    });

    test("GET /bills should get all bills", async () => {
        const response = await request(app)
            .get("/bills")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toBeInstanceOf(Array);
    });

    test("GET /bills/report/in should get report in", async () => {
        const { created_at: date } = await prisma.bill.findFirst();

        const response = await request(app)
            .get(`/bills/report/in?date=${date}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toBeInstanceOf(Array);
        console.log(`?date=${date}`);
        console.log("GET /bills/report/in", response.body.data);
    });

    test("GET /bills/report/out should get report out", async () => {
        const { id: billId } = await prisma.bill.findFirst();
        const { id: billDetailsId } = await prisma.billDetail.findFirst();
        const { id: customerId } = await prisma.customer.findFirst();
        const { id: productId } = await prisma.product.findFirst();
        const { finish_date: date } = await prisma.billDetail.findFirst();

        await request(app)
            .put("/bills")
            .send({
                id: billId,
                customerId,
                billDetails: [
                    {
                        id: billDetailsId,
                        invoiceId: "0001",
                        product: {
                            id: productId,
                        },
                        qty: 3,
                        paymentStatus: "sudah-dibayar",
                        status: "selesai",
                        finishDate: date,
                    },
                ],
            })
            .set("Authorization", `Bearer ${token}`);

        const response = await request(app)
            .get(`/bills/report/out?date=${date}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toBeInstanceOf(Array);
        console.log(`?date=${date}`);
        console.log("GET /bills/report/out", response.body.data);
    });

    test("GET /bills/report/not-paid-off should get report not paid off", async () => {
        const { id: billId } = await prisma.bill.findFirst();
        const { id: billDetailsId } = await prisma.billDetail.findFirst();
        const { id: customerId } = await prisma.customer.findFirst();
        const { id: productId } = await prisma.product.findFirst();
        const { finish_date: date } = await prisma.billDetail.findFirst();

        await request(app)
            .put("/bills")
            .send({
                id: billId,
                customerId,
                billDetails: [
                    {
                        id: billDetailsId,
                        invoiceId: "0001",
                        product: {
                            id: productId,
                        },
                        qty: 3,
                        paymentStatus: "belum-dibayar",
                        status: "selesai",
                        finishDate: date,
                    },
                ],
            })
            .set("Authorization", `Bearer ${token}`);

        const response = await request(app)
            .get(`/bills/report/not-paid-off?date=${date}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toBeInstanceOf(Array);
        console.log(`?date=${date}`);
        console.log("GET /bills/report/not-paid-off", response.body.data);
    });

    test("GET /bills/report/not-taken-yet should get report not taken yet", async () => {
        const { id: billId } = await prisma.bill.findFirst();
        const { id: billDetailsId } = await prisma.billDetail.findFirst();
        const { id: customerId } = await prisma.customer.findFirst();
        const { id: productId } = await prisma.product.findFirst();
        const { finish_date: date } = await prisma.billDetail.findFirst();

        await request(app)
            .put("/bills")
            .send({
                id: billId,
                customerId,
                billDetails: [
                    {
                        id: billDetailsId,
                        invoiceId: "0001",
                        product: {
                            id: productId,
                        },
                        qty: 3,
                        paymentStatus: "sudah-dibayar",
                        status: "selesai",
                        finishDate: date,
                    },
                ],
            })
            .set("Authorization", `Bearer ${token}`);

        const response = await request(app)
            .get(`/bills/report/not-taken-yet?date=${date}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toBeInstanceOf(Array);
        console.log(`?date=${date}`);
        console.log("GET /bills/report/not-taken-yet", response.body.data);
    });

    test("GET /bills/:id should get bill by ID", async () => {
        const { id } = await prisma.bill.findFirst();

        const response = await request(app)
            .get(`/bills/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBe(id);
    });

    test("PUT /bills should update bill", async () => {
        const { id: billId } = await prisma.bill.findFirst();
        const { id: billDetailsId } = await prisma.billDetail.findFirst();
        const { id: customerId } = await prisma.customer.findFirst();
        const { id: productId } = await prisma.product.findFirst();
        const { finish_date: date } = await prisma.billDetail.findFirst();

        const response = await request(app)
            .put("/bills")
            .send({
                id: billId,
                customerId,
                billDetails: [
                    {
                        id: billDetailsId,
                        invoiceId: "0001",
                        product: {
                            id: productId,
                        },
                        qty: 3,
                        paymentStatus: "sudah-dibayar",
                        status: "proses",
                        finishDate: date,
                    },
                ],
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.billDate).toBeDefined();
        expect(response.body.data.customer).toBeDefined();
        expect(response.body.data.customer.id).toBe(customerId);
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.billDetails[0].id).toBeDefined();
        expect(response.body.data.billDetails[0].billId).toBeDefined();
        expect(response.body.data.billDetails[0].invoiceId).toBe("0001");
        expect(response.body.data.billDetails[0].product).toBeDefined();
        expect(response.body.data.billDetails[0].product.id).toBe(productId);
        expect(response.body.data.billDetails[0].qty).toBe(3);
        expect(response.body.data.billDetails[0].price).toBeDefined();
        expect(response.body.data.billDetails[0].paymentStatus).toBe(
            "sudah-dibayar",
        );
        expect(response.body.data.billDetails[0].status).toBe("proses");
        expect(response.body.data.billDetails[0].finishDate).toBeDefined();
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
        console.log("PUT /bills", response.body.data);
    });

    test("DELETE /bills/:id should delete bill", async () => {
        const { id } = await prisma.bill.findFirst();

        const response = await request(app)
            .delete(`/bills/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(204);
    });
});
