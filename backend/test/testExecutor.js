import { executePlan } from "../src/services/executorService.js";
import { findAllRelatedFiles } from "../src/services/graphService.js";

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

const graph = {
  "employee.js": ["db.js"],
  "payroll.js": ["employee.js"],
  "db.js": [],
};

const plan = {
  intent: "impact_analysis",
  targetFile: "employee.js",
};
console.log(findAllRelatedFiles(graph, "employee.js"));

const result = executePlan(
  plan,
  files,
  graph
);

console.log(JSON.stringify(result, null, 2));

const architecturePlan = {
  intent: "architecture_question",
  targetFile: "",
  tools: ["architecture_retrieval"],
  reason: "Architecture question"
};

const architectureQuery = "What happens if I remove employee.js?";

const architectureResult = executePlan(
  architecturePlan,
  files,
  graph,
  architectureQuery
);

console.log(
  JSON.stringify(architectureResult, null, 2)
);