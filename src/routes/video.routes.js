import { Router } from "express";
import {
    getVideoById,
    publishVideo,
    updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload-video").post(
    verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishVideo
);

router.route("/:videoId").get(verifyJWT, getVideoById);
router
    .route("/update/:videoId")
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

export default router;
