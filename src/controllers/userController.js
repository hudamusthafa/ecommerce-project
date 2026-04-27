const userService = require("../services/userService");
const { changePasswordService } = require("../services/authService");

// ADD ADDRESS
exports.addAddress = async (req, res) => {
  try {
    await userService.addAddress(req.user._id, req.body);
    res.redirect("/checkout");   
  } catch (err) {
    res.send("Error adding address");
  }
};

// DELETE ADDRESS
exports.deleteAddress = async (req, res) => {
  try {
    await userService.deleteAddress(req.user._id, req.params.id);
    res.redirect("/checkout");   
  } catch (err) {
    res.send("Error deleting address");
  }
};

// UPDATE ADDRESS
exports.updateAddress = async (req, res) => {
  try {
    await userService.updateAddress(req.user._id, req.params.id, req.body);
    res.redirect("/checkout");   
  } catch (err) {
    res.send("Error updating address");
  }
};

// GET EDIT ADDRESS PAGE
exports.getEditAddress = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user._id);

    if (!user) {
      return res.send("User not found");
    }

    const address = user.address.id(req.params.id);

    if (!address) {
      return res.send("Address not found");
    }

    res.render("user/add-address", { address });

  } catch (err) {
    res.status(500).send("Error loading address");
  }
};

// PROFILE PAGE
exports.getProfile = (req, res) => {
  res.render("user/profile", { user: req.user,message:null });
};

// UPDATE PROFILE 
exports.updateProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender
    };

    if (req.file) {
      updates.profileImage = "/uploads/" + req.file.filename;
    }

    await userService.updateUser(req.user._id, updates);  // 
console.log(req.file);
    res.redirect("/profile");

  } catch (err) {
    console.log(err);
    res.send("Error updating profile");
  }
};

// CHANGE PASSWORD (improved)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.send("All fields required");
    }

    if (newPassword !== confirmPassword) {
      return res.send("Passwords do not match");
    }

    await changePasswordService(
      req.user._id,
      currentPassword,
      newPassword
    );

    res.redirect("/profile");

  } catch (err) {
    res.send(err.message);
  }
};

//set paswrd for googlesignin users
exports.setPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.render("user/profile", {
        user: req.user,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("user/profile", {
        user: req.user,
        message: "Passwords do not match"
      });
    }

    // prevent overwrite
    if (req.user.password) {
      return res.render("user/profile", {
        user: req.user,
        message: "Password already exists"
      });
    }

    await userService.setPassword(req.user._id, newPassword);

    res.render("user/profile", {
      user: { ...req.user, password: true }, // update UI immediately
      message: "Password set successfully"
    });

  } catch (err) {
    res.render("user/profile", {
      user: req.user,
      message: err.message
    });
  }
};
// CHECKOUT
exports.getCheckout = async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  res.render("user/checkout", { user });
};