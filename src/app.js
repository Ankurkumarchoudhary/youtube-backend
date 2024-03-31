import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import router from "./routes/user.router.js";
import videoRouter from "./routes/video.router.js";
import playlistRouter from "./routes/playlist.router.js";
import commentRouter from "./routes/comment.router.js";
import likeRouter from "./routes/like.router.js";

app.use("/api/v1/users", router);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeRouter);
export { app };
