import {
  buildImpactReport
} from "../src/services/impactAnalysisService.js";

const graph = {
  "attendanceRoute.js": [
    "attendanceController.js"
  ],

  "attendanceController.js": [
    "employee.js"
  ],

  "payroll.js": [
    "employee.js"
  ],

  "employee.js": [
    "db.js"
  ],

  "db.js": []
};

const report = buildImpactReport(
  graph,
  "employee.js"
);

console.log(report);