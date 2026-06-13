const adminOrderService=require("../services/adminOrderService");

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