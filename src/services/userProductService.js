const Product=require("../models/Product");

const Category=require("../models/Category");
const Wishlist = require("../models/Wishlist");



// PRODUCT LIST PAGE

exports.getProducts=async(query)=>{

  // SEARCH
  const search=query.search || "";

  // CATEGORY
  const category=query.category || "";

  // SORT
  const sort=query.sort || "";

  // PRICE FILTER
  const minPrice=query.minPrice || "";

  const maxPrice=query.maxPrice || "";

  // PAGINATION
  const page=parseInt(query.page) || 1;

  const limit= 4 ;

  const skip=(page-1)*limit;

  // FILTER OBJECT
  let filter={

    isListed:true,

    name:{
      $regex:search,
      $options:"i"
    }

  };

  // CATEGORY FILTER
  if(category){
    filter.category=category;
  }

  // PRICE FILTER
  if(minPrice && maxPrice){

    filter.price={

      $gte:Number(minPrice),

      $lte:Number(maxPrice)

    };

  }

  // SORT OPTION
  let sortOption={ createdAt:-1 };

  if(sort==="lowToHigh"){

    sortOption={ price:1 };

  }

  else if(sort==="highToLow"){

    sortOption={ price:-1 };

  }

  else if(sort==="aToZ"){

    sortOption={ name:1 };

  }

  else if(sort==="zToA"){

    sortOption={ name:-1 };

  }

  // PRODUCTS
  const products=await Product.find(filter)

  .populate("category")
  .sort(sortOption)
  .skip(skip)
  .limit(limit);

  const activeProducts = products.filter(product =>
  product.category &&
  !product.category.isDeleted
);

  // TOTAL PRODUCTS
  const totalProducts=await Product.countDocuments(filter);

  // TOTAL PAGES
  const totalPages=Math.ceil(totalProducts/limit);

  // CATEGORIES
  const categories=await Category.find({
    isDeleted:false

  });


 
  return{

    products: activeProducts,
    categories,
    search,
    category,
    sort,
    minPrice,
    maxPrice,
    currentPage:page,
    totalPages
  };

};

//==================================================

// PRODUCT DETAILS PAGE

exports.getProductDetails=async(productId,userId)=>{

  // FIND PRODUCT
  const product=await Product.findById(productId)
  .populate("category");

  // PRODUCT NOT FOUND
  if(!product || !product.isListed || !product.category || product.category.isDeleted){
    return null;
  }

  // RELATED PRODUCTS
  const relatedProducts=await Product.find({

    _id:{ $ne:productId },
    category:product.category._id,
    isListed:true
  })
  .limit(4);


  let isWishlisted = false;

if(userId){
  const wishlist = await Wishlist.findOne({
    user:userId
  });

  if(wishlist){
    isWishlisted = wishlist.products.some(
      item => item.toString() === productId.toString()
    );
  }
}

  return{
    product,
    relatedProducts,
    isWishlisted
  };
};