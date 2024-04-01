import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "Title and Description should be there");
  }

  const videoUrl = req.files?.videoFile[0]?.path;
  const thumbnailUrl = req.files?.thumbnail[0]?.path;

  if (!videoUrl) {
    throw new ApiError(400, "video path is required");
  }

  if (!thumbnailUrl) {
    throw new ApiError(400, "Thumbnail path is required");
  }

  const video = await uploadCloudinary(videoUrl);
  const thumbnail = await uploadCloudinary(thumbnailUrl);

  const videoData = await Video.create({
    videoFile: video?.url,
    thumbnail: thumbnail?.url,
    title: title,
    description: description,
    duration: video.duration,
    views: 0,
    isPublished: false,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video is published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userVideo = await Video.findById(videoId);

  if (
    !userVideo ||
    (!userVideo.isPublished && !userVideo.owner === req.user._id)
  ) {
    throw new ApiError(400, "video does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userVideo, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const oldVideo = await Video.findById(videoId);

  if (
    !oldVideo ||
    (!oldVideo.isPublished && !oldVideo.owner === req.user._id)
  ) {
    throw new ApiError(400, "video does not exist");
  }

  const { title, description } = req.body;
  const thumbnail = req.file?.path;
  if (!(title && description)) {
    throw new ApiError(400, " title and discription required for updation");
  }

  if (!thumbnail) {
    throw new ApiError(400, "for update thumbnail is required");
  }

  const updatedTumbnail = await uploadCloudinary(thumbnail);

  const newVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: updatedTumbnail?.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const deleteVideo = await Video.findById(videoId);

  if (
    !deleteVideo ||
    (!deleteVideo.isPublished && !deleteVideo.owner === req.user._id)
  ) {
    throw new ApiError(400, "video does not exist");
  }

  await Video.findByIdAndDelete(videoId);

  return res.status(200).json(new ApiResponse(200, "deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "id not accessable");
  }

  const videoExisted = await Video.findById(videoId);
  if (!videoExisted) {
    throw new ApiError(400, "Video doesnot existed");
  }

  if (!videoExisted.owner == req.user?._id) {
    throw new ApiError(400, "Not allowed to toggle");
  }

  videoExisted.isPublished = !Video.isPublished;
  await videoExisted.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoExisted.isPublished, "toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
