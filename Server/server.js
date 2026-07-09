import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";

// Connect to the database
connectDB();



const PORT = config.PORT;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;