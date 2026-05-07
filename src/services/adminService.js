const User = require("../models/User");
const bcrypt = require("bcryptjs");

// LOGIN
exports.adminLogin = async (email, password) => {

  const admin = await User.findOne({
    email: email.toLowerCase(),
    isAdmin: true
  });

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, admin.password);


  if (!isMatch) {
    throw new Error("Invalid credentials");
  }


  return admin;
};

// GET USERS
exports.getUsers = async ({ search, filter, page, limit }) => {
  let query = {
    isAdmin: { $ne: true },
    isDeleted: { $ne: true },
    name: { $regex: search, $options: "i" }
  };

  if (filter === "active") query.isBlocked = false;
  if (filter === "blocked") query.isBlocked = true;

  const totalUsers = await User.countDocuments(query);

  const users = await User.find(query)
    .sort({ updatedAt: -1  })
    .skip((page - 1) * limit)
    .limit(limit);

  return { users, totalUsers };
};

// BLOCK / UNBLOCK
exports.updateBlockStatus = async (userId, status) => {
  return await User.findByIdAndUpdate(userId, { isBlocked: status });
};

// ADD USER
exports.createUser = async ({ name, email, password, status }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  return await User.create({
    name,
    email,
    password: hashed,
   // phone,
    isBlocked: status === "blocked"
  });
};

// GET USER
exports.getUserById = async (id) => {
  return await User.findById(id);
};

// UPDATE USER
exports.updateUser = async (userId, data) => {
  let updateData = {
    name: data.name,
    email: data.email,
    //phone: data.phone,
    isBlocked: data.status === "blocked"
  };

  if (data.password && data.password.trim() !== "") {
    const hashed = await bcrypt.hash(data.password, 10);
    updateData.password = hashed;
  }

  return await User.findByIdAndUpdate(userId, updateData);
};

// DELETE USER
exports.deleteUser = async (userId) => {
  return await User.findByIdAndUpdate(userId, { isDeleted: true });
};