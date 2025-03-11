const formatProduct = (product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    type: product.type,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
});

module.exports = {
    formatProduct
}