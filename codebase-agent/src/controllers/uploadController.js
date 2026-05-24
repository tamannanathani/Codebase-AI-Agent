// src/controllers/uploadController.js
// Handle upload logic here
// export const uploadFiles = (req, res) => {
//   try {
//     const uploadedFiles = req.files.map((file) => {
//       return file.filename;
//     });

//     res.status(200).json({
//       message: "Files uploaded successfully",
//       files: uploadedFiles,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: error.message,
//     });
//   }
// };  //returned the file names only, but we need to return the file paths as well for previewing
 

//Controller
// → call fileService
// → fileService reads files
// → structured data returned

import { readUploadedFiles } from "../services/fileService.js";

export const uploadFiles = (req, res) => {
  try {
    const { processedFiles, ignoredFiles } = readUploadedFiles(req.files);

    res.status(200).json({
      message: "Files uploaded and processed successfully",
      totalFiles: processedFiles.length,
      files: processedFiles,
      ignoredFiles,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};