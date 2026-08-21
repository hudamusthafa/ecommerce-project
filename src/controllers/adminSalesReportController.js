const adminSalesReportService = require("../services/adminSalesReportService");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

exports.getSalesReport = async (req, res, next) => {

    try {

const filter = req.query.filter || "daily";

const fromDate = req.query.fromDate || "";

const toDate = req.query.toDate || "";

const { orders,summary,reportFrom,reportTo} =

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
    toDate,
    error: req.query.error || ""
});
}catch (error) {

    res.render("admin/sales-report", {
        orders: [],
        summary: {
            totalOrders: 0,
            totalSales: 0,
            totalDiscount: 0,
            couponDiscount: 0,
            netSales: 0
        },
        filter: req.query.filter || "daily",
        fromDate: req.query.fromDate || "",
        toDate: req.query.toDate || "",
        error: error.message
    });

}

};



exports.downloadSalesReportPDF = async (req, res, next) => {

  try {

    const filter = req.query.filter || "daily";
    const fromDate = req.query.fromDate || "";
    const toDate = req.query.toDate || "";

    const { orders, summary ,reportFrom,reportTo} =
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

    if(filter !== "daily"){
        doc.text(
    `From : ${reportFrom.toLocaleDateString("en-GB")}`
    );

    doc.text(
        `To : ${reportTo.toLocaleDateString("en-GB")}`
    );
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
    doc.text(`Total Sales : Rs. ${summary.totalSales.toLocaleString()}/-`);
    doc.text(`Total Discount : Rs. ${summary.totalDiscount.toLocaleString()}/-`);
    doc.text(`Coupon Discount : Rs. ${summary.couponDiscount.toLocaleString()}/-`);
    doc.text(`Net Sales : Rs.${summary.netSales.toLocaleString()}/-`);

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

doc.text("Order ID", 50, tableTop);
doc.text("Customer", 165, tableTop);
doc.text("Amount", 280, tableTop);
doc.text("Discount", 345, tableTop);
doc.text("Final", 405, tableTop);
doc.text("Date", 480, tableTop);

    let y = tableTop + 30;

    doc.fillColor("black")
      .font("Helvetica")
      .fontSize(10);

orders.forEach(order => {

    doc.text(order.orderId, 50, y, {
        width: 110
    });

    doc.text(
        order.user?.name || "-",
        165,
        y,
        {
            width: 105
        }
    );

    doc.text(`Rs. ${order.subtotal.toLocaleString()}/-`, 280, y);

    doc.text(`Rs. ${(order.discount || 0).toLocaleString()}/-`, 345, y);

    doc.text(`Rs. ${order.total.toLocaleString()}/-`, 405, y);

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


//==============================

exports.downloadSalesReportExcel = async (req, res, next) => {

    try {

        const filter = req.query.filter || "daily";
        const fromDate = req.query.fromDate || "";
        const toDate = req.query.toDate || "";

        const { orders, summary,reportFrom, reportTo } =
            await adminSalesReportService.getSalesReport({
                filter,
                fromDate,
                toDate
            });

        const workbook = new ExcelJS.Workbook();

        workbook.creator = "Aura";
        workbook.created = new Date();

        const worksheet =
            workbook.addWorksheet("Sales Report");

        // =========================
        // COLUMN WIDTHS
      

worksheet.columns = [

    { width: 24 }, 
    { width: 25 }, 
    { width: 16 }, 
    { width: 16 }, 
    { width: 16 },
    { width: 18 }, 
    { width: 16 }  

];

        // =========================
        // TITLE
        

       worksheet.mergeCells("A1:G1");

        worksheet.getCell("A1").value = "AURA";

        worksheet.getCell("A1").font = {

            name: "Calibri",
            size: 24,
            bold: true,
            color: {
                argb: "9A6434"
            }

        };

        worksheet.getCell("A1").alignment = {

            horizontal: "center"

        };

        worksheet.getRow(1).height = 32;

        worksheet.mergeCells("A2:G2");

        worksheet.getCell("A2").value = "Jewellery Store";

        worksheet.getCell("A2").alignment = {

            horizontal: "center"

        };

        worksheet.mergeCells("A4:G4");

        worksheet.getCell("A4").value = "SALES REPORT";

        worksheet.getCell("A4").font = {

            name: "Calibri",
            size: 18,
            bold: true

        };

        worksheet.getCell("A4").alignment = {

            horizontal: "center"

        };

        worksheet.getRow(4).height = 26;

        // =========================
        // REPORT INFORMATION
        

        worksheet.addRow([]);

       const reportHeader = worksheet.addRow([
    "Report Information"
]);

worksheet.mergeCells(
    `A${reportHeader.number}:G${reportHeader.number}`
);

reportHeader.eachCell(cell => {

    cell.font = {
        bold: true,
        color: {
            argb: "FFFFFF"
        }
    };

    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "9A6434"
        }
    };

    cell.alignment = {
        horizontal: "center"
    };

});

        worksheet.addRow([
            "Report Type",
            filter.toUpperCase()
        ]);


 if(filter !== "daily"){
worksheet.addRow([
    "From",
    fromDate
        ? new Date(fromDate + "T00:00:00").toLocaleDateString("en-GB")
        : reportFrom.toLocaleDateString("en-GB")
]);

worksheet.addRow([
    "To",
    toDate
        ? new Date(toDate + "T00:00:00").toLocaleDateString("en-GB")
        : reportTo.toLocaleDateString("en-GB")
]);
 }

  

        worksheet.addRow([
            "Generated On",
            new Date().toLocaleDateString("en-GB")
        ]);

        worksheet.addRow([]);

        // =========================
        // SUMMARY
        
const summaryHeader = worksheet.addRow([
    "Summary"
]);

worksheet.mergeCells(
    `A${summaryHeader.number}:G${summaryHeader.number}`
);

summaryHeader.eachCell(cell => {

    cell.font = {
        bold: true,
        color: {
            argb: "FFFFFF"
        }
    };

    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "9A6434"
        }
    };

    cell.alignment = {
        horizontal: "center"
    };

});

const totalOrdersRow = worksheet.addRow([
    "Total Orders",
    summary.totalOrders
]);

const totalSalesRow = worksheet.addRow([
    "Total Sales",
    summary.totalSales
]);

const totalDiscountRow = worksheet.addRow([
    "Total Discount",
    summary.totalDiscount
]);

const couponDiscountRow = worksheet.addRow([
    "Coupon Discount",
    summary.couponDiscount
]);

const netSalesRow = worksheet.addRow([
    "Net Sales",
    summary.netSales
]);
        worksheet.addRow([]);

        // =========================
        // ORDERS TABLE
        

const ordersHeader = worksheet.addRow([
    "Order ID",
    "Customer",
    "Order Amount",
    "Discount",
    "Final Amount",
    "Payment",
    "Date"
]);

ordersHeader.eachCell(cell => {

    cell.font = {

        bold: true,
        color: {
            argb: "FFFFFF"
        }

    };

    cell.fill = {

        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "9A6434"
        }

    };

    cell.alignment = {

        horizontal: "center"

    };

});

orders.forEach(order => {

    worksheet.addRow([

        order.orderId,

        order.user?.name || "-",

        order.subtotal,

        order.discount || 0,

        order.total,

        order.paymentMethod,

        new Date(order.createdAt)
            .toLocaleDateString("en-GB")

    ]);

});

        // =========================
        // ALIGNMENT
        

        worksheet.getColumn(4).alignment = {

            horizontal: "right"

        };

            worksheet.getColumn(7).alignment = {
                horizontal: "center"
            };

        // =========================
        // CURRENCY FORMAT
        

 worksheet.getColumn(3).numFmt = '₹#,##0.00';
worksheet.getColumn(4).numFmt = '₹#,##0.00';
worksheet.getColumn(5).numFmt = '₹#,##0.00';



totalSalesRow.getCell(2).numFmt = '₹#,##0.00';

totalDiscountRow.getCell(2).numFmt = '₹#,##0.00';

couponDiscountRow.getCell(2).numFmt = '₹#,##0.00';

netSalesRow.getCell(2).numFmt = '₹#,##0.00';

        // =========================
        // BORDERS
        

        worksheet.eachRow(row => {

            row.eachCell(cell => {

                cell.border = {

                    top: {
                        style: "thin"
                    },

                    left: {
                        style: "thin"
                    },

                    bottom: {
                        style: "thin"
                    },

                    right: {
                        style: "thin"
                    }

                };

            });

        });

        // =========================
        // FOOTER
      
worksheet.addRow([]);

const footerRow = worksheet.addRow([
    "This report was generated electronically."
]);

worksheet.mergeCells(
    `A${footerRow.number}:G${footerRow.number}`
);

footerRow.getCell(1).alignment = {
    horizontal: "center"
};

footerRow.getCell(1).font = {
    italic: true,
    color: {
        argb: "808080"
    }
};

//header stay visible

worksheet.views = [
    {
        state: "frozen",
        ySplit: ordersHeader.number
    }
];




        // =========================
        // DOWNLOAD
        

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Sales-Report.xlsx"
        );

        await workbook.xlsx.write(res);

        return res.end();

    } catch (error) {

        console.log(error);

        next(error);

    }

};