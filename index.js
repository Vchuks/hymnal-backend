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

app.use(async (req, res, next) => {
    if (isConnected) return next();

    try {
        console.log("Attempting database connection...");
        const db = await mongoose.connect(process.env.DB_URL || "mongodb://localhost/library", {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000 // Fails fast in 5s instead of hanging 
        });
        
        isConnected = db.connections[0].readyState === 1;
        console.log("Database connected successfully.");
        return next();
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        
        // Return immediately so the serverless function can shut down cleanly
        return res.status(500).json({ 
            error: "Database connection failed",
            details: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message
        });
    }
});


// REQUIRED FOR VERCEL: Export the app instance
module.exports = app;

if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 4000
    app.listen(port, () => console.log(`listening to port ${port}`))
}
