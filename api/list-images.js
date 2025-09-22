// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    // Fetch all uploads in the "art" folder
    const result = await cloudinary.api.resources({
      type: "upload",     // standard upload type
      prefix: "art",       // exact folder path
      max_results: 100,
      direction: "desc",
      sort_by: [{ field: "created_at", direction: "desc" }],
    });

    // Map results to signed URLs so private/restricted images are accessible
    const images = result.resources.map(img => ({
      url: cloudinary.url(img.public_id, { sign_url: true }),
      public_id: img.public_id,
      format: img.format,
      folder: img.folder,
      tags: img.tags || [],
      type: img.type,
    }));

    res.status(200).json({
      message: "Art folder images fetched",
      total: images.length,
      images,
    });

  } catch (err) {
    console.error("Cloudinary fetch error:", err);
    res.status(500).json({ error: err.message });
  }
}
