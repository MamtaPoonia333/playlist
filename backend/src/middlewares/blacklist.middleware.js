const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');

const isBlacklisted = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.jti) {
        return res.status(401).json({ message: 'Access denied. Token is missing revocation metadata.' });
    }

    const isRevoked = await redisClient.exists(`blacklist:${decoded.jti}`);
    if (isRevoked) {
        return res.status(401).json({ message: 'Access denied. Token revoked.' });
    }

    next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { isBlacklisted };
