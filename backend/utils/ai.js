const Groq = require('groq-sdk');

let groqInstance = null;
const getGroqClient = () => {
  if (!groqInstance) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing in environment variables");
    }
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groqInstance;
};

/**
 * Analyzes an issue description to determine severity priority and relevant tags.
 */
const analyzeIssueWithAI = async (title, description, category) => {
  try {
    const prompt = `
    Analyze the following civic issue report.
    Title: "${title}"
    Category: "${category}"
    Description: "${description}"

    Task:
    1. Determine a suggested priority: "low", "medium", "high", or "critical".
    2. Generate 3 short, relevant tags for this issue (e.g., "traffic hazard", "electrical", "sanitation").
    
    Output strictly in the following JSON format:
    {
      "priority": "medium",
      "tags": ["tag1", "tag2", "tag3"],
      "confidence": 0.85
    }
    `;

    const chatCompletion = await getGroqClient().chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1, // Low temp for more consistent JSON structure
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    const result = JSON.parse(content);
    
    return {
      suggestedPriority: result.priority || 'medium',
      autoTags: result.tags || [],
      confidenceScore: result.confidence || 0.8
    };

  } catch (err) {
    console.error("AI Analysis failed:", err);
    return { suggestedPriority: 'medium', autoTags: [], confidenceScore: 0.5 };
  }
};

module.exports = { analyzeIssueWithAI };
