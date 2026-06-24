let storedFiles = [];
let storedGraph = {};

export const setCodebase = (files, graph) => {
  storedFiles = files;
  storedGraph = graph;
};

export const getCodebase = () => ({
  files: storedFiles,
  graph: storedGraph,
});