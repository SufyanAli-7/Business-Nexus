import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import config from "../config/config.js";


cloudinary.config({ 
  cloud_name: config.CLOUDINARY_CLOUD_NAME, 
  api_key: config.CLOUDINARY_API_KEY, 
  api_secret: config.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath, options = {}) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            ...options
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.error("Cloudinary upload error details:", error);
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
            }
        } catch (unlinkErr) {
            console.error("Failed to delete temp file:", unlinkErr);
        }
        return null;
    }
}


export {uploadOnCloudinary}