import fs from "fs";
import path from "path";

const CACHE_FILE = path.join("/tmp", "art-list-images.json"); // specific to "art"
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Helper to get human-readable timestamp
function formatTime(date) {
  const options = { hour: "numeric", minute: "numeric", hour12: true };
  const time = date.toLocaleTimeString("en-US", options);
  const dateStr = `${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}`;
  return `Last pull at ${time}, ${dateStr}`;
}

// Load or reset daily pull count
function loadPullCount() {
  let count = 0;
  let lastDate = null;
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      if (cached.lastPullDate === new Date().toDateString()) {
        count = cached.dailyPullCount || 0;
      }
    } catch (e) {
      // ignore parsing errors
    }
  }
  return count;
}

export default async function handler(req, res) {
  try {
    // 1. Check cache
    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE);
      const age = Date.now() - stats.mtimeMs;

      if (age < CACHE_TTL) {
        const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
        return res.status(200).json(cached);
      }
    }

    // 2. Fetch from Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/art?max_results=100&direction=desc`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    if (!response.ok) throw new Error(`Cloudinary error: ${response.statusText}`);

    const cloudData = await response.json();

    // 3. Update pull counter
    const today = new Date();
    let dailyPullCount = loadPullCount() + 1;

    const output = {
      lastPullISO: today.toISOString(),
      lastPull: formatTime(today),
      lastPullDate: today.toDateString(),
      dailyPullCount,
      images: cloudData.resources || [],
    };

    // 4. Save JSON to cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(output, null, 2));

    // 5. Serve JSON
    res.status(200).json(output);
  } catch (error) {
    console.error("Image fetch failed:", error);

    // fallback: serve stale cache if available
    if (fs.existsSync(CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      return res.status(200).json(cached);
    }

    res.status(500).json({ error: "Failed to load art images." });
  }
}
