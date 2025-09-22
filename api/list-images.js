// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // CORS for Fourthwall

  try {
    // Step 1: get all images with tag "art"
    const taggedResult = await cloudinary.api.resources_by_tag("art", {
      type: "upload",
      max_results: 100,
      direction: "desc",
    });

    // Step 2: fetch full resource info for each image to get its tags
    const images = await Promise.all(taggedResult.resources.map(async img => {
      const fullInfo = await cloudinary.api.resource(img.public_id, { type: "upload" });
      return {
        url: cloudinary.url(fullInfo.public_id, { sign_url: true }),
        public_id: fullInfo.public_id,
        format: fullInfo.format,
        tags: fullInfo.tags || []
      };
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
