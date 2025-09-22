// api/list-folders.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.api.sub_folders("/", { max_results: 100 });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
