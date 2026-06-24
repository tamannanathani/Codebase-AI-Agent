const normalizeGraphKey = (name) => {
  if (!name) return "";
  return name.replace(/^\d+-/, "").replace(/^\.?\//, "").toLowerCase();
};

// Builds an adjacency list representation of the codebase.
// Each file points to the files it imports.
export const buildDependencyGraph = (files) => {
  const graph = {};

  files.forEach((file) => {
    const key = normalizeGraphKey(file.originalName);
    graph[key] = (file.imports || []).map(normalizeGraphKey);
  });

  return graph;
};

// Finds all dependencies of a given file by traversing the graph.
export const findDependencies = (
  graph,
  fileName
) => {
  const key = normalizeGraphKey(fileName);
  return graph[key] || [];
};

//this will tell what files depend on a given file{traversing the graph in reverse}
export const findDependents = (
  graph,
  targetFile
) => {
  const needle = normalizeGraphKey(targetFile);
  const dependents = [];

  for (const file in graph) {
    if (graph[file].includes(needle)) {
      dependents.push(file);
    }
  }

  return dependents;
};


//findinf all files related to a given file, including both its dependencies and dependents
//depth first search (DFS) to explore the graph and collect all related files.

//dfs strategy: maintain set() of visited files and startFile[] to track files to explore

export const findAllRelatedFiles = (
  graph,
  startFile
) => {
  const visited = new Set();
  const stack = [normalizeGraphKey(startFile)];
  const relatedFiles = [];

  while (stack.length > 0) {
    const currentFile = stack.pop();

    if (visited.has(currentFile)) {
      continue;
    }

    visited.add(currentFile);
    relatedFiles.push(currentFile);

    const dependencies =
      graph[currentFile] || [];

    for (const dependency of dependencies) {
      stack.push(dependency);
    }
  }

  return relatedFiles;
};

