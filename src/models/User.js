const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    phone: {
    type: String
    },
    gender: {
      type: String
    },
     profileImage: {
      type: String,
      default: "/images/default-avatar.png",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
     address: [
      {
        fullName: String,
        phone: String,
        pincode: String,
        city: String,
        state: String,
        house: String,
        area: String,
      }
    ]

  },
  { timestamps: true },
  
);

module.exports = mongoose.model("User", userSchema);