exports.getProductOfferPrice = (product) => {

    const offer = product.productOffer || 0;

    const discount = (product.price * offer) / 100;

    const finalPrice = product.price - discount;

    return {

        originalPrice: product.price,

        offerPercentage: offer,

        discountAmount: discount,

        finalPrice: Math.round(finalPrice)

    };

};