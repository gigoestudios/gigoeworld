// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",   // only uploaded images/videos
      max_results: 20,  // just the first 20 for testing
      direction: "desc",
      sort_by: [{ field: "created_at", direction: "desc" }],
    });

    // map basic info to see what's coming back
    const images = result.resources.map(img => ({
      url: cloudinary.url(img.public_id, { sign_url: true }),
      public_id: img.public_id,
      folder: img.folder,
      format: img.format,
      type: img.type,       // should be "upload"
      tags: img.tags,
    }));

    console.log("Fetched images:", images);

    res.status(200).json({
      message: "Test fetch from Cloudinary",
      total: result.total_count,
      images,
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    res.status(500).json({
      error: "Failed to fetch images from Cloudinary",
      details: error.message,
    });
  }
}
