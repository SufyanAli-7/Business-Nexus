import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String, // PDF, Spreadsheet, Document, Image, etc.
        required: true
    },
    size: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ["pending", "signed", "approved"],
        default: "pending"
    },
    signatureUrl: {
        type: String
    },
    signatureSignedAt: {
        type: Date
    },
    shared: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
