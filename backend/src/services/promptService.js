//1. User question
//2. Target file content
//3. Related files content

export const buildPrompt = (context) => {
  const { query, targetFile, relatedFiles } = context;

 const safeRelatedFiles = Array.isArray(relatedFiles)
  ? relatedFiles.filter(
      (file) => file && typeof file === "object"
    )
  : [];

const relatedCode = safeRelatedFiles
  .map((file) => {
    if (!file || !file.originalName) return "";


    return `
FILE: ${file.originalName || "unknown"}
TYPE: ${file.type || "unknown"}

CODE:
${file.content || ""}
`;
  })
  .filter(Boolean)
  .join("\n-----------------\n");
  


  const targetBlock = targetFile
    ? `
TARGET FILE:
${targetFile.originalName}

TYPE:
${targetFile.type}

CODE:
${targetFile.content}`
    : "TARGET FILE: (none found)";

  const prompt = `
You are an expert codebase analysis assistant.

Answer the user question using ONLY the provided code context.

---

USER QUESTION:
${query}

---
${targetBlock}

---

RELATED FILES:
${relatedCode}

---

INSTRUCTIONS:
- Use only given code
- If something is missing, say so
- Explain clearly and step by step
`;

  return prompt;
};