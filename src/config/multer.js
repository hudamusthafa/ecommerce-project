const multer = require("multer");
const path = require("path");

// STORAGE
const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, "public/temp");

  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );

  }

});

// FILE FILTER
const fileFilter = (req, file, cb) => {

  const allowedTypes =
    /jpg|jpeg|png|webp/;

  const extname =
    allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

  const mimetype =
    allowedTypes.test(file.mimetype);

  if (extname && mimetype) {

    return cb(null, true);

  } else {

    cb(new Error("Only images are allowed"));

  }

};

// MULTER
const upload = multer({

  storage,
  fileFilter

});

module.exports = upload;