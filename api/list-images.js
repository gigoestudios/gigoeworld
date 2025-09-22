// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.api.resources_by_tag("art", {
      type: "upload",
      max_results: 100,
      direction: "desc",
      sort_by: [{ field: "created_at", direction: "desc" }],
    });

    const images = result.resources.map(img => ({
      url: cloudinary.url(img.public_id, { sign_url: true }),
      tags: (img.tags || []).filter(t => t !== "art"), // default to [] if undefined
      public_id: img.public_id,
      format: img.format
    }));

    res.status(200).json({
      message: "Art images fetched by tag",
      total: images.length,
      images
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    res.status(500).json({
      error: "Failed to fetch images from Cloudinary",
      details: error.message
    });
  }
}
