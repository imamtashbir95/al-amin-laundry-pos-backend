const app = require("./app");
const port = parseInt(process.env.API_PORT, 10) || 3000;
const { connectRedis } = require("./config/redis");

console.log("Current timezone:", new Date().toString());

const startServer = async (port) => {
    try {
        await connectRedis();

        const server = app.listen(port, () => {
            console.log(`✅ Server is running on port ${port}`);
        });

        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.warn(`⚠️ Port ${port} is in use, trying port ${port + 1}...`);
                startServer(port + 1);
            } else {
                console.error("💥 Server failed to start:", err);
                process.exit(1);
            }
        });
    } catch (err) {
        console.error("❌ Failed to initialize app:", err);
        process.exit(1);
    }
};

startServer(port);