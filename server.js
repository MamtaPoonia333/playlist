const app = require('./src/app');
require('dotenv').config();
const connectDB = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');

async function startServer() {
  try {
    await connectDB();
    await connectRedis();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup aborted because a required service is unavailable.');
    console.error('Error:', error && (error.stack || error.message || error));
    process.exit(1);
  }
}

startServer();