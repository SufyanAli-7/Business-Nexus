import multer from "multer";
import os from "os";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, os.tmpdir())
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})