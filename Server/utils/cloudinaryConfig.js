import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "ChatMeetUp_Message_Files",
        allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "avi", "webm"],
        resource_type: "auto",
    },
});


const upload = multer({ storage });

export { cloudinary, upload };
