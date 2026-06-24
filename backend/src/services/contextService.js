import {
  findFileByName,
  getRelatedFiles
} from "./retrievalService.js";


const extractFileFromQuery = (query) => {
  const match = query.match(
    /([a-zA-Z0-9-_]+\.js)/
  );
  return match ? match[1] : null;
};

export const buildContext = (
  query,
  files,
  graph
) => {
  const targetFileName =
    extractFileFromQuery(query);

  if (!targetFileName) {
    return {
      error: "No file found in query"
    };
  }

  const targetFile =
    findFileByName(
      files,
      targetFileName
    );

  if (!targetFile) {
    return {
      error: "File not found in codebase"
    };
  }

  const relatedFiles =
    getRelatedFiles(
      files,
      graph,
      targetFileName
    );

  return {
  query,
  targetFile: {
    ...targetFile,
    content: targetFile?.contentPreview || null
  },
  relatedFiles: relatedFiles.map(file => ({
    ...file,
    content: file.contentPreview || null
  }))
};
};