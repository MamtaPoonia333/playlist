const app = require('./src/app');
require('dotenv').config();
const connectDB = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');

async function startServer() {
  try {
    await connectDB();
    await connectRedis();
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error('Server startup aborted because a required service is unavailable.');
    process.exit(1);
  }
}

startServer();