// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    // Just fetch all uploads (no prefix yet) to verify the connection
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 10,  // small number for testing
      direction: "desc",
      sort_by: [{ field: "created_at", direction: "desc" }],
    });

    // Return some debug info
    const images = result.resources.map(img => ({
      url: img.secure_url,
      tags: img.tags,
      folder: img.folder,
      public_id: img.public_id,
      format: img.format
    }));

    res.status(200).json({
      message: "Cloudinary connection verified",
      total: result.total_count,
      images
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    res.status(500).json({ error: "Failed to fetch images from Cloudinary", details: error.message });
  }
}
