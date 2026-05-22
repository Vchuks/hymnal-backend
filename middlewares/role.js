function admin(req, res, next) {
    const checkAdmin = req.user.isAdmin
    if (checkAdmin === "user") {
        return res.status(403).send("Forbidden, not an admin")
    }
    next()
}

module.exports = admin