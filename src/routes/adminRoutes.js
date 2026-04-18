const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// GET login page
router.get("/login", adminController.getLogin);

// POST login
router.post("/login", adminController.postLogin);

// dashboard (temporary)
router.get("/dashboard", (req, res) => {
  res.send("Admin Dashboard");
});

module.exports = router;