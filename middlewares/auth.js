const jwt = require("jsonwebtoken")

module.exports = function checkAuthentication(req, res, next) {
    const authBearer = req.header("authorization")
    if (!authBearer || !authBearer.startsWith("Bearer ")) {
        return res.status(401).send("Access Denied, no token provided")
    }
    const token = authBearer.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JwtKey);
        req.user = decoded;
        
        next(); 
    } catch (ex) {
        res.status(400).send("Invalid token.");
    }
}