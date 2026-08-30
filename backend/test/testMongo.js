import dotenv from "dotenv";
dotenv.config();

import { connectMongoDB } from "../src/config/mongodb.js";
import Codebase from "../src/models/Codebase.js";
import File from "../src/models/File.js";
import Dependency from "../src/models/Dependency.js";

const testMongo = async () => {
  try {
    await connectMongoDB();

    const codebase = await Codebase.create({
      name: "Test HRMS",
    });

    const employeeFile = await File.create({
      codebaseId: codebase._id,
      originalName: "employee.js",
      path: "src/models/employee.js",
      type: "model",
      content: "test employee content",
      imports: ["db.js"],
      exports: ["Employee"],
    });

    const payrollFile = await File.create({
      codebaseId: codebase._id,
      originalName: "payroll.js",
      path: "src/models/payroll.js",
      type: "model",
      content: "test payroll content",
      imports: ["employee.js"],
      exports: ["Payroll"],
    });

    const dependency = await Dependency.create({
      codebaseId: codebase._id,
      sourceFile: "payroll.js",
      targetFile: "employee.js",
      type: "import",
    });

    console.log("\nMongoDB test successful!\n");

    console.log("Codebase:");
    console.log(codebase);

    console.log("\nFiles:");
    console.log(employeeFile);
    console.log(payrollFile);

    console.log("\nDependency:");
    console.log(dependency);

    process.exit(0);
  } catch (error) {
    console.error("MongoDB test failed:", error);
    process.exit(1);
  }
};

testMongo();