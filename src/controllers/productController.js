const productService = require("../services/productService");
const categoryService = require("../services/categoryService");


// PRODUCT LIST PAGE
exports.getProducts = async (req, res) => {

  try {

    // SEARCH
    const search = req.query.search || "";

    // PAGINATION
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    // SERVICE
    const result = await productService.getProducts(
      search,
      page,
      limit
    );

    // RENDER
    res.render("admin/products", {
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: page,
      search
    });

  } catch (error) {

    console.log(error);
    res.redirect("/admin/dashboard");

  }

};


// GET ADD PRODUCT PAGE
exports.getAddProduct = async (req, res) => {

  try {

    const categories = await categoryService.getActiveCategories();
    res.render("admin/add-product", {
      categories: categories,
      error: null
    });

  } catch (error) {

    console.log(error);
    res.redirect("/admin/products");

  }

};


// ADD PRODUCT
exports.addProduct = async (req, res) => {

  try {

    const {
      name,
      description,
      price,
      stock,
      category
    } = req.body;

    // VALIDATION
    if (
      !name ||
      !price ||
      !stock ||
      !category
    ) {

      const categories = await categoryService.getActiveCategories();

      return res.render("admin/add-product", {
        categories: categories,
        error: "All fields are required"
      });

    }
    const imageFiles = req.files || [];

      const images = imageFiles.map(
        file => file.filename
      );

    // SAVE
    await productService.addProduct({
      name,
      description,
      price,
      stock,
      category,
      images
    });

    res.redirect("/admin/products");

  } catch (error) {

    console.log(error);
    res.redirect("/admin/products");

  }

};




// GET EDIT PRODUCT PAGE
exports.getEditProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    const categories = await categoryService.getActiveCategories();

    res.render("admin/edit-product", {
      product,
      categories,
      error: null
    });

  } catch (error) {
    console.log(error);
    res.redirect("/admin/products");
  }
};


// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {

  try {
    const {name,description,price,stock,category} = req.body;
    const product = await productService.getProductById(req.params.id);
    let images = product.images;

    // NEW IMAGES
    if(req.files && req.files.length > 0){
      images = req.files.map(function(file){
        return file.filename;
      });
    }
    // UPDATE PRODUCT
    await productService.updateProduct(req.params.id,
      {
        name,
        description,
        price,
        stock,
        category,
        images
      }
    );
    res.redirect("/admin/products");

  } catch (error) {
    console.log(error);
    res.redirect("/admin/products");
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {

  try {
    await productService.softDeleteProduct(req.params.id);
    res.redirect("/admin/products");

  } catch (error) {
    console.log(error);
    res.redirect("/admin/products");
  }
};