// Temporary test to confirm Admin API sees your folder
const result = await cloudinary.api.resources({
  type: "upload",
  prefix: "",        // empty prefix to list all folders
  max_results: 100
});
console.log(result);
