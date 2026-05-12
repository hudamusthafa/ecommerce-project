const Category = require("../models/Category");

// GET ALL (search + pagination + sorting)
exports.getCategories = async ({ search = "", page = 1, limit = 5 }) => {

  const query = {
    isDeleted: false,
    name: { $regex: search, $options: "i" }
  };

  const skip = (page - 1) * limit;

  const categories = await Category.find(query)
    .sort({ createdAt: -1 }) // latest first
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments(query);

  return {
    categories,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

// ADD CATEGORY
exports.addCategory = async (data) => {
  return await Category.create(data);
};

// GET BY ID
exports.getCategoryById = async (id) => {
  return await Category.findById(id);
};

// UPDATE CATEGORY
exports.updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data);
};

// SOFT DELETE
exports.deleteCategory = async (id) => {
  return await Category.findByIdAndUpdate(id, { isDeleted: true });
};