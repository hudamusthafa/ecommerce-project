const categoryService=require("../services/categoryService");

// ================= CATEGORY LIST PAGE ==================


exports.getCategories=async(req,res,next)=>{
  try{

    // SEARCH
    const search=req.query.search||"";

    // PAGINATION
    const page=parseInt(req.query.page)||1;
    const limit=4;

    // SERVICE
    const result=await categoryService.getCategories(search,page,limit);

    // RENDER
    res.render("admin/categories",{
      categories:result.categories,
      total:result.total,
      totalPages:result.totalPages,
      currentPage:page,
      search
    });

  }catch(error){
    error.statusCode=500;
    next(error);
  }
};

// ================= ADD CATEGORY PAGE ===================

exports.getAddCategory=(req,res)=>{
  res.render("admin/add-category",{error:null});
};


// ===================== ADD CATEGORY ====================


exports.addCategory=async(req,res,next)=>{
  try{

    const {name,description, categoryOffer}=req.body;

    // EMPTY VALIDATION
    if(!name || name.trim()===""){
      return res.status(400).render("admin/add-category",{
        error:"Category name is required"
      });
    }

    // CHECK EXISTING CATEGORY
    const existingCategory=await categoryService.getCategoryByName(name);

    if(existingCategory){
      return res.status(400).render("admin/add-category",{
        error:"Category already exists"
      });
    }

//SAVE CATEGORY

    await categoryService.addCategory({
    name,
    description,
    categoryOffer: Number(categoryOffer) || 0
});

    res.redirect("/admin/categories");

  }catch(error){
    error.statusCode=500;
    next(error);
  }
};


// ================= EDIT CATEGORY PAGE ==================

exports.getEditCategory=async(req,res,next)=>{
  try{

    const category=await categoryService.getCategoryById(req.params.id);

    // CATEGORY NOT FOUND
    if(!category){
      const error=new Error("Category not found");
      error.statusCode=404;
      return next(error);
    }

    res.render("admin/edit-category",{
      category,
      error:null
    });

  }catch(error){
    error.statusCode=500;
    next(error);
  }
};

// ================= UPDATE CATEGORY =====================

exports.updateCategory=async(req,res,next)=>{
  try{

    const {name,description, categoryOffer}=req.body;

    // EMPTY VALIDATION
    if(!name || name.trim()===""){

      const category=await categoryService.getCategoryById(req.params.id);

      return res.status(400).render("admin/edit-category",{
        category,
        error:"Category name is required"
      });
    }

    // CHECK DUPLICATE CATEGORY
    const existingCategory=await categoryService.getCategoryByName(name);

    if(existingCategory && existingCategory._id.toString()!==req.params.id){

      const category=await categoryService.getCategoryById(req.params.id);

      return res.status(400).render("admin/edit-category",{
        category,
        error:"Category already exists"
      });
    }

    // UPDATE CATEGORY
    await categoryService.updateCategory(req.params.id,{
      name,
      description,
      categoryOffer:Number(categoryOffer)||0
    });

    res.redirect("/admin/categories");

  }catch(error){
    error.statusCode=500;
    next(error);
  }
};

// ================= DELETE CATEGORY =====================

exports.deleteCategory=async(req,res,next)=>{
  try{

    const category=await categoryService.getCategoryById(req.params.id);

    // CATEGORY NOT FOUND
    if(!category){
      const error=new Error("Category not found");
      error.statusCode=404;
      return next(error);
    }

    // SOFT DELETE
    await categoryService.toggleCategoryStatus(req.params.id);

    res.redirect("/admin/categories");

  }catch(error){
    error.statusCode=500;
    next(error);
  }
};