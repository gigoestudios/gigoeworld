export default function handler(req, res) {
  res.status(200).json([
    {
      url: "https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg",
      tags: ["art", "charcoal"]
    },
    {
      url: "https://res.cloudinary.com/demo/image/upload/w_600/kitten.jpg",
      tags: ["photography", "animals"]
    }
  ]);
}
