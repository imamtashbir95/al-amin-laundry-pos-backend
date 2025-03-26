const formatCustomer = (customer) => ({
    id: customer.id,
    name: customer.name,
    phoneNumber: customer.phone_number,
    address: customer.address,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
});

module.exports = {
    formatCustomer,
};
