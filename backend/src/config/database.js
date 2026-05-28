const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
async function connectDB() {
    const MONGO_URL = process.env.MONGO_URI?.trim().replace(/;$/, '');

    if (!MONGO_URL) {
        throw new Error('MONGO_URI is not set');
    }

    try{
        await mongoose.connect(MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
}
module.exports = connectDB;
