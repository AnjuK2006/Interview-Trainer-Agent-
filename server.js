const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const { retrieve } = require("./rag/retriever"); // 🔥 RAG ADDED

const app = express();

app.use(cors());
app.use(express.json());

// ======================
// Multer Setup
// ======================
const upload = multer({ dest: "uploads/" });

// ======================
// LOAD KNOWLEDGE BASE
// ======================
let knowledgeDB = {};

try {
  knowledgeDB = JSON.parse(
    fs.readFileSync(path.join(__dirname, "knowledge.json"), "utf8")
  );

  console.log("Knowledge DB loaded successfully");
} catch (err) {
  console.log("Knowledge DB Error:", err.message);
}

// ======================
// IBM TOKEN FUNCTION
// ======================
async function getIBMToken() {
  const response = await axios.post(
    "https://iam.cloud.ibm.com/identity/token",
    new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: process.env.IBM_API_KEY,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

// ======================
// GENERATE QUESTIONS (RAG ENABLED)
// ======================
app.post("/generate", upload.single("resume"), async (req, res) => {
  console.log("🔥 /generate API HIT");
  try {
    const { name, role, experience } = req.body;

    let resumeText = "";

    if (req.file) {
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      resumeText = pdfData.text;
    }

    // 🔥 RAG retrieval based on role + resume
    const roleData = retrieve(role, resumeText);

    // 🔥 resume keyword extraction
    const resumeKeywords = resumeText
      .split(" ")
      .filter((w) => w.length > 4)
      .slice(0, 25)
      .join(", ");

    const accessToken = await getIBMToken();

    const aiResponse = await axios.post(
      "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29",
      {
        model_id: "ibm/granite-4-h-small",
        project_id: process.env.IBM_PROJECT_ID,

        messages: [
          {
            role: "user",
            content: `
You are an AI Interview Trainer powered by RAG.

Candidate:
Name: ${name}
Role: ${role}
Experience: ${experience}

Resume:
${resumeText || "No resume uploaded"}

Resume Keywords:
${resumeKeywords || "N/A"}

REFERENCE KNOWLEDGE (RAG):

Industry Expectations:
${JSON.stringify(roleData.industryExpectations)}

Technical Questions:
${JSON.stringify(roleData.technicalQuestions)}

Behavioral Questions:
${JSON.stringify(roleData.behavioralQuestions)}

Preparation Topics:
${JSON.stringify(roleData.prepTopics)}

TASK:
Generate:
1. Technical Questions (5)
2. HR Questions (3)
3. Behavioral Questions (3)
4. Project Questions (3)
5. Improvement Tips (3)
6. Preparation Strategy
7. Industry Expectations

RULES:
- Role specific
- Resume based
- NO model answers
- Short format
- No essay
            `,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText =
  aiResponse.data?.results?.[0]?.generated_text ||
  aiResponse.data?.choices?.[0]?.message?.content ||
  "No response generated";

res.json({text: generatedText});
  } catch(error){

  console.log("===== FULL ERROR =====");
  console.log(error.response?.data || error.message || error);
  console.log("======================");

  res.status(500).json({
    message: "Failed to generate questions",
    error: error.response?.data || error.message
  });
}
});

// ======================
// ANSWER EVALUATION (RAG ENABLED)
// ======================
app.post("/evaluate", async (req, res) => {
  try {
    const { question, answer, role } = req.body;

    // 🔥 RAG retrieval for evaluation context
    const roleData = retrieve(role || "frontend", question);

    const accessToken = await getIBMToken();

    const aiResponse = await axios.post(
      "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29",
      {
        model_id: "ibm/granite-4-h-small",
        project_id: process.env.IBM_PROJECT_ID,

        messages: [
          {
            role: "user",
            content: `
You are an expert technical interviewer.

Interview Question:
${question}

Candidate Answer:
${answer}

REFERENCE CONTEXT (RAG):

Industry Expectations:
${JSON.stringify(roleData.industryExpectations)}

Expected Technical Areas:
${JSON.stringify(roleData.technicalQuestions)}

Behavioral Guidelines:
${JSON.stringify(roleData.behavioralQuestions)}

TASK:
Evaluate the answer FAIRLY.

STRICT RULES:
- Read complete answer
- Use reference ONLY for guidance
- Do NOT invent missing points
- If strong, say "None significant"

OUTPUT FORMAT:

Score: X/10

Strengths:
• point 1
• point 2

Weaknesses:
• only real missing parts
OR
• None significant

Improvement Tip:
• short suggestion

Better Answer:
• improved version (not new answer)

Keep it SHORT.
            `,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const evalText =
  aiResponse.data?.results?.[0]?.generated_text ||
  aiResponse.data?.choices?.[0]?.message?.content ||
  "No evaluation generated";

res.json({
  text: evalText
});
  } catch (error) {
    console.log(error.response?.data || error);
    res.status(500).json({ message: "Evaluation failed." });
  }
});


// ======================
// INTERVIEW SIMULATION MODE (FIXED FLOW)
// ======================

let interviewState = {};

// START INTERVIEW
app.post("/interview/start", async (req, res) => {
  try {
    const { role, experience } = req.body;

    interviewState = {
      role,
      experience,
      step: 0,
      history: []
    };

    const firstQuestion = "Tell me about yourself";

    interviewState.history.push({ ai: firstQuestion });

    res.json({ question: firstQuestion });
  } catch (err) {
    res.status(500).json({ message: "Start failed" });
  }
});

// NEXT QUESTION (FLOW CONTROLLED + ROLE BASED)
app.post("/interview/next", async (req, res) => {
  try {
    const { answer } = req.body;

    interviewState.history.push({ user: answer });

    const accessToken = await getIBMToken();

    interviewState.step += 1;

    const prompt = `
You are an AI interviewer conducting a REAL job interview.

ROLE: ${interviewState.role}
EXPERIENCE: ${interviewState.experience}

INTERVIEW RULES:
- Start was "Tell me about yourself"
- DO NOT repeat questions
- DO NOT end early
- MUST follow progression:
  1. Background question
  2. Resume/project question
  3. Technical question (role based)
  4. Problem solving question
  5. Behavioral question
  6. HR question
  7. End interview (NOT "Do you have questions")

CONVERSATION HISTORY:
${JSON.stringify(interviewState.history)}

CURRENT STEP: ${interviewState.step}

TASK:
- Give 1 line feedback on previous answer
- Then ask ONLY ONE NEXT QUESTION
- Question MUST match ROLE: ${interviewState.role}
`;

    const aiResponse = await axios.post(
      "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29",
      {
        model_id: "ibm/granite-4-h-small",
        project_id: process.env.IBM_PROJECT_ID,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const response =
      aiResponse.data?.results?.[0]?.generated_text ||
      "Tell me more about your experience.";

    interviewState.history.push({ ai: response });

    res.json({ question: response });
  } catch (err) {
    res.status(500).json({ message: "Next failed" });
  }
});

// ======================
// SERVER
// ======================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});