import { readUploadedFiles } from "../services/fileService.js";
import { buildDependencyGraph } from "../services/graphService.js";
import { saveCodebase } from "../services/databaseServices.js";

export const uploadFiles = async (req, res) => {
  try {
    console.log("UPLOAD REQUEST HIT");

    const { processedFiles, ignoredFiles } =
      readUploadedFiles(req.files);

    console.log(
      "PROCESSED FILES:",
      processedFiles.map((file) => file.originalName)
    );

    const dependencyGraph =
      buildDependencyGraph(processedFiles);

    const codebaseName =
      req.body.name || "Uploaded Codebase";

    const codebase = await saveCodebase(
      codebaseName,
      processedFiles,
      dependencyGraph
    );

    console.log(
      "CODEBASE CREATED:",
      codebase._id.toString()
    );

    res.status(200).json({
      success: true,
      message: "Files uploaded and saved successfully",

      codebaseId: codebase._id,

      codebaseName: codebase.name,

      totalFiles: processedFiles.length,

      files: processedFiles,

      ignoredFiles,

      dependencyGraph,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};