// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    // Fetch all uploaded images in the 'art' folder
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "art/",      // Folder name in Cloudinary
      max_results: 100,    // Adjust if you have more than 100 images
      direction: "desc",   // Newest first
      sort_by: [{ field: "created_at", direction: "desc" }],
    });

    // Map images to include URLs and tags
    const images = result.resources.map(img => ({
      url: img.secure_url,
      tags: img.tags || [],
      public_id: img.public_id
    }));

    res.status(200).json({ images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch images from Cloudinary" });
  }
}
