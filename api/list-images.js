import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "art",
      max_results: 100,
      direction: "desc"
    });

    const images = result.resources.map(img => ({
      url: cloudinary.url(img.public_id, { sign_url: true }),
      public_id: img.public_id,
      format: img.format
    }));

    res.status(200).json({
      message: "Art folder images fetched",
      total: images.length,
      images
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
