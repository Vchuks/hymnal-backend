const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL || "mongodb://localhost/library";

// Set a global variable to persist the connection across serverless requests
let cachedDb = global.mongoose;

if (!cachedDb) {
    cachedDb = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    // If a connection is already alive, reuse it instantly
    if (cachedDb.conn) {
        return cachedDb.conn;
    }

    // If no connection attempt is in progress, start one
    if (!cachedDb.promise) {
        console.log("Opening a fresh MongoDB socket...");
        cachedDb.promise = mongoose.connect(DB_URL, {
            maxPoolSize: 10,              // Prevents concurrent requests from overwhelming the DB
            serverSelectionTimeoutMS: 5000 // Fails fast in 5 seconds instead of hanging
        }).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }

    try {
        cachedDb.conn = await cachedDb.promise;
    } catch (e) {
        cachedDb.promise = null; // Clear the bad promise if it fails
        throw e;
    }

    return cachedDb.conn;
}

module.exports = connectDB;
