import Codebase from "../models/Codebase.js";
import File from "../models/File.js";
import Dependency from "../models/Dependency.js";

export const getCodebaseFromDB = async (codebaseId) => {
  const codebase = await Codebase.findById(codebaseId);

  if (!codebase) {
    throw new Error("Codebase not found");
  }

  const files = await File.find({
    codebaseId: codebase._id,
  }).lean();

  const dependencies = await Dependency.find({
    codebaseId: codebase._id,
  }).lean();

  // Reconstruct the same graph structure
  // that your existing graphService expects.
  const graph = {};

  for (const file of files) {
    graph[file.originalName] = file.imports || [];
  }

  return {
    codebase,
    files,
    graph,
    dependencies,
  };
};