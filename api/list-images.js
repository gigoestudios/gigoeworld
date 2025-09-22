// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    let images = [];
    let nextCursor = undefined;
    const folderPrefix = "art"; // your folder name in Cloudinary

    do {
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: folderPrefix,
        max_results: 100,
        next_cursor: nextCursor,
        direction: "desc",
        sort_by: [{ field: "created_at", direction: "desc" }],
      });

      // Map each resource to include signed URL
      const mapped = result.resources.map(img => ({
        url: cloudinary.url(img.public_id, { sign_url: true }),
        public_id: img.public_id,
        format: img.format,
        tags: img.tags,
        folder: img.folder,
      }));

      images = images.concat(mapped);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    res.status(200).json({
      message: "Art folder images fetched",
      total: images.length,
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
