const adminSalesReportService = require("../services/adminSalesReportService");

exports.getSalesReport = async (req, res, next) => {

    try {

const filter = req.query.filter || "daily";

const fromDate = req.query.fromDate || "";

const toDate = req.query.toDate || "";

const { orders, summary } =
await adminSalesReportService.getSalesReport({
    filter,
    fromDate,
    toDate
});

res.render("admin/sales-report",{
    orders,
    summary,
    filter,
    fromDate,
    toDate
});
    } catch (error) {

        next(error);

    }

};