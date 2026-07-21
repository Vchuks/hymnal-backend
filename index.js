const express = require("express");
const cors = require("cors")
const app = express();
const mongoose = require("mongoose");
const error = require("./middlewares/error")
const authRoutes = require("./routes/auth")
const hymnsRoutes = require("./routes/hymns")
const categoryRoutes = require("./routes/category")


app.use(cors())
app.use(express.json());
app.use("/auth", authRoutes)
app.use("/hymn", hymnsRoutes)
app.use("/category", categoryRoutes)
app.use(error)

let isConnected = false;

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
    if (isConnected) {
        return next();
    }
    try {
        const db = await mongoose.connect(process.env.DB_URL, {
            maxPoolSize: 10, // Limits maximum open sockets per function
            serverSelectionTimeoutMS: 5000 // Fails fast instead of hanging
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("Connected to MongoDB");
        next();
    } catch (err) {
        console.error(`MongoDB connection error: ${err}`);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// REQUIRED FOR VERCEL: Export the app instance
module.exports = app;

if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 4000
    app.listen(port, () => console.log(`listening to port ${port}`))
}
