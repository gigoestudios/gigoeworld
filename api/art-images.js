import fs from "fs";
import path from "path";

const CACHE_FILE = path.join("/tmp", "art-list-images.json"); // specific to "art"
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export default async function handler(req, res) {
  try {
    // 1. Check cache
    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE);
      const age = Date.now() - stats.mtimeMs;

      if (age < CACHE_TTL) {
        const cached = fs.readFileSync(CACHE_FILE, "utf-8");
        return res.status(200).json(JSON.parse(cached));
      }
    }

    // 2. Fetch from Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/art?max_results=100&direction=desc`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary error: ${response.statusText}`);
    }

    const data = await response.json();

    // 3. Save fresh JSON to cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));

    // 4. Serve fresh
    res.status(200).json(data);
  } catch (error) {
    console.error("Image fetch failed:", error);

    // fallback: serve stale cache if available
    if (fs.existsSync(CACHE_FILE)) {
      const cached = fs.readFileSync(CACHE_FILE, "utf-8");
      return res.status(200).json(JSON.parse(cached));
    }

    res.status(500).json({ error: "Failed to load art images." });
  }
}
