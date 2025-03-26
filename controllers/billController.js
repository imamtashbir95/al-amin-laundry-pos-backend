const billService = require("../services/billService");
const { validateBill, handleValidationErrors, validateBillWithId } = require("../validators/billValidator");

// Create a new bill
exports.createBill = [
    ...validateBill(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { customerId, billDetails } = req.body;
            const userId = req.user.id;
            const result = await billService.createBill(customerId, billDetails, userId);
            res.status(201).json({
                status: { code: 201, description: "Ok" },
                data: result,
            });
        } catch (error) {
            res.status(500).json({
                status: { code: 500, description: "Internal Server Error" },
                error: error.message,
            });
        }
    },
];

// Get all bills
exports.getAllBills = async (req, res) => {
    try {
        const result = await billService.getAllBills();
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get report in
exports.getReportInBills = async (req, res) => {
    try {
        const { date } = req.query;
        const result = await billService.getReportInBills(date);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get report out
exports.getReportOutBills = async (req, res) => {
    try {
        const { date } = req.query;
        const result = await billService.getReportOutBills(date);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get report not paid off
exports.getReportNotPaidOffBills = async (req, res) => {
    try {
        const { date } = req.query;
        const result = await billService.getReportNotPaidOffBills(date);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get report not taken yet
exports.getReportNotTakenYetBills = async (req, res) => {
    try {
        const { date } = req.query;
        const result = await billService.getReportNotTakenYetBills(date);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await billService.getBillById(id);
        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: result,
        });
    } catch (error) {
        res.status(404).json({
            status: { code: 404, description: "Not Found" },
            error: error.message,
        });
    }
};

// Update bill
exports.updateBill = [
    ...validateBillWithId(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { id, customerId, billDetails } = req.body;
            const userId = req.user.id;
            const result = await billService.updateBill(id, customerId, billDetails, userId);
            res.status(200).json({
                status: { code: 200, description: "Ok" },
                data: result,
            });
        } catch (error) {
            res.status(500).json({
                status: { code: 500, description: "Internal Server Error" },
                error: error.message,
            });
        }
    },
];

// Delete bill
exports.deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        await billService.deleteBill(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};
