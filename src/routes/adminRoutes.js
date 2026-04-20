const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// GET login page
router.get("/login", adminController.getLogin);

// POST login
router.post("/login", adminController.postLogin);

// dashboard 
router.get("/dashboard", adminController.getDashboard);

module.exports = router;