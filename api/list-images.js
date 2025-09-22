// /api/list-images.js

export default async function handler(req, res) {
  // Normally you’d call Cloudinary’s API here with your secret key.
  // For now, let's just return a sample response so you can test deployment.

  const images = [
    {
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      tags: ["demo", "sample"],
    },
    {
      url: "https://res.cloudinary.com/demo/image/upload/cat.jpg",
      tags: ["cat", "cute"],
    },
  ];

  res.status(200).json(images);
}
