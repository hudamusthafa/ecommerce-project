const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;