const express = require('express');
const PostRouter = express.Router();

const authController = require('../controllers/auth.controller');
const identifyUser = require('../middlewares/auth.middleware');

PostRouter.post('/register', authController.registerController);
PostRouter.post('/login', authController.loginController);
PostRouter.post('/logout',authController.logoutController);
PostRouter.get('/me', identifyUser, authController.meController);
PostRouter.delete('/account/:email', identifyUser, authController.deleteAccountController);
module.exports = PostRouter;
