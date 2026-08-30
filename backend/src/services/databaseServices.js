import Codebase from "../models/Codebase.js";
import File from "../models/File.js";
import Dependency from "../models/Dependency.js";

export const saveCodebase = async (
  codebaseName,
  files,
  graph
) => {
  // 1. Create codebase
  const codebase = await Codebase.create({
    name: codebaseName,
  });

  // 2. Save files
  const fileDocuments = files.map((file) => ({
    codebaseId: codebase._id,
    originalName: file.originalName,
    path: file.path || "",
    type: file.type || "unknown",
    content: file.content || file.contentPreview || "",
    imports: file.imports || [],
    exports: file.exports || [],
  }));

  await File.insertMany(fileDocuments);

  // 3. Convert graph into dependency documents
  const dependencyDocuments = [];

  for (const [sourceFile, dependencies] of Object.entries(graph)) {
    for (const targetFile of dependencies) {
      dependencyDocuments.push({
        codebaseId: codebase._id,
        sourceFile,
        targetFile,
        type: "import",
      });
    }
  }

  if (dependencyDocuments.length > 0) {
    await Dependency.insertMany(dependencyDocuments);
  }

  return codebase;
};