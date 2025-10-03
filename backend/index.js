import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import database from "./database/index.js";

// Routes import
import userRoutes from "./router/user.routes.js";
import adminRoutes from "./router/admin.routes.js"; 

dotenv.config();

const app = express();

// Ensure database connection is established
database; // Make sure this actually connects

// CORS setup
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend URL
    credentials: true,               // Allow cookies to be sent
  })
);
// app.use("./static", express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
