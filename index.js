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

mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("connecting..."))
    .catch((err) => console.log(`not connecting... ${err}`));

// REQUIRED FOR VERCEL: Export the app instance
module.exports = app;

if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 4000
    app.listen(port, () => console.log(`listening to port ${port}`))
}
