const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Cloudinary Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * Upload a file (PDF, etc.) to Cloudinary
 * @param {string} fileDataUri - Data URI (base64) of file
 * @param {string} publicId - Desired public ID (with or without `.pdf`)
 * @returns {object|null} - Upload response or null on failure
 */
const uploadOnCloudinary = async (fileDataUri, publicId) => {
  try {
    if (!fileDataUri) throw new Error("File Data URI is missing");

    const fixedPublicId = publicId.endsWith('.pdf') ? publicId : `${publicId}.pdf`;

    const response = await cloudinary.uploader.upload(fileDataUri, {
      public_id: fixedPublicId,
      resource_type: "raw", // For non-image files
    });

    console.log("✅ Uploaded to Cloudinary:", response.secure_url);
    return response;

  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error.message);
    return null;
  }
};

module.exports = { uploadOnCloudinary };
