const errorHandler = (err, req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        status: { code: 500, description: "Internal Server Error" },
        error: "Something went wrong",
    });
};

module.exports = errorHandler;
