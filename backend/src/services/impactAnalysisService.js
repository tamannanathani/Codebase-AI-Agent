//this service will anaylse the graph 

// Finds files that directly import the target file
export const findDirectDependents = (graph, targetFile) => {
  const dependents = [];

  for (const file in graph) {
    if (graph[file].includes(targetFile)) {
      dependents.push(file);
    }
  }

  return dependents;
};

// Recursively finds ALL files affected by removing targetFile
//If employee.js is removed, both files above are affected.
// So we recursively walk upwards.

export const findIndirectDependents = (
  graph,
  targetFile,
  visited = new Set()
) => {
  const directDependents = findDirectDependents(graph, targetFile);

  for (const file of directDependents) {
    if (!visited.has(file)) {
      visited.add(file);

      // Continue searching upward
      findIndirectDependents(graph, file, visited);
    }
  }

  return [...visited];
};

// Builds a complete impact report
export const buildImpactReport = (
  graph,
  targetFile
) => {
  const directDependents =
    findDirectDependents(graph, targetFile);

  const allDependents =
    findIndirectDependents(graph, targetFile);

  const indirectDependents =
    allDependents.filter(
      file => !directDependents.includes(file)
    );

  return {
    target: targetFile,
    directDependents,
    indirectDependents,
    totalAffected: allDependents.length
  };
};