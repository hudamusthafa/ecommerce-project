const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    balance: {
      type: Number,
      default: 0
    },

    transactions: [
      {
        type: {
          type: String,
          enum: ["Credit", "Debit"],
          required: true
        },

        amount: {
          type: Number,
          required: true
        },

        description: {
          type: String,
          required: true
        },

        orderId: {
          type: String,
          default: ""
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Wallet ||
  mongoose.model("Wallet", walletSchema);