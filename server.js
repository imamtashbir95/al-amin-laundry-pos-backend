const app = require("./app");
const { connectRedis } = require("./config/redis");
const port = process.env.API_PORT || 3000;
console.log("Current timezone:", new Date().toString());

(async () => {
    await connectRedis();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})();
