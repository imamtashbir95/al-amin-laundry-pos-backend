const formatUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
});

const formatCurrentUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    gender: user.gender,
    language: user.language,
    phoneNumber: user.phone_number,
    password: user.password,
    passwordUpdatedAt: user.password_updated_at,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
});

module.exports = {
    formatUser,
    formatCurrentUser
};
