const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/auth.route');
const songRoutes = require('./routes/song.route');
const spotifyRoutes = require('./routes/spotify.route');
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
const FRONTEND_URL = process.env.FRONTEND_URL;
const corsOptions = {
  origin: FRONTEND_URL ? FRONTEND_URL : true,
  credentials: true,
};
app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/spotify', spotifyRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});
module.exports = app;
