import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video} from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    if (!videoId) {
      throw new ApiError(400, " can not find video using id");
    }

    const findVideo = await Video.findById(videoId);
    if (!findVideo) {
      throw new ApiError(400, "can not find video");
    }
    const userAlreadyLiked = await Like.find({
      video: videoId,
      likedBy: req.user?._id,
    });
    if (userAlreadyLiked && userAlreadyLiked.length > 0) {
      await Like.findByIdAndDelete(userAlreadyLiked, { new: true });
      return res
        .status(200)
        .json(new ApiResponse(200, "video unliked successfully"));
    }
    const videoLike = await Like.create({
      likedBy: req.user?._id,
      video: videoId,
    });
    if (!videoLike) {
      throw new ApiError(400, " error while liking the video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videoLike, "video liked successfully"));
  } catch (error) {
    throw new ApiError(400, "error");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  try {
    if (!commentId) {
      throw new ApiError(400, " can not find comment using id");
    }

    const findComment = await Comment.findById(commentId);
    if (!findComment) {
      throw new ApiError(400, "can not find comment");
    }
    const userAlreadyLiked = await Like.find({
      comment: commentId,
      likedBy: req.user?._id,
    });
    if (userAlreadyLiked && userAlreadyLiked.length > 0) {
      await Like.findByIdAndDelete(userAlreadyLiked, { new: true });
      return res
        .status(200)
        .json(new ApiResponse(200, "comment unliked successfully"));
    }
    const commentLike = await Like.create({
      likedBy: req.user?._id,
      comment: commentId,
    });
    if (!commentLike) {
      throw new ApiError(400, " error while liking the comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200,commentLike, "comment liked successfully"));
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});



const getLikedVideos = asyncHandler(async (req, res) => {
  
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
