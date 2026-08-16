//Its job is to read the planner's output and execute the correct backend tools.
import { findFileByName, getRelatedFiles , extractKeywords, findFilesByKeywords} from "./retrievalService.js";
import { getImpactAnalysis } from "./graphService.js";

export const executePlan = (plan, files, graph, query) => {
  const context = {
    intent: plan.intent,
    targetFile: null,
    relatedFiles: [],
    impact: null,
  };

  switch (plan.intent) {
    case "explain_file": {
      const target = findFileByName(files, plan.targetFile);

      if (!target) {
        return {
          error: "Target file not found",
        };
      }

      context.targetFile = target;

      context.relatedFiles = getRelatedFiles(
        files,
        graph,
        plan.targetFile
      );

      break;
    }

    case "impact_analysis": {
      const target = findFileByName(files, plan.targetFile);

      if (!target) {
        return {
          error: "Target file not found",
        };
      }

      context.targetFile = target;

      context.relatedFiles = getRelatedFiles(
        files,
        graph,
        plan.targetFile
      );

      context.impact = getImpactAnalysis(
        graph,
        plan.targetFile
      );

      break;
    }

    case "dependency_analysis": {
      const target = findFileByName(files, plan.targetFile);

      if (!target) {
        return {
          error: "Target file not found",
        };
      }

      context.targetFile = target;

      context.relatedFiles = getRelatedFiles(
        files,
        graph,
        plan.targetFile
      );

      break;
    }

    case "architecture_question": {
  const keywords = extractKeywords(query);

  console.log("ARCHITECTURE KEYWORDS:", keywords);

  const relevantFiles = findFilesByKeywords(
    files,
    keywords
  );

  console.log(
    "ARCHITECTURE FILES:",
    relevantFiles.map(file => file.originalName)
  );

  context.relatedFiles = relevantFiles;

  break;
}

    default:
      context.relatedFiles = files;
  }

  return context;
};