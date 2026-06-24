// src/services/fileService.js
// File service logic here

import fs from "fs";
import path from "path"; //inbuilt module to handle file paths: including file names, extensions, and directories..
import {
  extractImports,
  extractExports,
  extractRoutes,
} from "./parserService.js";


const allowedExtensions = [".js", ".ts", ".json"];
const isValidFile = (extension) => {
  return allowedExtensions.includes(extension);
};

//heuristic-based file classification based on content
const classifyFile = (content) => {

  if (
    content.includes("sequelize.define") ||
    content.includes("mongoose.model")
  ) {
    return "model";
  }

  if (content.includes("router.")) {
    return "route";
  }

  if (
    content.includes("req, res") ||
    content.includes("exports.")
  ) {
    return "controller";
  }

  return "unknown";
};


export const readUploadedFiles = (files) => {
const ignoredFiles = [];

const validFiles = files.filter((file) => { // Filter out invalid files based on extension
  const extension = path.extname(file.originalname);

  const valid = isValidFile(extension);

  if (!valid) {
    ignoredFiles.push(file.originalname);
  }

  return valid;
}); 

const processedFiles = validFiles.map((file) => { // Read the file content for preview (you can adjust this as needed)
    const content = fs.readFileSync(file.path, "utf-8"); //tells node to read the file as a string instead of a binary buffer
    const extension = path.extname(file.originalname);
    const type = classifyFile(content);
    const imports = extractImports(content);
    const exports = extractExports(content);
    const routes = extractRoutes(content);
    return {
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
      size: file.size,
      contentPreview: content.slice(0, 200), // Get the first 200 characters as a preview
      extension,
      type,
      imports,
      exports,
      routes,
    };
  });

  return {
    processedFiles,
    ignoredFiles,
  };
};