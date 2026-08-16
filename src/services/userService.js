const User = require("../models/User");
const bcrypt = require("bcrypt");


exports.getUserById = async (userId) => {
  return await User.findById(userId);
};


exports.addAddress = async (userId, addressData) => {
  const user =await User.findById(userId);

  user.address.push(addressData);
  await user.save();

  return user;
};


exports.deleteAddress = async (userId, addressId) => {
  const user =await User.findById(userId);

  user.address = user.address.filter(
    addr => addr._id.toString() !== addressId
  );

  await user.save();
};


exports.updateAddress = async(userId, addressId, data) => {
  const user = await User.findById(userId);

  const address = user.address.id(addressId);

  if (address) {
    Object.assign(address, data);
  }

  await user.save();
};


// UPDATE USER PROFILE
exports.updateUser = async (userId, updates) => {
  return await User.findByIdAndUpdate(userId, updates,{ returnDocument: "after" });
};



exports.setPassword = async (userId, newPassword) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  if (user.provider !== "google") {
    throw new Error("Password already exists");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;
  await user.save();

  return user;
};