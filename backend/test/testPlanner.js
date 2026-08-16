import dotenv from "dotenv";
dotenv.config();
import { planQuery } from "../src/services/plannerService.js";

const queries = [
  "Explain payroll.js",

  "What happens if I remove employee.js?",

  "Show dependency chain for attendanceController.js",

  "How does authentication work?"
];

for (const query of queries) {
  console.log("\n===========================");
  console.log("Query:", query);

  const plan = await planQuery(query);

  console.log(plan);
}