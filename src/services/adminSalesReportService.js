const Order = require("../models/Order");

exports.getSalesReport = async (
      filter,
    fromDate,
    toDate
) => {

 
let query = {
    paymentStatus: "Paid"
};

const today = new Date();

// DAILY
if (filter === "daily") {

    const dayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const dayEnd = new Date(dayStart);

    dayEnd.setDate(dayEnd.getDate() + 1);

    query.createdAt = {
        $gte: dayStart,
        $lt: dayEnd
    };

}

// WEEKLY
else if (filter === "weekly") {

    const weekStart = new Date(today);

    weekStart.setDate(
        today.getDate() - today.getDay()
    );

    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);

    weekEnd.setDate(weekEnd.getDate() + 7);

    query.createdAt = {
        $gte: weekStart,
        $lt: weekEnd
    };

}

// YEARLY
else if (filter === "yearly") {

    const yearStart = new Date(
        today.getFullYear(),
        0,
        1
    );

    const yearEnd = new Date(
        today.getFullYear() + 1,
        0,
        1
    );

    query.createdAt = {
        $gte: yearStart,
        $lt: yearEnd
    };

}

// CUSTOM DATE
else if (filter === "custom") {

    if (fromDate && toDate) {

        const start = new Date(fromDate);

        const end = new Date(toDate);

        end.setDate(end.getDate() + 1);

        query.createdAt = {
            $gte: start,
            $lt: end
        };

    }

}


  const orders = await Order.find(query)
    .populate("user")
    .sort({ createdAt: -1 });

    const summary = {

        totalOrders: orders.length,

        totalSales: orders.reduce(
            (sum, order) => sum + order.subtotal,
            0
        ),

        totalDiscount: orders.reduce(
            (sum, order) => sum + (order.discount || 0),
            0
        ),

        couponDiscount: orders.reduce(
            (sum, order) => sum + (order.discount || 0),
            0
        ),

        netSales: orders.reduce(
            (sum, order) => sum + order.total,
            0
        )

    };

    return {
        orders,
        summary
    };

};