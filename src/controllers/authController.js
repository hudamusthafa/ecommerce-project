const bcrypt = require("bcrypt");
const User = require("../models/User");


//-------------register------------

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
     const emailLower = email.toLowerCase();

    const userExists = await User.findOne({ email:emailLower});

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
    });

    return res.json({
  message: "User registered successfully",
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
  },
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//------------login----------------------



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
   

    // check user exists
     const emailLower = email.toLowerCase();

    const user = await User.findOne({ email:emailLower });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // check blocked user
    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // send response (without password)
    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


