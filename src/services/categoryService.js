const Category = require("../models/Category");



exports.getCategories = async (search, page, limit) => {



  const query = {};

  // CHECK SEARCH VALUE EXISTS
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
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    categories,
    total,
    totalPages: Math.ceil(total / limit)
  };

};


exports.getActiveCategories = async () => {

  return await Category.find({ isListed: true });

};


exports.addCategory = async (data) => {
  return await Category.create(data);//save categoryOffer automatically.
};



exports.getCategoryById = async (id) => {
  return await Category.findById(id);
};



exports.getCategoryByName = async (name) => {

  return await Category.findOne({
    name: {
      $regex: new RegExp("^" + name + "$", "i")
    }
  });

};


exports.updateCategory = async (id, data) => {

  return await Category.findByIdAndUpdate(
    id,
    data,
    { returnDocument: "after" }
  );

};




//  CATEGORY STATUS (list/unlist)
exports.toggleCategoryStatus = async (id) => {
  const category = await Category.findById(id);
  
  if(!category){
    throw new Error("Category not found");
  }

  category.isListed = !category.isListed;
  await category.save();

  return category;
};