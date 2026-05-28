const userModel = require('../model/user.model');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { redisClient } = require('../config/redis');

const cookieOptions = {
	httpOnly: true,
	sameSite: 'lax'
};

function signAuthToken(user) {
	return jwt.sign(
		{ ID: user._id, username: user.username, email: user.email },
		process.env.JWT_SECRET,
		{ expiresIn: '1d', jwtid: crypto.randomUUID() }
	);
}

async function revokeToken(token) {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded?.jti || !decoded?.exp) {
			return;
		}

		const ttl = decoded.exp - Math.floor(Date.now() / 1000);
		if (ttl > 0) {
			await redisClient.set(`blacklist:${decoded.jti}`, '1', { EX: ttl });
		}
	} catch (error) {
		return;
	}
}

async function registerController(req, res) {

	try {
		const { username, email, password, bio, profilePicture } = req.body || {};

		if (!username || !email || !password) {
			return res.status(400).json({
				message: 'username, email and password are required'
			});
		}

		const isUserExist = await userModel.findOne({
			$or: [{ email }, { username }]
		});

		if (isUserExist) {
			return res.status(409).json({
				message: 'User with this email or username already exists'
			});
		}

		const hashed = await bcrypt.hash(password, 10);

		const newUser = new userModel({
			username,
			email,
			password: hashed,
			bio,
			profilePicture
		});

		await newUser.save();

		const token = signAuthToken(newUser);

		res.cookie('token', token, cookieOptions);
		return res.status(201).json({
			message: 'User created successfully',
			token,
			user: {
				username: newUser.username,
				email: newUser.email,
				bio: newUser.bio,
				profilePicture: newUser.profilePicture
			}
		});
	} catch (error) {
		console.error('registerController error:', error.message);
		return res.status(500).json({ message: 'Internal server error' });
	}
}
async function deleteAccountController(req, res) {
	const userId = req.user?.id;
	const requestedEmail = req.params?.email?.trim().toLowerCase();
	const { password } = req.body;

	if (!userId) {
		return res.status(401).json({
			message: 'Unauthorized access'
		});
	}

	if (!password) {
		return res.status(400).json({
			message: 'Password is required'
		});
	}

	try {
		const existingUser = await userModel.findById(userId);

		if (!existingUser) {
			return res.status(404).json({
				message: 'User not found'
			});
		}

		if (requestedEmail && existingUser.email.toLowerCase() !== requestedEmail) {
			return res.status(403).json({
				message: 'You can only delete your own account'
			});
		}

		const isMatch = await bcrypt.compare(password, existingUser.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid password' });
		}

		await userModel.findByIdAndDelete(userId);

		const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
		if (token) {
			await revokeToken(token);
		}

		res.clearCookie('token', cookieOptions);

		return res.status(200).json({
			message: 'User account deleted successfully'
		});
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}

}

async function loginController(req, res) {
	try {
		const { email, password } = req.body || {};

		if (!email || !password) {
			return res.status(400).json({
				message: 'email and password are required'
			});
		}

		const user = await userModel.findOne({ email }).select('+password');
		if (!user || !user.password) {
			return res.status(404).json({ message: 'User not found or password unavailable' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid password' });
		}

		const token = signAuthToken(user);

		res.cookie('token', token, cookieOptions);
		return res.status(200).json({
			message: 'Login successful',
			token,
			user: {
				username: user.username,
				email: user.email,
				bio: user.bio,
				profilePicture: user.profilePicture
			}
		});
	} catch (error) {
		console.error('loginController error:', error.message);
		return res.status(500).json({ message: 'Internal server error' });
	}
}
async function logoutController(req, res) {
	try {
		const token = (req.cookies && req.cookies.token) || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
		if (token) {
			await revokeToken(token);
		}
		res.clearCookie('token', cookieOptions);
		return res.status(200).json({
			message: 'Logout successful'
		});
	} catch (error) {
		console.error('logoutController error:', error.message || error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function meController(req, res) {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized access' });
		}

		const user = await userModel.findById(userId).select('-password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json({ user });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}
}

module.exports = {
	registerController,
	loginController,
	deleteAccountController,
	logoutController,
	meController
};