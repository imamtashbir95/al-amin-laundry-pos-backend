const customerModel = require("../models/customerModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const billDetailsModel = require("../models/billDetailsModel");
const generateId = require("../utils/generateId");
const { formatDate } = require("./formatDate");

const enrichBillDetails = async (details, billId, updatedAt, operation) => {
    if (!["create", "update"].includes(operation)) throw new Error("Invalid operation");

    return Promise.all(
        details.map(async (detail) => {
            const product = await productModel.findById(detail.product.id);
            if (!product) throw new Error("Product not found");

            const price = product.price * detail.qty;
            const finishDate = formatDate(detail.finishDate);

            const billDetailsData = {
                id: detail.id || generateId(),
                billId,
                invoiceId: detail.invoiceId,
                productId: product.id,
                qty: detail.qty,
                price: product.price * detail.qty,
                paymentStatus: detail.paymentStatus,
                status: detail.status,
                finishDate,
                updatedAt,
            };

            let processedBillDetails;
            if (operation === "create") {
                (billDetailsData.createdAt = updatedAt),
                    (processedBillDetails = await billDetailsModel.create(billDetailsData));
            } else if (operation === "update") {
                processedBillDetails = await billDetailsModel.update(billDetailsData);
            }

            return {
                id: processedBillDetails.id,
                billId: processedBillDetails.bill_id,
                invoiceId: processedBillDetails.invoice_id,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    type: product.type,
                    createdAt: product.created_at,
                    updatedAt: product.updated_at,
                },
                qty: processedBillDetails.qty,
                price,
                paymentStatus: processedBillDetails.payment_status,
                status: processedBillDetails.status,
                finishDate: processedBillDetails.finish_date,
                createdAt: processedBillDetails.created_at,
                updatedAt: processedBillDetails.updated_at,
            };
        }),
    );
};

const enrichBill = async (bill) => {
    const [customer, user] = await Promise.all([
        customerModel.findByIdWithDeleted(bill.customer_id),
        userModel.findByIdWithDeleted(bill.user_id),
    ]);

    const details = await billDetailsModel.find({ billId: bill.id });

    const formattedDetails = details.map((detail) => ({
        id: detail.id,
        billId: bill.id,
        invoiceId: detail.invoice_id,
        product: {
            id: detail.product.id,
            name: detail.product.name,
            price: detail.product.price,
            type: detail.product.type,
            createdAt: detail.product.created_at,
            updatedAt: detail.product.updated_at,
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
};

module.exports = {
    formatDate,
    enrichBillDetails,
    enrichBill,
};
