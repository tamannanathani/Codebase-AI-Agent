import { buildContext } from "../services/contextService.js";
import { buildPrompt } from "../services/promptService.js";
import { generateResponse } from "../services/llmService.js";
import { getCodebase } from "../store/codebaseStore.js";

export const askCodebase = async (req, res) => {
  try {
    console.log("REQUEST HIT");

    const { query} = req.body;

    const { files, graph } = getCodebase();
    const context = buildContext(query, files, graph);

    console.log("CONTEXT:", context);

    if (context.error) {
      const messages = {
        "No file found in query": `I couldn't find a specific file in your question. Please include a filename (e.g., "app.js") in your query.`,
        "File not found in codebase": `The file you referenced wasn't found in the codebase.`
      };
      return res.json({
        success: false,
        error: context.error,
        answer: messages[context.error] || context.error
      });
    }

    const prompt = buildPrompt(context);

    console.log("PROMPT BUILT");

    const answer = await generateResponse(prompt);

    res.json({ success: true, answer });
  } catch (err) {
    console.error("FULL ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
};