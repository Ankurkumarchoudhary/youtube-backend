import { Router } from "express";
import { addComment, deleteComment, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").post(addComment);
router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default router;
