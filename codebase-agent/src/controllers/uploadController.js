// src/controllers/uploadController.js
// Handle upload logic here
export const uploadFiles = (req, res) => {
  try {
    const uploadedFiles = req.files.map((file) => {
      return file.filename;
    });

    res.status(200).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};