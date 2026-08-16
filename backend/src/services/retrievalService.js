import { findAllRelatedFiles } from "./graphService.js";
export const normalizeFileName = (name) => {
  if (!name) return "";
  return name
    .replace(/^\d+-/, "")
    .replace(/^\.?\//, "")
    .toLowerCase();
};

export const findFileByName = (
  files,
  fileName
) => {
  const needle = normalizeFileName(fileName);
  return files.find(
    (file) => normalizeFileName(file.originalName) === needle
  );
};

export const findFilesByType = (
  files,
  type
) => {
  return files.filter(
    (file) => file.type === type
  );
};

export const getRelatedFiles = (files, graph, fileName) => {
  const relatedNames = findAllRelatedFiles(graph, fileName);

  return relatedNames
    .map((name) =>
      files.find(
        (file) =>
          normalizeFileName(file.originalName) ===
          normalizeFileName(name)
      )
    )
    .filter(Boolean);
};

export const findFilesByKeywords = (files, keywords) => {
  const results = [];

  for (const file of files) {
    const text = `
      ${file.originalName}
      ${file.contentPreview || ""}
      ${(file.imports || []).join(" ")}
    `.toLowerCase();

    const matched = keywords.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    if (matched) {
      results.push(file);
    }
  }

  return results;
};
export const extractKeywords = (query) => {
  const stopWords = new Set([
    "how",
    "does",
    "do",
    "what",
    "is",
    "are",
    "the",
    "a",
    "an",
    "in",
    "of",
    "to",
    "work",
    "works",
    "explain",
    "show",
    "tell",
    "me",
    "about"
  ]);

  return query
    .toLowerCase()
    .replace(/[?!.,]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
};