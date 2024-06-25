import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinay = async (localFileUrl) => {
    try {
        if (!localFileUrl) return null;

        const response = await cloudinary.uploader.upload(localFileUrl, {
            resource_type: "auto",
        });

        fs.unlinkSync(localFileUrl);
        return response;
    } catch (error) {
        fs.unlinkSync(localFileUrl);
        return null;
    }
};

const removeFromCloudinay = async (uploadedUrl) => {
    try {
        if (!uploadedUrl) return null;

        const response = await cloudinary.uploader.destroy(uploadedUrl);
        return response;
    } catch (error) {
        return new ApiError(
            500,
            "something went wrong while deleting resource from server"
        );
    }
};

export { removeFromCloudinay, uploadOnCloudinay };
