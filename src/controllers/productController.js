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