import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
    return res.send("server is up");
});

// import routes
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/video", videoRoutes);

export { app };
