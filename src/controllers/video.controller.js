import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { removeFromCloudinay, uploadOnCloudinay } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(404, "title and desc for video is required");
    }

    const videoLocalUrl = req.files?.video[0]?.path;
    const thumbnailLocalUrl = req.files?.thumbnail[0]?.path;

    if (!videoLocalUrl || !thumbnailLocalUrl) {
        throw new ApiError(400, "video and thumbnail is mandatory");
    }

    const uploadedVideo = await uploadOnCloudinay(videoLocalUrl);
    const uploadedThumbnail = await uploadOnCloudinay(thumbnailLocalUrl);

    if (!uploadedVideo || !uploadedThumbnail) {
        throw new ApiError(500, "something went wrong while uploading file");
    }

    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title,
        description: description,
        duration: uploadedVideo.duration,
        user: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "video id is required");
    }

    const video = await Video.findById(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "video id is required");
    }

    const { title, description } = req.body;

    const thumbnailLocalPath = req?.file?.path;

    const thumbnailUrl = await uploadOnCloudinay(thumbnailLocalPath);

    const uploadedThumbnailUrl =
        await Video.findById(videoId).select("thumbnail");

    await removeFromCloudinay(uploadedThumbnailUrl);

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnailUrl?.url,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "video details updated successfully")
        );
});

export { getVideoById, publishVideo, updateVideo };
