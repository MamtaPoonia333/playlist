const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const app = require('./src/app');
const connectDB = require('./src/config/database');

async function startServer() {
  try {
    await connectDB();
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
