const productService=require("../services/productService");
const categoryService=require("../services/categoryService");
const sharp=require("sharp");
const fs=require("fs");
const path=require("path");

// PRODUCT LIST PAGE
exports.getProducts=async(req,res,next)=>{
  try{

    // SEARCH
    const search=req.query.search||"";

    // CATEGORY FILTER
    const category=req.query.category||"";

    // STOCK FILTER
    const stock=req.query.stock||"";

    // STATUS FILTER
    const status=req.query.status||"";

    // PAGINATION
    const page=parseInt(req.query.page)||1;
    const limit=5;

    // CATEGORIES
    const categories=await categoryService.getActiveCategories();

    // SERVICE
    const result=await productService.getProducts(
      search,
      category,
      stock,
      status,
      page,
      limit
    );

    // RENDER
    res.render("admin/products",{
      products:result.products,
      total:result.total,
      totalPages:result.totalPages,
      currentPage:page,
      search,
      category,
      stock,
      status,
      categories
    });

  }catch(error){
    error.statusCode=500;
    next(error);
  }
};

// GET ADD PRODUCT PAGE
exports.getAddProduct=async(req,res)=>{
  try{

    const categories=await categoryService.getActiveCategories();

    const error=req.session.error;

    req.session.error=null;

    res.render("admin/add-product",{
      categories,
      error
    });

  }catch(error){

    console.log(error);

    res.redirect("/admin/products");
  }
};

// ADD PRODUCT
exports.addProduct=async(req,res)=>{
  try{

    const {
      name,
      description,
      price,
      stock,
      category
    }=req.body;

 if(parseInt(stock) < 0){
      req.session.error = "Stock cannot be negative";
      return res.redirect("/admin/edit-product/" + req.params.id);
    }

    if(parseInt(price) < 0){
      req.session.error = "Price cannot be negative";
      return res.redirect("/admin/edit-product/" + req.params.id);
    }

    // VALIDATION
    if(!name || !description || !price || !stock || !category){

      req.session.error="All fields are required";

      return res.redirect("/admin/add-product");
    }

    const imageFiles=req.files||[];

    // MINIMUM 3 IMAGES
    if(imageFiles.length<3){

      req.session.error="Minimum 3 images required";

      return res.redirect("/admin/add-product");
    }

    // IMAGE ARRAY
    const images=[];

    for(const file of imageFiles){

      const filename=
        "product-"+
        Date.now()+
        path.extname(file.originalname);

      await sharp(file.path)
        .resize(500,500)
        .toFile(
          path.join(
            "public/images",
            filename
          )
        );

      images.push(filename);


try{

  fs.unlinkSync(file.path);

}catch(error){


}
    }

    // SAVE PRODUCT
    await productService.addProduct({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      images
    });

    res.redirect("/admin/products");

  }catch(error){

    console.log(error);

    res.redirect("/admin/products");
  }
};

// GET EDIT PRODUCT PAGE
exports.getEditProduct=async(req,res)=>{
  try{

    const product=await productService.getProductById(req.params.id);
    const categories=await categoryService.getActiveCategories();
    const error=req.session.error;
    req.session.error=null;

// Save page number in session
     req.session.returnPage = req.query.page || 1;

    res.render("admin/edit-product",{
      product,
      categories,
      error
    });

  }catch(error){

    console.log(error);

    res.redirect("/admin/products");
  }
};

// UPDATE PRODUCT
exports.updateProduct=async(req,res)=>{
  console.log("req.body =",req.body)
  try{

    const {name, description, price, stock, category} = req.body;


    if(parseInt(stock) < 0){
      req.session.error = "Stock cannot be negative";
      return res.redirect("/admin/edit-product/" + req.params.id);
    }
    if(parseInt(price) < 0){
      req.session.error = "Price cannot be negative";
      return res.redirect("/admin/edit-product/" + req.params.id);
    }

    // EMPTY VALIDATION
    if(!name || !description || !price || !stock || !category){

      req.session.error="All fields are required";

      return res.redirect(
        "/admin/edit-product/"+req.params.id
      );
    }

    // EXISTING PRODUCT
    const product=await productService.getProductById(req.params.id);

    // REMOVED IMAGES
    let removedImages=[];

    if(req.body.removedImages){

      removedImages=JSON.parse(req.body.removedImages);
    }

    // KEEP REMAINING OLD IMAGES
    let images=product.images.filter(
      image=>!removedImages.includes(image)
    );

    // NEW IMAGES
    if(req.files && req.files.length>0){

      for(const file of req.files){

        const filename=
          "product-"+
          Date.now()+
          path.extname(file.originalname);

        await sharp(file.path)
          .resize(500,500)
          .toFile(
            path.join(
              "public/images",
              filename
            )
          );

        images.push(filename);

    

try{

  fs.unlinkSync(file.path);

}catch(error){

}
      }
    }

    // MINIMUM IMAGE VALIDATION
    if(images.length<3){

      req.session.error="Minimum 3 images required";

      return res.redirect(
        "/admin/edit-product/"+req.params.id
      );
    }

    // UPDATE PRODUCT
    await productService.updateProduct(
      req.params.id,
      {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        images
      }
    );

    // Go back to the page admin came from
const returnPage = req.session.returnPage || 1;
req.session.returnPage = null;
res.redirect("/admin/products?page=" + returnPage);

  }catch(error){
    console.log(error);
    res.redirect("/admin/products");
  }
};

// DELETE PRODUCT
exports.deleteProduct=async(req,res)=>{
  try{

    await productService.toggleProductStatus(req.params.id);

    const page = req.query.page || 1;

    res.redirect("/admin/products?page=" + page);

  }catch(error){

    console.log(error);

    res.redirect("/admin/products");
  }
};