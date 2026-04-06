export const verifyRole = (req, res, next) => {
    const { role } = req.user;
    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden. Only admins or superadmins are allowed.' });
    }
    next();
};

