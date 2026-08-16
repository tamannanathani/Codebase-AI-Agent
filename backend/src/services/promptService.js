//1. User question
//2. Target file content
//3. Related files content

// export const buildPrompt = (context) => {
//   const { query, targetFile, relatedFiles } = context;

//  const safeRelatedFiles = Array.isArray(relatedFiles)
//   ? relatedFiles.filter(
//       (file) => file && typeof file === "object"
//     )
//   : [];

// const relatedCode = safeRelatedFiles
//   .map((file) => {
//     if (!file || !file.originalName) return "";


//     return `
// FILE: ${file.originalName || "unknown"}
// TYPE: ${file.type || "unknown"}

// CODE:
// ${file.content || ""}
// `;
//   })
//   .filter(Boolean)
//   .join("\n-----------------\n");
  


//   const targetBlock = targetFile
//     ? `
// TARGET FILE:
// ${targetFile.originalName}

// TYPE:
// ${targetFile.type}

// CODE:
// ${targetFile.content}`
//     : "TARGET FILE: (none found)";

//   const prompt = `
// You are an expert codebase analysis assistant.

// Answer the user question using ONLY the provided code context.

// ---

// USER QUESTION:
// ${query}

// ---
// ${targetBlock}

// ---

// RELATED FILES:
// ${relatedCode}

// ---

// INSTRUCTIONS:
// - Use only given code
// - If something is missing, say so
// - Explain clearly and step by step
// `;

//   return prompt;
// };
export const buildPrompt = (query, context) => {
  let prompt = `
You are a senior software engineer helping analyze a codebase.

Answer ONLY using the provided context.

====================================
USER QUESTION
====================================

${query}

====================================
INTENT
====================================

${context.intent}

`;

  // Target file
  if (context.targetFile) {
    prompt += `
====================================
TARGET FILE
====================================

Name: ${context.targetFile.originalName}
Type: ${context.targetFile.type}

Imports:

${context.targetFile.imports.join("\n")}
`;
  }

  // Related files
  if (context.relatedFiles.length) {
    prompt += `

====================================
RELATED FILES
====================================

`;

    context.relatedFiles.forEach((file) => {
      prompt += `
-----------------------------
${file.originalName}
Type: ${file.type}

Imports:
${file.imports.join(", ") || "None"}

`;
    });
  }

  // Impact analysis
  if (context.impact) {
    prompt += `

====================================
IMPACT ANALYSIS
====================================

Target:
${context.impact.target}

Direct Dependents:
${context.impact.directDependents.join(", ") || "None"}

Indirect Dependents:
${context.impact.indirectDependents.join(", ") || "None"}

Total Affected:
${context.impact.totalAffected}
`;
  }

  prompt += `

====================================
INSTRUCTIONS
====================================

If explaining a file:
- Explain what it does
- Mention its imports
- Mention related files

If doing impact analysis:
- Explain what breaks
- Mention affected files
- Explain possible runtime consequences

If answering an architecture question:
- Infer architecture from the related files.

Return a detailed answer.
`;

  return prompt;
};