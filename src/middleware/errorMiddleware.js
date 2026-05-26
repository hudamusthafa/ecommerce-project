const errorMiddleware = (err, req, res, next) => {

    console.log(err);

    const statusCode = err.statusCode || 500;

    const message = err.message || "Something went wrong";

    res.status(statusCode).render("user/error", {
        statusCode,
        message
    });
};

module.exports = errorMiddleware;