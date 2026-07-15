const Wallet = require("../models/Wallet");

// Get Wallet

exports.getWallet = async (userId) => {

  

    let wallet = await Wallet.findOne({
        user: userId
    });

    // Create wallet if it doesn't exist
    if (!wallet) {

        wallet = new Wallet({
            user: userId
        });

        await wallet.save();
    }

    return wallet;
};


// Credit Wallet

exports.creditWallet = async (
    userId,
    amount,
    description,
    orderId = ""
) => {

  //debug
   console.log("creditWallet called");

    let wallet = await Wallet.findOne({
        user: userId
    });

    if (!wallet) {

        wallet = new Wallet({
            user: userId
        });

    }

    wallet.balance += amount;

    wallet.transactions.unshift({

        type: "Credit",

        amount,

        description,

        orderId

    });

    await wallet.save();

    return wallet;

};



//// ================== Debit Wallet====================


exports.debitWallet = async (
    userId,
    amount,
    description,
    orderId = ""
) => {

    const wallet = await Wallet.findOne({
        user: userId
    });

    if (!wallet) {

        throw new Error("Wallet not found.");

    }

    if (wallet.balance < amount) {

        throw new Error("Insufficient wallet balance.");

    }

    wallet.balance -= amount;

    wallet.transactions.unshift({

        type: "Debit",

        amount,

        description,

        orderId

    });

    await wallet.save();

    return wallet;

};