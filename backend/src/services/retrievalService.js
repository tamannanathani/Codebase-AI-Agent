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
  const needle = normalizeFileName(fileName);

  const graphKey = Object.keys(graph).find(
    (k) => normalizeFileName(k) === needle
  );

  const relatedNames = graphKey ? graph[graphKey] : [];

  return relatedNames
    .map((name) => {
      const normalized = normalizeFileName(name);

      return files.find((file) => {
        const fileNorm = normalizeFileName(file.originalName);
        return fileNorm === normalized;
      });
    })
    .filter(Boolean);
};