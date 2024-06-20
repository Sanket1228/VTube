import express from "express";

const app = express();

// import routes
import userRoutes from "./routes/user.routes.js";

app.use("/api/v1/users", userRoutes);

export { app };
