const { createClient } = require("redis");

const redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

console.log("Redis env:", {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (err) => console.log("Redis Client Error:", err));

const connectRedis = async () => {
    if (redisClient && redisClient.isOpen) {
        console.log("Redis already connected.");
        return redisClient;
    }
    
    try {
        await redisClient.connect();
        console.log("Redis connected successfully.");
    } catch (err) {
        console.error("Redis connection failed:", err);
    }

    return redisClient;
};

module.exports = { redisClient, connectRedis };
