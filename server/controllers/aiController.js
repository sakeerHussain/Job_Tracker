/**
 * controllers/aiController.js — Google Gemini AI integration
 * Uses direct HTTP calls to avoid SDK endpoint issues
 */

import fetch from "node-fetch";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`;
/**
 * Helper: calls Gemini API directly via HTTP
 * @param {string} prompt - The prompt to send
 * @returns {string} - The generated text response
 */
const callGemini = async (prompt) => {
  const response = await fetch(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini API error");
  }

  return data.candidates[0].content.parts[0].text;
};

/**
 * @desc    Generate a tailored cover letter
 * @route   POST /api/ai/cover-letter
 * @access  Private
 */
export const generateCoverLetter = async (req, res, next) => {
  try {
    const { jobDescription, userBackground, company, position } = req.body;

    if (!jobDescription || !company || !position) {
      return res.status(400).json({
        success: false,
        message: "jobDescription, company, and position are required",
      });
    }

    const prompt = `Write a professional, compelling cover letter for the following:

Company: ${company}
Position: ${position}

Job Description:
${jobDescription}

${userBackground ? `Candidate Background:\n${userBackground}` : ""}

Instructions:
- Keep it to 3-4 paragraphs
- Be specific to the job description
- Sound human, not robotic
- Do NOT use generic filler phrases
- End with a confident call to action
- Do not include date or address headers`;

    const coverLetter = await callGemini(prompt);
    res.status(200).json({ success: true, data: { coverLetter } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Analyze resume gaps against a job description
 * @route   POST /api/ai/resume-tips
 * @access  Private
 */
export const getResumeTips = async (req, res, next) => {
  try {
    const { jobDescription, resumeText } = req.body;

    if (!jobDescription || !resumeText) {
      return res.status(400).json({
        success: false,
        message: "jobDescription and resumeText are required",
      });
    }

    const prompt = `Analyze this resume against the job description and give actionable feedback.

Job Description:
${jobDescription}

Resume:
${resumeText}

Return ONLY a valid JSON object with no markdown, no backticks, no explanation:
{
  "matchScore": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2", "gap 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "keywords": ["missing keyword 1", "missing keyword 2"]
}`;

    const rawText = await callGemini(prompt);
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const tips = JSON.parse(cleaned);

    res.status(200).json({ success: true, data: tips });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: "AI returned unexpected format. Please try again.",
      });
    }
    next(error);
  }
};