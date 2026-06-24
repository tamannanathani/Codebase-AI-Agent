import {
  buildDependencyGraph,
  findAllRelatedFiles
} from "../src/services/graphService.js";

import {
  getRelatedFiles
} from "../src/services/retrievalService.js";

const files = [
  {
    originalName: "employee.js",
    imports: ["db.js"],
    type: "model",
  },
  {
    originalName: "payroll.js",
    imports: ["employee.js"],
    type: "model",
  },
  {
    originalName: "db.js",
    imports: [],
    type: "config",
  },
];

// STEP 1: build graph
const graph = buildDependencyGraph(files);

// STEP 2: test graph
console.log("GRAPH:", graph);

// STEP 3: test traversal
console.log(
  "ALL RELATED:",
  findAllRelatedFiles(graph, "payroll.js")
);

// STEP 4: test retrieval wrapper
console.log(
  "RELATED FILE OBJECTS:",
  getRelatedFiles(files, graph, "payroll.js")
);