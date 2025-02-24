const pool = require("../config/db");
const generateId = require("../utils/generateId");
const customerModel = require("../models/customerModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const billModel = require("../models/billModel");
const billDetailsModel = require("../models/billDetailsModel");
const { getCurrentDateAndTime } = require("../utils/getCurrent");
const { format } = require("date-fns-tz");
const timeZone = "UTC";

// Create a new bill
exports.createBill = async (req, res) => {
    const { customerId, billDetails } = req.body;
    const userId = req.user.id; // Taken from JWT token
    const id = generateId();
    const billDate = getCurrentDateAndTime();
    const createdAt = getCurrentDateAndTime();
    const updatedAt = createdAt;

    try {
        await pool.query("START TRANSACTION");

        const [customer, user] = await Promise.all([
            customerModel.findById(customerId),
            userModel.findById(userId),
        ]);

        if (!customer || !user) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pelanggan atau karyawan tidak ditemukan",
            });
        }

        const newBill = await billModel.create({
            id,
            billDate,
            customerId,
            userId,
            createdAt,
            updatedAt,
        });

        const enrichedBillDetails = await Promise.all(
            billDetails.map(async (detail) => {
                const detailId = generateId();
                const product = await productModel.findById(detail.product.id);
                if (!product) {
                    throw new Error("Produk tidak ditemukan");
                }
                const price = product.price * detail.qty;
                const finishDate = format(
                    new Date(detail.finishDate),
                    "yyyy-MM-dd HH:mm:ssXXX",
                    {
                        timeZone,
                    }
                ).replace("Z", "");

                const newBillDetails = await billDetailsModel.create({
                    id: detailId,
                    billId: id,
                    invoiceId: detail.invoiceId,
                    productId: detail.product.id,
                    qty: detail.qty,
                    price,
                    paymentStatus: detail.paymentStatus,
                    status: detail.status,
                    finishDate,
                    createdAt,
                    updatedAt,
                });

                return {
                    id: newBillDetails.id,
                    billId: newBillDetails.billId,
                    invoiceId: newBillDetails.invoiceId,
                    product: {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        type: product.type,
                        createdAt: product.createdAt,
                        updatedAt: product.updatedAt,
                    },
                    qty: newBillDetails.qty,
                    price,
                    paymentStatus: newBillDetails.paymentStatus,
                    status: newBillDetails.status,
                    finishDate: newBillDetails.finish_date,
                    createdAt: newBillDetails.created_at,
                    updatedAt: newBillDetails.updated_at,
                };
            })
        );

        await pool.query("COMMIT");

        res.status(201).json({
            status: { code: 201, description: "Ok" },
            data: {
                id: newBill.id,
                billDate: newBill.bill_date,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phoneNumber: customer.phone_number,
                    address: customer.address,
                    createdAt: customer.created_at,
                    updatedAt: customer.updated_at,
                },
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                },
                billDetails: enrichedBillDetails,
                createdAt: newBill.created_at,
                updatedAt: newBill.updated_at,
            },
        });
    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

// Get all bills
exports.getAllBills = async (req, res) => {
    try {
        const bills = await billModel.findMany();

        const enrichedBills = await Promise.all(
            bills.map(async (bill) => {
                const customer = await customerModel.findByIdWithDeleted(
                    bill.customer_id
                );
                const user = await userModel.findByIdWithDeleted(bill.user_id);

                const details = await billDetailsModel.find({
                    billId: bill.id,
                });

                const formattedDetails = details.map((detail) => ({
                    id: detail.detail_id,
                    billId: bill.id,
                    invoiceId: detail.invoice_id,
                    product: {
                        id: detail.product_id,
                        name: detail.product_name,
                        price: detail.unit_price,
                        type: detail.type,
                        createdAt: detail.created_at,
                        updatedAt: detail.updated_at,
                    },
                    qty: detail.qty,
                    price: detail.price,
                    paymentStatus: detail.payment_status,
                    status: detail.status,
                    finishDate: detail.finish_date,
                    createdAt: detail.created_at,
                    updatedAt: detail.updated_at,
                }));

                return {
                    id: bill.id,
                    billDate: bill.bill_date,
                    customer: {
                        id: customer.id,
                        name: customer.name,
                        phoneNumber: customer.phone_number,
                        address: customer.address,
                        createdAt: customer.created_at,
                        updatedAt: customer.updated_at,
                    },
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                    },
                    billDetails: formattedDetails,
                    createdAt: bill.created_at,
                    updatedAt: bill.updated_at,
                };
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: enrichedBills,
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
        const bills = await billModel.findReportIn(date);

        const enrichedBills = await Promise.all(
            bills.map(async (bill) => {
                const customer = await customerModel.findByIdWithDeleted(
                    bill.customer_id
                );
                const user = await userModel.findByIdWithDeleted(bill.user_id);

                const details = await billDetailsModel.find({
                    billId: bill.id,
                });

                const formattedDetails = details.map((detail) => ({
                    id: detail.detail_id,
                    billId: bill.id,
                    invoiceId: detail.invoice_id,
                    product: {
                        id: detail.product_id,
                        name: detail.product_name,
                        price: detail.unit_price,
                        type: detail.type,
                        createdAt: detail.created_at,
                        updatedAt: detail.updated_at,
                    },
                    qty: detail.qty,
                    price: detail.price,
                    paymentStatus: detail.payment_status,
                    status: detail.status,
                    finishDate: detail.finish_date,
                    createdAt: detail.created_at,
                    updatedAt: detail.updated_at,
                }));

                return {
                    id: bill.id,
                    billDate: bill.bill_date,
                    customer: {
                        id: customer.id,
                        name: customer.name,
                        phoneNumber: customer.phone_number,
                        address: customer.address,
                        createdAt: customer.created_at,
                        updatedAt: customer.updated_at,
                    },
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                    },
                    billDetails: formattedDetails,
                    createdAt: bill.created_at,
                    updatedAt: bill.updated_at,
                };
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: enrichedBills,
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
        const bills = await billModel.findReportOut(date);

        const enrichedBills = await Promise.all(
            bills.map(async (bill) => {
                const customer = await customerModel.findByIdWithDeleted(
                    bill.customer_id
                );
                const user = await userModel.findByIdWithDeleted(bill.user_id);

                const details = await billDetailsModel.find({
                    billId: bill.id,
                });

                const formattedDetails = details.map((detail) => ({
                    id: detail.detail_id,
                    billId: bill.id,
                    invoiceId: detail.invoice_id,
                    product: {
                        id: detail.product_id,
                        name: detail.product_name,
                        price: detail.unit_price,
                        type: detail.type,
                        createdAt: detail.created_at,
                        updatedAt: detail.updated_at,
                    },
                    qty: detail.qty,
                    price: detail.price,
                    paymentStatus: detail.payment_status,
                    status: detail.status,
                    finishDate: detail.finish_date,
                    createdAt: detail.created_at,
                    updatedAt: detail.updated_at,
                }));

                return {
                    id: bill.id,
                    billDate: bill.bill_date,
                    customer: {
                        id: customer.id,
                        name: customer.name,
                        phoneNumber: customer.phone_number,
                        address: customer.address,
                        createdAt: customer.created_at,
                        updatedAt: customer.updated_at,
                    },
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                    },
                    billDetails: formattedDetails,
                    createdAt: bill.created_at,
                    updatedAt: bill.updated_at,
                };
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: enrichedBills,
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
        const bills = await billModel.findReportNotPaidOff(date);

        const enrichedBills = await Promise.all(
            bills.map(async (bill) => {
                const customer = await customerModel.findByIdWithDeleted(
                    bill.customer_id
                );
                const user = await userModel.findByIdWithDeleted(bill.user_id);

                const details = await billDetailsModel.find({
                    billId: bill.id,
                });

                const formattedDetails = details.map((detail) => ({
                    id: detail.detail_id,
                    billId: bill.id,
                    invoiceId: detail.invoice_id,
                    product: {
                        id: detail.product_id,
                        name: detail.product_name,
                        price: detail.unit_price,
                        type: detail.type,
                        createdAt: detail.created_at,
                        updatedAt: detail.updated_at,
                    },
                    qty: detail.qty,
                    price: detail.price,
                    paymentStatus: detail.payment_status,
                    status: detail.status,
                    finishDate: detail.finish_date,
                    createdAt: detail.created_at,
                    updatedAt: detail.updated_at,
                }));

                return {
                    id: bill.id,
                    billDate: bill.bill_date,
                    customer: {
                        id: customer.id,
                        name: customer.name,
                        phoneNumber: customer.phone_number,
                        address: customer.address,
                        createdAt: customer.created_at,
                        updatedAt: customer.updated_at,
                    },
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                    },
                    billDetails: formattedDetails,
                    createdAt: bill.created_at,
                    updatedAt: bill.updated_at,
                };
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: enrichedBills,
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
        const bills = await billModel.findReportNotTakenYet(date);

        const enrichedBills = await Promise.all(
            bills.map(async (bill) => {
                const customer = await customerModel.findByIdWithDeleted(
                    bill.customer_id
                );
                const user = await userModel.findByIdWithDeleted(bill.user_id);

                const details = await billDetailsModel.find({
                    billId: bill.id,
                });

                const formattedDetails = details.map((detail) => ({
                    id: detail.detail_id,
                    billId: bill.id,
                    invoiceId: detail.invoice_id,
                    product: {
                        id: detail.product_id,
                        name: detail.product_name,
                        price: detail.unit_price,
                        type: detail.type,
                        createdAt: detail.created_at,
                        updatedAt: detail.updated_at,
                    },
                    qty: detail.qty,
                    price: detail.price,
                    paymentStatus: detail.payment_status,
                    status: detail.status,
                    finishDate: detail.finish_date,
                    createdAt: detail.created_at,
                    updatedAt: detail.updated_at,
                }));

                return {
                    id: bill.id,
                    billDate: bill.bill_date,
                    customer: {
                        id: customer.id,
                        name: customer.name,
                        phoneNumber: customer.phone_number,
                        address: customer.address,
                        createdAt: customer.created_at,
                        updatedAt: customer.updated_at,
                    },
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                    },
                    billDetails: formattedDetails,
                    createdAt: bill.created_at,
                    updatedAt: bill.updated_at,
                };
            })
        );

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: enrichedBills,
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
    const { id } = req.params;

    try {
        const bill = await billModel.findById(id);

        if (!bill) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Transaksi tidak ditemukan",
            });
        }

        const customer = await customerModel.findByIdWithDeleted(
            bill.customer_id
        );
        const user = await userModel.findByIdWithDeleted(bill.user_id);

        const details = await billDetailsModel.find({
            billId: id,
        });

        const formattedDetails = details.map((detail) => ({
            id: detail.detail_id,
            billId: bill.id,
            invoiceId: detail.invoice_id,
            product: {
                id: detail.product_id,
                name: detail.product_name,
                price: detail.unit_price,
                type: detail.type,
                createdAt: detail.created_at,
                updatedAt: detail.updated_at,
            },
            qty: detail.qty,
            price: detail.price,
            paymentStatus: detail.payment_status,
            status: detail.status,
            finishDate: detail.finish_date,
            createdAt: detail.created_at,
            updatedAt: detail.updated_at,
        }));

        res.status(200).json({
            status: { code: 200, description: "Ok" },
            data: {
                id: bill.id,
                billDate: bill.bill_date,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    phoneNumber: customer.phone_number,
                    address: customer.address,
                    createdAt: customer.created_at,
                    updatedAt: customer.updated_at,
                },
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                },
                billDetails: formattedDetails,
                createdAt: bill.created_at,
                updatedAt: bill.updated_at,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

exports.updateBill = async (req, res) => {
    const { id, customerId, billDetails } = req.body;
    const userId = req.user.id; // Taken from JWT token
    const updatedAt = getCurrentDateAndTime();

    try {
        await pool.query("START TRANSACTION");

        const [customer, user] = await Promise.all([
            customerModel.findById(customerId),
            userModel.findById(userId),
        ]);

        if (!customer || !user) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Pelanggan atau karyawan tidak ditemukan",
            });
        }

        const existingBill = await billModel.findById(id);

        if (!existingBill) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Transaksi tidak ditemukan",
            });
        }

        await billModel.update({
            id,
            customerId,
            userId,
            updatedAt,
        });

        const enrichedBillDetails = await Promise.all(
            billDetails.map(async (detail) => {
                const product = await productModel.findById(detail.product.id);
                if (!product) {
                    throw new Error("Produk tidak ditemukan");
                }
                const price = product.price * detail.qty;
                const finishDate = format(
                    new Date(detail.finishDate),
                    "yyyy-MM-dd HH:mm:ssXXX",
                    {
                        timeZone,
                    }
                ).replace("Z", "");

                await billDetailsModel.update({
                    id: detail.id,
                    invoiceId: detail.invoiceId,
                    productId: detail.product.id,
                    qty: detail.qty,
                    price,
                    paymentStatus: detail.paymentStatus,
                    status: detail.status,
                    finishDate,
                    updatedAt,
                });

                return {
                    id: detail.id,
                    billId: existingBill.id,
                    invoiceId: detail.invoiceId,
                    product: {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        type: product.type,
                        createdAt: product.createdAt,
                        updatedAt: product.updatedAt,
                    },
                    qty: detail.qty,
                    price,
                    paymentStatus: detail.paymentStatus,
                    status: detail.status,
                    finishDate,
                    createdAt: detail.createdAt,
                    updatedAt,
                };
            })
        );

        await pool.query("COMMIT");

        res.status(200).json({
            status: { code: 201, description: "Ok" },
            data: {
                id: existingBill.id,
                billDate: existingBill.billDate,
                customer,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                billDetails: enrichedBillDetails,
                createdAt: existingBill.createdAt,
                updatedAt: existingBill.updatedAt,
            },
        });
    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};

exports.deleteBill = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("START TRANSACTION");

        const existingBill = await billModel.findById(id);

        if (!existingBill) {
            return res.status(404).json({
                status: { code: 404, description: "Not Found" },
                error: "Transaksi tidak ditemukan",
            });
        }

        await billModel.delete(id);

        await pool.query("COMMIT");
        res.status(204).end();
    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: error.message,
        });
    }
};
