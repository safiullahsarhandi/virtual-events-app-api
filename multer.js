const multer = require("fastify-multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes("image") || file.mimetype.includes("audio")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = { storage, fileFilter };
