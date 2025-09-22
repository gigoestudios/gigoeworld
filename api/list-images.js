// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    // Fetch resources in the "art" folder
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "art/",   // make sure this matches exactly your folder in Cloudinary
      max_results: 100, 
      direction: "desc",
    });

    const images = result.resources.map(img => ({
      url: cloudinary.url(img.public_id, { sign_url: true }),
      tags: img.tags,
      folder: img.folder,
      public_id: img.public_id,
      format: img.format
    }));

    res.status(200).json({
      message: "Cloudinary connection verified",
      images
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    res.status(500).json({ error: "Failed to fetch images from Cloudinary", details: error.message });
  }
}
