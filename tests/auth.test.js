const request = require("supertest");
const app = require("../app");
const prisma = require("../config/db");

beforeAll(async () => {
    await prisma.billDetail.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Auth controller", () => {
    test("POST /register should create a new user", async () => {
        const response = await request(app).post("/auth/register").send({
            name: "Eka Tiara",
            email: "tiaraeka66@gmail.com",
            username: "ekatiara",
            password: "dJvJ30%7gH6#%Oz",
            role: "admin",
        });

        console.log("Register response:", response.body);

        expect(response.statusCode).toBe(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Eka Tiara");
        expect(response.body.data.email).toBe("tiaraeka66@gmail.com");
        expect(response.body.data.username).toBe("ekatiara");
        expect(response.body.data.password).toBeUndefined();
        expect(response.body.data.role).toBe("admin");
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();

        const user = await prisma.user.findUnique({
            where: { username: "ekatiara" },
        });

        expect(user).toBeTruthy();
    });

    test("POST /register should return 400 for bad request", async () => {
        const response = await request(app).post("/auth/register").send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("POST /register should return 409 for existing username or email", async () => {
        const response = await request(app).post("/auth/register").send({
            name: "Eka Tiara",
            email: "tiaraeka66@gmail.com",
            username: "ekatiara",
            password: "dJvJ30%7gH6#%Oz",
            role: "admin",
        });

        expect(response.statusCode).toBe(409);
        expect(response.body.error).toBeDefined();
    });

    test("POST /login should return 201 for valid credentials", async () => {
        const response = await request(app).post("/auth/login").send({
            username: "ekatiara",
            password: "dJvJ30%7gH6#%Oz",
        });

        console.log("Login response:", response.body);

        expect(response.statusCode).toBe(201);
        expect(response.body.data.token).toBeDefined();
    });

    test("POST /login should return 400 for bad request", async () => {
        const response = await request(app).post("/auth/login").send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("POST /login should return 401 for invalid credentials (password)", async () => {
        const response = await request(app).post("/auth/login").send({
            username: "ekatiara",
            password: "password",
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    test("POST /login should return 401 for invalid credentials (username)", async () => {
        const response = await request(app).post("/auth/login").send({
            username: "username",
            password: "dJvJ30%7gH6#%Oz",
        });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBeDefined();
    });
});
