import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "art/",
      max_results: 500,
    });

    const images = result.resources.map(img => ({
      url: img.secure_url,
      tags: img.tags,
      created_at: img.created_at
    }));

    images.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.status(200).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}
