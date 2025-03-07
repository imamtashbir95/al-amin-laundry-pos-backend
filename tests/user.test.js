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

describe("User controller", () => {
    test("POST /users should create a new user", async () => {
        const response = await request(app)
            .post("/users")
            .send({
                name: "Nisrina Sara",
                email: "saranisrina123@gmail.com",
                username: "nisrinasara",
                password: "dJvJ30%7gH6#%Oz",
                role: "employee",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Nisrina Sara");
        expect(response.body.data.email).toBe("saranisrina123@gmail.com");
        expect(response.body.data.username).toBe("nisrinasara");
        expect(response.body.data.password).toBeUndefined();
        expect(response.body.data.role).toBe("employee");
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();

        const user = await prisma.user.findUnique({
            where: { username: "ekatiara" },
        });

        expect(user).toBeTruthy();
    });

    test("POST /users should return 409 for existing username or email", async () => {
        const response = await request(app)
            .post("/users")
            .send({
                name: "Nisrina Sara",
                email: "saranisrina123@gmail.com",
                username: "nisrinasara",
                password: "dJvJ30%7gH6#%Oz",
                role: "employee",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(409);
        expect(response.body.error).toBeDefined();
    });

    test("GET /users should get all users", async () => {
        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
    });

    test("GET /users/:id should get user by ID", async () => {
        const { id } = await prisma.user.findFirst();

        const response = await request(app)
            .get(`/users/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });

    test("GET /users/:id should get user by ID but not found", async () => {
        const response = await request(app)
            .get(`/users/9999`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBeDefined();
    });

    test("PUT /users should update existing user", async () => {
        const username = "nisrinasara";
        const email = "saranisrina123@gmail.com";

        const { id } = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        const response = await request(app)
            .put("/users")
            .send({
                id,
                name: "Nisrina Sara",
                email: "saranisrina123@gmail.com",
                username: "nisrinasara2",
                password: "dJvJ30%7gH6#%Oz",
                role: "employee",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Nisrina Sara");
        expect(response.body.data.email).toBe("saranisrina123@gmail.com");
        expect(response.body.data.username).toBe("nisrinasara2");
        expect(response.body.data.password).toBeUndefined();
        expect(response.body.data.role).toBe("employee");
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
    });

    test("DELETE /users should delete user by ID", async () => {
        const username = "nisrinasara";
        const email = "saranisrina123@gmail.com";

        const { id } = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        const response = await request(app)
            .delete(`/users/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(204);
    });

    test("DELETE /users/:id should delete user by ID but not found", async () => {
        const response = await request(app)
            .delete(`/users/9999`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBeDefined();
    });
});
