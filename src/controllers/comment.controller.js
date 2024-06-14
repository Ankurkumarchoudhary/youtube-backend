import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "can not find video using video Id");
  }

  const findVideo = await Video.findById(videoId);

  if (!findVideo) {
    throw new ApiError(400, "can not get video");
  }

  const getAllComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likedBy",
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  if (!getAllComments) {
    throw new ApiError(400, "error while finding the comments");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, getAllComments, "comment found"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { commentData } = req.body;

  if (!videoId) {
    throw new ApiError(400, "can not find video using id");
  }

  if (!commentData) {
    throw new ApiError(400, "please add something first");
  }
  const findVideo = await Video.findById(videoId);

  if (!findVideo) {
    throw new ApiError(400, "can not find video");
  }

  const comment = await Comment.create({
    content: commentData,
    video: findVideo?._id,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(400, "there is a error while createing comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { commentData } = req.body;

  if (!commentId) {
    throw new ApiError(400, "can not find comment using comment id");
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(400, "there is no comment of yours");
    }
    const commentUpdate = await Comment.findByIdAndUpdate(
      { _id: commentId },
      {
        $set: {
          content: commentData,
        },
      },
      {
        new: true,
      }
    );
    if (!commentUpdate) {
      throw new ApiError(400, "error while updating the comment");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, commentUpdate, "comment updated successfully")
      );
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "can not find comment using commentId ");
  }
  try {
    const commentDelete = await Comment.findByIdAndDelete(commentId);
    if (!commentDelete) {
      throw new ApiError(400, "error while deleting the comment");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "comment is deleted successfully"));
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
