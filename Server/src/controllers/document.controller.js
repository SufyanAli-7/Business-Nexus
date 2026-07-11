import Document from "../models/document.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const extension = req.file.originalname.split('.').pop().toLowerCase();
        let options = { resource_type: "auto" };
        
        // PDFs and documents should be uploaded as 'raw' to prevent Cloudinary restriction errors (mixed content, 401 unauthorized cover addon extraction blocks)
        if (["pdf", "xlsx", "xls", "csv", "doc", "docx"].includes(extension)) {
            options = { resource_type: "raw" };
        }

        const localPath = req.file.path;
        const uploadResult = await uploadOnCloudinary(localPath, options);

        if (!uploadResult) {
            return res.status(500).json({ success: false, message: "Failed to upload file to Cloudinary" });
        }

        let type = "Document";
        if (extension === "pdf") {
            type = "PDF";
        } else if (["xls", "xlsx", "csv"].includes(extension)) {
            type = "Spreadsheet";
        } else if (["png", "jpg", "jpeg", "webp"].includes(extension)) {
            type = "Image";
        } else if (["doc", "docx"].includes(extension)) {
            type = "Document";
        }

        const sizeInMb = (req.file.size / (1024 * 1024)).toFixed(1) + " MB";

        const document = new Document({
            name: req.file.originalname,
            url: uploadResult.secure_url || uploadResult.url,
            type,
            size: sizeInMb,
            uploadedBy: req.id,
            status: "pending",
            version: 1
        });

        await document.save();

        return res.status(201).json({ success: true, document });
    } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const userId = req.id;
        const documents = await Document.find({
            $or: [{ uploadedBy: userId }, { shared: true }]
        }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, documents });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const signDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { signatureData } = req.body;

        if (!signatureData) {
            return res.status(400).json({ success: false, message: "Signature image is required" });
        }

        const uploadResult = await cloudinary.uploader.upload(signatureData, {
            resource_type: "image",
            folder: "nexus_signatures"
        });

        const signatureUrl = uploadResult.secure_url || uploadResult.url;

        const document = await Document.findOneAndUpdate(
            { _id: id, uploadedBy: req.id },
            {
                $set: {
                    signatureUrl,
                    signatureSignedAt: new Date(),
                    status: "signed"
                }
            },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found or access denied" });
        }

        return res.status(200).json({ success: true, document });
    } catch (error) {
        console.error("Error signing document:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const shareDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        const document = await Document.findOne({ _id: id, uploadedBy: req.id });
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found or access denied" });
        }

        document.shared = !document.shared;
        await document.save();

        return res.status(200).json({ success: true, document });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findOneAndDelete({ _id: id, uploadedBy: req.id });
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found or access denied" });
        }

        return res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
