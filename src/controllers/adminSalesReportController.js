const adminSalesReportService = require("../services/adminSalesReportService");
const PDFDocument = require("pdfkit");


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



exports.downloadSalesReportPDF = async (req, res, next) => {

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

    const PDFDocument = require("pdfkit");

    const doc = new PDFDocument({
      margin: 50
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Sales-Report.pdf"
    );

    doc.pipe(res);

    // =========================
    // HEADER
   

    doc.fontSize(28)
      .fillColor("#9a6434")
      .font("Helvetica-Bold")
      .text("AURA", {
        align: "center"
      });

    doc.fontSize(11)
      .fillColor("gray")
      .font("Helvetica")
      .text("Jewellery Store", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(24)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("SALES REPORT", {
        align: "center"
      });

    doc.moveDown(2);

    // =========================
    // REPORT INFORMATION
    

    doc.fontSize(15)
      .fillColor("#9a6434")
      .font("Helvetica-Bold")
      .text("Report Information");

    doc.moveDown(0.5);

    doc.fontSize(12)
      .fillColor("black")
      .font("Helvetica");

    doc.text(`Report Type : ${filter}`);

    if (filter === "custom") {

      doc.text(`From : ${fromDate}`);
      doc.text(`To : ${toDate}`);

    }

    doc.text(
      `Generated On : ${new Date().toLocaleDateString("en-GB")}`
    );

    doc.moveDown();

    doc.moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown();

    // =========================
    // SUMMARY
  

    doc.fontSize(15)
      .fillColor("#9a6434")
      .font("Helvetica-Bold")
      .text("Summary");

    doc.moveDown(0.5);

    doc.fontSize(12)
      .fillColor("black")
      .font("Helvetica");

    doc.text(`Total Orders : ${summary.totalOrders}`);
    doc.text(`Total Sales : ₹${summary.totalSales}`);
    doc.text(`Total Discount : ₹${summary.totalDiscount}`);
    doc.text(`Coupon Discount : ₹${summary.couponDiscount}`);
    doc.text(`Net Sales : ₹${summary.netSales}`);

    doc.moveDown();

    doc.moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown();

    // =========================
    // ORDERS TABLE
  

    doc.fontSize(15)
      .fillColor("#9a6434")
      .font("Helvetica-Bold")
      .text("Orders");

    doc.moveDown();

    const tableTop = doc.y;

    doc.rect(50, tableTop - 5, 500, 22)
      .fill("#9a6434");

    doc.fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(11);

    doc.text("Order ID", 60, tableTop);
    doc.text("Customer", 190, tableTop);
    doc.text("Payment", 320, tableTop);
    doc.text("Total", 410, tableTop);
    doc.text("Date", 480, tableTop);

    let y = tableTop + 30;

    doc.fillColor("black")
      .font("Helvetica")
      .fontSize(10);

    orders.forEach(order => {

      doc.text(order.orderId, 60, y, {
        width: 120
      });

      doc.text(
        order.user?.name || "-",
        190,
        y,
        {
          width: 110
        }
      );

      doc.text(order.paymentMethod, 320, y);

      doc.text(`₹${order.total}`, 410, y);

      doc.text(
        new Date(order.createdAt).toLocaleDateString("en-GB"),
        480,
        y
      );

      y += 25;

      // New page if needed
      if (y > 720) {

        doc.addPage();

        y = 60;

      }

    });

    doc.y = y + 10;

    doc.moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(2);

    // =========================
    // FOOTER
    

    doc.fontSize(10)
      .fillColor("gray")
      .font("Helvetica");

    doc.text(
      "This report was generated electronically.",
      {
        align: "center"
      }
    );

    doc.end();

  } catch (error) {

    next(error);

  }

};
