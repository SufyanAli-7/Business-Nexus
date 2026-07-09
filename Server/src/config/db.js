import mongoose from "mongoose";
import config from "./config.js";

const connectDB = () => {
    mongoose.connect(`${config.MONGO_URI}/Nexus`)
        .then(() => {
            console.log("MongoDB connected successfully");
        }).catch((err) => {
            console.error("MongoDB connection error:", err);
            process.exit(1); // Exit process with failure
    });
}

export default connectDB;