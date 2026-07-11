import http from "http";
import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/services/socket.service.js";

// Connect to the database
connectDB();

const PORT = config.PORT;

const server = http.createServer(app);
initSocket(server);

if (process.env.NODE_ENV !== "production") {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;