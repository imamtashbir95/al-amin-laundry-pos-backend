const app = require("./app");
const port = process.env.API_PORT || 3000;
console.log("Current timezone:", new Date().toString());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
