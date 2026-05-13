const Category = require("../models/Category");


// GET ALL CATEGORIES
exports.getCategories = async (search, page, limit) => {

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
  const total = await Category.countDocuments(query);

  // CATEGORY DATA
  const categories = await Category.find(query)

    // LATEST FIRST
    .sort({ createdAt: -1 })

    // PAGINATION
    .skip(skip)
    .limit(limit);

  return {

    categories,
    total,
    totalPages: Math.ceil(total / limit)

  };

};


// ADD CATEGORY
exports.addCategory = async (data) => {

  return await Category.create(data);

};


// GET CATEGORY BY ID
exports.getCategoryById = async (id) => {

  return await Category.findById(id);

};


// UPDATE CATEGORY
exports.updateCategory = async (id, data) => {

  return await Category.findByIdAndUpdate(

    id,
    data,
    { new: true }

  );

};


// SOFT DELETE CATEGORY
exports.softDeleteCategory = async (id) => {

  return await Category.findByIdAndUpdate(

    id,

    {
      isDeleted: true
    },

    {
      new: true
    }

  );

};