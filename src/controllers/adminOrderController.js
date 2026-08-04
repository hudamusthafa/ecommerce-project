const adminOrderService=require("../services/adminOrderService");

// GET ORDERS PAGE

exports.getOrders=async(req,res,next)=>{
  try{

    const page=parseInt(req.query.page)||1;
    const limit=10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const dateFrom = req.query.dateFrom || "";  
    const dateTo = req.query.dateTo || "";      

     const result = await adminOrderService.getOrders(
      search, status, page, limit, dateFrom, dateTo  
    );

    res.render("admin/orders",{
      orders:result.orders,
      total:result.total,
      totalPages:result.totalPages,
      currentPage:page,
      search,
      status,
       dateFrom, 
       dateTo 
    });

  }catch(error){

    next(error);
  }
};


// GET ORDER DETAILS PAGE

exports.getOrderDetails=async(req,res,next)=>{
  try{

    const order = await adminOrderService.getOrderDetails(req.params.id);


    res.render("admin/order-details",{order,error:req.query.error });

  }catch(error){

    next(error);
  }
};


//UPDATE ORDER DETAILS

exports.updateOrderStatus = async (req, res) => {

    try {

        if (!req.body.status) {

            return res.redirect(
                "/admin/orders/" +
                req.params.id +
                "?error=Please select a new status before updating."
            );
        }

        await adminOrderService.updateOrderStatus(
            req.params.id,
            req.body.status
        );

        res.redirect("/admin/orders/" + req.params.id);

    } catch (error) {

        return res.redirect(
            "/admin/orders/" +
            req.params.id +
            "?error=" +
            encodeURIComponent(error.message)
        );

    }
};

//approve single product return
exports.approveReturn = async(req,res,next)=>{

   try{

      await adminOrderService.approveReturn(
         req.params.orderId,
         req.params.productId
      );

      res.redirect("/admin/orders/"+req.params.orderId);

   }catch(err){

      next(err);

   }

};

// reject single product return

exports.rejectReturn = async(req,res,next)=>{

   try{

      await adminOrderService.rejectReturn(
         req.params.orderId,
         req.params.productId
      );

      res.redirect("/admin/orders/"+req.params.orderId);

   }catch(err){

      next(err);

   }

};

// APPROVE ALL RETURNS
exports.approveAllReturns = async (req, res, next) => {
  try {

    await adminOrderService.approveAllReturns(
      req.params.orderId
    );

    res.redirect("/admin/orders/" + req.params.orderId);

  } catch (err) {
    next(err);
  }
};


// REJECT ALL RETURNS
exports.rejectAllReturns = async (req, res, next) => {
  try {

    await adminOrderService.rejectAllReturns(
      req.params.orderId
    );

    res.redirect("/admin/orders/" + req.params.orderId);

  } catch (err) {
    next(err);
  }
};