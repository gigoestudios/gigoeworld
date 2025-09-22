// api/test-cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    // Fetch first 100 upload-type resources without prefix (all folders)
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 100
    });

    // Also fetch folders for reference
    const folders = await cloudinary.api.sub_folders("");

    res.status(200).json({
      message: "Test fetch from Cloudinary",
      total_images: result.resources.length,
      images: result.resources.map(img => ({
        public_id: img.public_id,
        folder: img.folder,
        format: img.format,
        type: img.type,
        tags: img.tags
      })),
      folders
    });
  } catch (error) {
    console.error("Cloudinary test fetch error:", error);
    res.status(500).json({ error: error.message });
  }
}
