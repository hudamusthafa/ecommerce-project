const Product = require("../models/Product");


// GET ALL PRODUCTS
exports.getProducts = async (search, page, limit) => {

  const query = {};

  // SEARCH
  if (search) {
    query.name = {
      $regex: search,
      $options: "i"
    };
  }

  // PAGINATION
  const skip = (page - 1) * limit;

  // TOTAL COUNT
  const total = await Product.countDocuments(query);

  // PRODUCT DATA
  const products = await Product.find(query)
    .populate("category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    products,
    total,
    totalPages: Math.ceil(total / limit)
  };

};


// ADD PRODUCT
exports.addProduct = async (data) => {
  return await Product.create(data);
};


// GET PRODUCT BY ID
exports.getProductById = async (id) => {

  return await Product.findById(id)
    .populate("category");

};


// UPDATE PRODUCT
exports.updateProduct = async (id, data) => {

  return await Product.findByIdAndUpdate(
    id,
    data,
    { returnDocument: "after" }
  );

};


// SOFT DELETE PRODUCT
exports.softDeleteProduct = async (id) => {

  return await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { returnDocument: "after" }
  );

};