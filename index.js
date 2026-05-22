const express = require("express");
// require("express-async-errors")
const app = express();
const mongoose = require("mongoose");
const error = require("./middlewares/error")
const authRoutes = require("./routes/auth")
const hymnsRoutes = require("./routes/hymns")
const categoryRoutes = require("./routes/category")


app.use(express.json());
app.use("/auth", authRoutes)
app.use("/hymn", hymnsRoutes)
app.use("/category", categoryRoutes)
app.use(error)

mongoose
    .connect("mongodb://localhost/library")
    .then(() => console.log("connecting..."))
    .catch((err) => console.log(`not connecting... ${err}`));

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`listening to port ${port}`))

