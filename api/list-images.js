// api/list-images.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  try {
    let allImages = [];
    let nextCursor = undefined;
    const folderPrefix = "art"; // your folder name

    do {
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: folderPrefix,
        max_results: 100,
        next_cursor: nextCursor,
        direction: "desc"
      });

      const images = result.resources.map(img => ({
        url: cloudinary.url(img.public_id, { sign_url: true }),
        public_id: img.public_id,
        format: img.format,
        tags: img.tags,
        folder: img.folder
      }));

      allImages = allImages.concat(images);
      nextCursor = result.next_cursor;

    } while (nextCursor);

    res.status(200).json({
      message: "Art folder images fetched",
      total: allImages.length,
      images: allImages
    });

  } catch (error) {
    console.error("Cloudinary fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch!! SORRY!",
      details: error.message
    });
  }
}
