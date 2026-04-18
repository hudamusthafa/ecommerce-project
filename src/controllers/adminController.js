exports.getLogin = (req, res) => {
  res.render("admin/login");
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  // TEMP LOGIN 
  if (email === "admin@gmail.com" && password === "1234") {
    return res.redirect("/admin/dashboard");
  }

  res.send("Invalid Admin Credentials");
};