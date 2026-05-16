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

    const categories =
      await categoryService.getActiveCategories();

    const error =
      req.session.error;

    req.session.error = null;

    res.render("admin/add-product", {
      categories,
      error
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
    if(
      !name ||
      !description ||
      !price ||
      !stock ||
      !category
    ){

      req.session.error =
        "All fields are required";

      return res.redirect(
        "/admin/add-product"
      );

    }

    const imageFiles =
      req.files || [];

    // MINIMUM 3 IMAGES
    if(imageFiles.length < 3){

      req.session.error =
        "Minimum 3 images required";

      return res.redirect(
        "/admin/add-product"
      );

    }

    // IMAGE ARRAY
    const images =
      imageFiles.map(function(file){

        return file.filename;

      });

    // SAVE PRODUCT
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

    const product =
      await productService.getProductById(
        req.params.id
      );

    const categories =
      await categoryService.getActiveCategories();

    const error =
      req.session.error;

    req.session.error = null;

    res.render("admin/edit-product", {

      product,
      categories,
      error

    });

  } catch (error) {

    console.log(error);

    res.redirect("/admin/products");

  }

};


// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {

  try {

    const {
      name,
      description,
      price,
      stock,
      category
    } = req.body;

    // EMPTY VALIDATION
    if(
      !name ||
      !description ||
      !price ||
      !stock ||
      !category
    ){

      req.session.error =
        "All fields are required";

      return res.redirect(
        "/admin/edit-product/" +
        req.params.id
      );

    }

    const product =
      await productService.getProductById(
        req.params.id
      );

    let images =
      product.images;

    // NEW IMAGES
    if(
      req.files &&
      req.files.length > 0
    ){

      // MINIMUM 3 IMAGES
      if(req.files.length < 3){

        req.session.error =
          "Upload minimum 3 images";

        return res.redirect(
          "/admin/edit-product/" +
          req.params.id
        );

      }

      images =
        req.files.map(function(file){

          return file.filename;

        });

    }

    // UPDATE PRODUCT
    await productService.updateProduct(
      req.params.id,
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

    await productService.softDeleteProduct(
      req.params.id
    );

    res.redirect("/admin/products");

  } catch (error) {

    console.log(error);

    res.redirect("/admin/products");

  }

};