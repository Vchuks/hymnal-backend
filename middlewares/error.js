module.exports = function (err, req, res, next) {
    // Log the full error to Vercel/console for backend debugging
    console.error("Backend Error:", err);

    // Safeguard: If headers were already sent, delegate to default Express handler
    if (res.headersSent) {
        return next(err);
    }

    // Extract the descriptive message or default to generic string
    const errorMessage = err.message || "Something went wrong on the server";

    res.status(500).json({
        message: "Something failed",
        error: process.env.NODE_ENV === "production" ? errorMessage : err.stack
    });
};
