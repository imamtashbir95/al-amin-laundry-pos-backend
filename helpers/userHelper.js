const formatUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
});

module.exports = {
    formatUser,
};
