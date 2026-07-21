const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
   
    gender: {
      type: String
    },
     profileImage: {
      type: String,
      default: "/images/default-avatar.png",
    },
     isAdmin: {
    type: Boolean,
    default: false
  },
    
    provider: {
      type: String,
      default: "local" // or "google"
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
    ],
     isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
  type: Boolean,
  default: false
},


referralCode: {
    type: String,
    unique: true,
    sparse: true
},

referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
},
  },
 
  { timestamps: true },
  
);

module.exports = mongoose.model("User", userSchema);