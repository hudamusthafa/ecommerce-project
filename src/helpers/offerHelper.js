exports.getProductOfferPrice = (product) => {

    const productOffer = product.productOffer || 0;

    const categoryOffer = product.category?.categoryOffer || 0;

    // Apply the higher offer
    const offer = Math.max(productOffer, categoryOffer);

    const discount = (product.price * offer) / 100;

    const finalPrice = product.price - discount;

    return {

        originalPrice: product.price,

        offerPercentage: offer,

        discountAmount: Math.round(discount),

        finalPrice: Math.round(finalPrice)

    };

};