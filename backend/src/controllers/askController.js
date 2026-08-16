import { planQuery } from "../services/plannerService.js";
import { executePlan } from "../services/executorService.js";
import { buildPrompt } from "../services/promptService.js";
import { generateResponse } from "../services/llmService.js";
import { getCodebase } from "../store/codebaseStore.js";

export const askCodebase = async (req, res) => {
  try {
    console.log("REQUEST HIT");

    const { query} = req.body;

    const { files, graph } = getCodebase();
    console.log(
  "FILES IN STORE:",
  files.map(file => file.originalName)
);

console.log(
  "GRAPH KEYS:",
  Object.keys(graph)
);
   const plan = await planQuery(query);

console.log("PLAN:");
console.log(plan);

const context = executePlan(
  plan,
  files,
  graph,
  query
);

console.log("CONTEXT:");
console.log(context);

if (context.error) {
  return res.status(400).json({
    success: false,
    error: context.error,
  });
}

    const prompt = buildPrompt(query, context);

    console.log("PROMPT BUILT");

    const answer = await generateResponse(prompt);

    res.json({ success: true, plan, answer });
  } catch (err) {
    console.error("FULL ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
};