import { buildDependencyGraph, findDependencies, findDependents, findAllRelatedFiles } from "../src/services/graphService.js";

const files = [
  {
    originalName: "employee.js",
    imports: ["db.js"],
  },
  {
    originalName: "payroll.js",
    imports: ["employee.js"],
  },
];

const graph = buildDependencyGraph(files);

console.log("Graph:");
console.log(graph);

console.log("\nDependencies of payroll.js:");
console.log(findDependencies(graph, "payroll.js"));

console.log("\nDependents of employee.js:");
console.log(findDependents(graph, "employee.js"));

console.log("\nAll related files to payroll.js:");
console.log(findAllRelatedFiles(graph, "payroll.js"));