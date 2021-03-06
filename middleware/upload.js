const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const dbName = 'my_database';
const uri =  process.env.DATABASE_URL || `mongodb+srv://duyquang:1234@cluster0.029na.mongodb.net/${dbName}?ssl=true` 

var storage = new GridFsStorage({
  //url: "mongodb://127.0.0.1/my_database",
  url :  uri,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}--${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}--${file.originalname}`
    };
  }
});

var uploadFile = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = uploadFilesMiddleware;