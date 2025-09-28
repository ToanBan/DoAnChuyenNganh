const jwt = require('jsonwebtoken');

const VerifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);

        // Nếu token hết hạn thì trả về lỗi rõ ràng hơn
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access token expired' });
        }

        // Các lỗi khác
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = VerifyToken;
