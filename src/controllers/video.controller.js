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
        owner: req.user._id,
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

    if (!video) {
        throw new ApiError(404, "video not found");
    }

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

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "video details updated successfully")
        );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "video id is required");
    }

    const uploadedThumbnailUrl =
        await Video.findById(videoId).select("thumbnail");

    const uploadedVideoUrl = await Video.findById(videoId).select("videoFile");

    await removeFromCloudinay(uploadedThumbnailUrl);
    await removeFromCloudinay(uploadedVideoUrl);

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "video id is required");
    }

    const { isPublished } = req.body;

    if (!isPublished) {
        throw new ApiError(404, "value of isPublished is required");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished,
            },
        },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "published status updated successfully")
        );
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { pg = 1, pgsz = 10 } = req.query;

    const skip = (pg - 1) * pgsz;

    const videos = await Video.aggregate([
        {
            $skip: skip,
        },
        {
            $limit: pgsz,
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                "ownerDetails.fullName": 1,
            },
        },
    ]);

    if (!videos) {
        throw new ApiResponse(404, "videos not found");
    }

    const count = await Video.countDocuments();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                currentPage: pg,
                pageSize: pgsz,
                total: Math.ceil(count / pgsz),
                videos,
            },
            "videos fetched successfully"
        )
    );
});

export {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishVideo,
    togglePublishStatus,
    updateVideo,
};
