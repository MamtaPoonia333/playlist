const multer = require('multer');
const postRouter = require('express').Router();
const songController = require('../controllers/song.controller');
const identifyUser = require('../middlewares/auth.middleware');

const uploadSong = multer({ storage: multer.memoryStorage() });

postRouter.get('/', songController.getAllSongs);
postRouter.get('/search', songController.searchSongs);
postRouter.get('/genre', songController.getAllSongsByGenre);
postRouter.get('/artist', songController.getPlaylistByArtist);
postRouter.get('/:id', songController.getSongById);

postRouter.post('/upload', identifyUser, uploadSong.single('audio'), songController.createSong);
postRouter.post('/heart/:id', identifyUser, songController.heartSong);
postRouter.delete('/:id', identifyUser, songController.deleteSong);

module.exports = postRouter;
