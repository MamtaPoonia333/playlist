const express = require('express');
const spotifyController = require('../controllers/spotify.controller');

const spotifyRouter = express.Router();

spotifyRouter.get('/login', spotifyController.spotifyLoginController);
spotifyRouter.get('/callback', spotifyController.spotifyCallbackController);
spotifyRouter.get('/me', spotifyController.spotifyProfileController);
spotifyRouter.get('/recommendations', spotifyController.spotifyRecommendationsController);
spotifyRouter.post('/logout', spotifyController.spotifyLogoutController);

module.exports = spotifyRouter;
