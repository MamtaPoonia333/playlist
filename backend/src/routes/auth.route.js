const express = require('express');
const PostRouter = express.Router();

const authController = require('../controllers/auth.controller');
const identifyUser = require('../middlewares/auth.middleware');
const { isBlacklisted } = require('../middlewares/blacklist.middleware');

PostRouter.post('/register', authController.registerController);
PostRouter.post('/login', authController.loginController);
PostRouter.post('/logout',authController.logoutController);
PostRouter.get('/me', isBlacklisted, identifyUser, authController.meController);
PostRouter.delete('/account/:email', isBlacklisted, identifyUser, authController.deleteAccountController);
module.exports = PostRouter;
