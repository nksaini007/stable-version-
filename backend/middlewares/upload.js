const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create folders if not exist
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderName = "";

    if (file.fieldname === "categoryImage") folderName = "service-categories/";
    if (file.fieldname === "subcategoryImage") folderName = "service-subcategories/";
    if (file.fieldname === "images") folderName = "plans/";

    const folderPath = path.join(__dirname, "..", "uploads", folderName);
    createFolder(folderPath);
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images and PDF documents only
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDFs are allowed!"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

module.exports = upload;
