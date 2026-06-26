const Product=require("../models/Product");

// ================= GET ALL PRODUCTS ====================

exports.getProducts=async(
  search,
  category,
  stock,
  status,
  page,
  limit
)=>{

  // FILTER OBJECT
  let query={};

  // SEARCH
  if(search && search.trim()!==""){
    query.name={
      $regex:search,
      $options:"i"
    };
  }

  // CATEGORY FILTER
  if(category && category!==""){
    query.category=category;
  }

  // STOCK FILTER
if(stock==="inStock"){
  query.stock = { $gt: 5 };
}

else if(stock==="lowStock"){
  query.stock = {$gt: 0,$lte: 5};
}

else if(stock==="outOfStock"){
  query.stock = 0;
}


  // STATUS FILTER
  if(status==="listed"){
    query.isListed=true;
  }

  else if(status==="unlisted"){
    query.isListed=false;
  }

  // PAGINATION
  const skip=(page-1)*limit;

  // TOTAL PRODUCTS
  const total=await Product.countDocuments(query);

  // PRODUCTS
  const products=await Product.find(query)
    .populate("category")
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit);

  return{
    products,
    total,
    totalPages:Math.ceil(total/limit)
  };
};

// ================= ADD PRODUCT ====================

exports.addProduct=async(data)=>{
  return await Product.create(data);
};

// ================= GET PRODUCT BY ID ====================

exports.getProductById=async(id)=>{
  return await Product.findById(id)
    .populate("category");
};

// ================= UPDATE PRODUCT ====================

// exports.updateProduct=async(id,data)=>{
//   return await Product.findByIdAndUpdate(
//     id,
//     data,
//     {returnDocument:"after"}
//   );
// };

exports.updateProduct=async(id,data)=>{

  const updatedProduct = await Product.findOneAndUpdate(
  { _id: id },
  data,
  { returnDocument: 'after' } 
)
  return updatedProduct;
};

// ================= SOFT DELETE PRODUCT ====================

exports.toggleProductStatus = async(id)=>{

  const product = await Product.findById(id);

   

  if(!product){
    throw new Error("Product not found");
  }

  product.isListed = !product.isListed;

  await product.save();

  return product;
};