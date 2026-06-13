const adminOrderService=require("../services/adminOrderService");

// GET ORDERS PAGE

exports.getOrders=async(req,res,next)=>{
  try{

    const page=parseInt(req.query.page)||1;
    const limit=10;

    const result=await adminOrderService.getOrders(
      page,
      limit
    );

    res.render("admin/orders",{
      orders:result.orders,
      total:result.total,
      totalPages:result.totalPages,
      currentPage:page
    });

  }catch(error){

    next(error);
  }
};


// GET ORDER DETAILS PAGE

exports.getOrderDetails=async(req,res,next)=>{
  try{

    const order=await adminOrderService.getOrderDetails(
      req.params.id
    );

    res.render("admin/order-details",{
      order
    });

  }catch(error){

    next(error);
  }
};