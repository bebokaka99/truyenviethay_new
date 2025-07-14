const express = require("express");
const methodOverride = require("method-override");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const db = require("./config/db");
const path = require("path");

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");

const logger = require("./ultils/logger");
const errorMiddleware = require("./middleware/errorHandler");

// Security middlewares
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Content-Length",
            "X-Requested-With",
        ],
        credentials: true,
        optionsSuccessStatus: 200,
    })
);
app.use(helmet());
app.use(compression());
app.use(xssClean());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.options("*", cors());
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));
console.log("🧭 Static path:", path.join(__dirname, "public"));

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(
    "/uploads_img",
    (req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        next();
    },
    express.static(path.join(__dirname, "public/uploads_img"))
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});

// Cập nhật các dòng require để sử dụng .routes.js
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/truyen", require("./routes/story.routes"));
app.use("/api/chuong", require("./routes/chapter.routes"));
app.use("/api/upload-truyen", require("./routes/up_story.routes"));
app.use("/api/upload-files", require("./routes/file.routes"));
app.use("/api/theloai", require("./routes/category.routes"));
app.use("/api/history", require("./routes/history.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use("/api/follow", require("./routes/follow.routes"));
app.use("/api/like", require("./routes/like.routes"));

// THAY ĐỔI DÒNG NÀY
app.use("/api/user", require("./routes/profile.routes"));
app.use("/api/admin/users", require("./routes/user.routes")); 

// user level
app.use("/api/levels", require("./routes/userLevel.routes"));
app.use("/api/levels/history", require("./routes/levelHistory.routes"));
app.use("/api/points", require("./routes/points.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/rewards", require("./routes/reward.routes"));
app.use("/api/user-rewards", require("./routes/userReward.routes"));
app.use("/api/ratings", require("./routes/rating.routes"));

// ========== Routes ==========
app.get("/", (req, res) => {
    res.send("Backend is working!");
});

app.use((req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: "Tuyến đường không tồn tại" });
});

app.use(errorMiddleware);

app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
});