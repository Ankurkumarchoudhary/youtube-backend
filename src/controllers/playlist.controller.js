import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name && description)) {
    throw new ApiError(400, " name and description are required");
  }
  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user?._id,
    videos: [],
  });

  const createdPlaylist = await Playlist.findById(playlist?._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "can not find video using id");
  }
  const userExist = await User.findById(userId);
  if (!userExist) {
    throw new ApiError(400, "user does not exist");
  }
  const userAllPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        videos: {
          $cond: {
            if: ["$owner", new mongoose.Types.ObjectId(req.user?._id)],
            then: "$videos",
            else: {
              $filter: {
                input: "$videos",
                as: "arrayOfVideos",
                cond: {
                  $gt: ["$arrayOfVideos.isPublished", true]
                }
              }
            }
          }
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if(!userAllPlaylist){
    throw new ApiError(400,"user doesnot have playlist")
   }

   return res.status(200).json(
    new ApiResponse(
        200,
        userAllPlaylist,
        "user all playlists"
    )
   )
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "playlist is not there");
  }
  const playlistGetById = await Playlist.findById(playlistId);
  if (!playlistGetById) {
    throw new ApiError(400, "playlist can not get by id");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistGetById, "playlist fetched successfully ")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "can not get playlist id");
  }
  if (!videoId) {
    throw new ApiError(400, " can not find video id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "can not find playlist");
  }

  const findVideo = await Video.findById(videoId);

  if (!findVideo) {
    throw new ApiError(400, "can not find video");
  }
  const videoAlreadyHave = await playlist.videos.includes(videoId);
  if (videoAlreadyHave) {
    return res
      .status(200)
      .json(new ApiResponse(200, " video already exist in playlist"));
  }
  const video = await playlist.videos.push(findVideo);
  playlist.save();

  return res.status(200).json(new ApiResponse(200, `video added: ${video}`));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "can not get playlist id");
  }
  if (!videoId) {
    throw new ApiError(400, " can not find video id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "can not find playlist");
  }

  const findVideo = await Video.findById(videoId);

  if (!findVideo) {
    throw new ApiError(400, "can not find video");
  }
  const removedVideo = playlist.videos.remove(findVideo);
  playlist.save();
  return res
    .status(200)
    .json(new ApiResponse(200, removedVideo, "video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "playlist can not get by id");
  }

  const playlistDelete = await Playlist.findByIdAndDelete({
    _id: playlistId,
  });

  if (!playlistDelete) {
    throw new ApiError(400, "unable to delete playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "playlist can not get by id");
  }
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "can not find playlist");
  }
  if (!(name && description)) {
    throw new ApiError(400, "name and description are required");
  }

  if (playlist.name === name || playlist.description === description) {
    throw new ApiError(400, "name or description should not be same as before");
  }

  const playlistUpdate = await Playlist.findByIdAndUpdate(
    { _id: playlistId },
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistUpdate, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
