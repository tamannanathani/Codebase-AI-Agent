import axios from "axios";

export const generateResponse = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // or claude, llama, etc.
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer analyzing codebases.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Codebase AI Agent",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("OpenRouter Error:", err.response?.data || err.message);
    throw err;
  }
};