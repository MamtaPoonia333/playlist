const jwt = require('jsonwebtoken');

async function identifyUser(req, res, next) {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    const token = cookieToken || bearerToken;

    if (!token) {
        return res.status(401).json({
            message: 'Token not provided, Unauthorized access'
        });
    }

    let decoded = null;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            message: 'user not authorized'
        });
    }

    const userId = decoded.id || decoded.ID || decoded._id;

    if (!userId) {
        return res.status(401).json({
            message: 'user not authorized'
        });
    }

    req.user = {
        ...decoded,
        id: userId.toString()
    };

    next();
}

module.exports = identifyUser;