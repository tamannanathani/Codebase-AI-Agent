// src/services/plannerService.js

import { generateResponse } from "./llmService.js";

export const planQuery = async (query) => {
  const plannerPrompt = `
You are an AI planner for a Codebase AI Assistant.

DO NOT answer the user's question.

Your only job is to analyze the request and decide what backend tools should be executed.

Available tools:

1. retrieval
- Find target file
- Retrieve related files

2. graph
- Dependency analysis
- Impact analysis

3. parser
- Imports
- Exports
- Routes
The "tools" array MUST contain only these exact values.

Do NOT invent new tool names.
Tool selection rules:

1. explain_file
Use when the user asks to:
- explain a specific file
- describe what a file does
- understand the code inside a specific file

tools: ["retrieval"]

2. impact_analysis
Use when the user asks:
- what happens if a file is removed/deleted
- what would break if a file changes
- what files are affected by changing/removing a file
- what depends on a particular file
- consequences of deleting or modifying a file

tools: ["graph"]

3. dependency_analysis
Use when the user asks:
- what a file depends on
- dependency chain
- files imported by a file
- dependency relationships

tools: ["graph"]

4. architecture_question
Use when the user asks:
- how a feature works across multiple files
- how authentication works
- how payroll works
- how leave management works
- how data flows through the application
- how different modules/components interact

tools: ["architecture_retrieval"]

5. general_code_question
Use for general programming/codebase questions that don't clearly fit the above categories.

tools: ["architecture_retrieval", "retrieval"]

IMPORTANT:
If the query contains phrases such as:
"what happens if I remove"
"what happens if I delete"
"what would happen if I change"
"what will break if I remove"
"what files are affected"
then ALWAYS classify it as "impact_analysis" when a filename is present.

Examples:

User:
"Explain payroll.js"

Return:
{
  "intent": "explain_file",
  "targetFile": "payroll.js",
  "tools": ["retrieval"],
  "reason": "The user wants an explanation of a specific file."
}

User:
"What happens if I remove employee.js?"

Return:
{
  "intent": "impact_analysis",
  "targetFile": "employee.js",
  "tools": ["graph"],
  "reason": "The user wants to understand which parts of the codebase would be affected."
}

User:
"Show dependency chain for payroll.js"

Return:
{
  "intent": "dependency_analysis",
  "targetFile": "payroll.js",
  "tools": ["graph"],
  "reason": "The user wants to analyze the dependency chain of a specific file."
}

User:
"How does authentication work?"

Return:
{
  "intent": "architecture_question",
  "targetFile": "",
  "tools": ["architecture_retrieval"],
  "reason": "The user is asking how multiple parts of the codebase work together."
}

User:
"How does leave approval work?"

Return:
{
  "intent": "architecture_question",
  "targetFile": "",
  "tools": ["architecture_retrieval"],
  "reason": "The question concerns a workflow that may involve multiple files."
}

Return ONLY valid JSON.

Schema:

{
  "intent": "",
  "targetFile": "",
  "tools": [],
  "reason": ""
}

User Query:
${query}
`;

  try {
    const response = await generateResponse(plannerPrompt);

    // Remove markdown if model wraps JSON
    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Planner Error:", error);

    return {
      intent: "general_code_question",
      targetFile: "",
      tools: ["retrieval"],
      reason: "Planner failed. Using fallback."
    };
  }
};