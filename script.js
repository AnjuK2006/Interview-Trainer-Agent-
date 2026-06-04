const form = document.getElementById("resumeForm");
const resultBox = document.getElementById("result");
const evaluationBox = document.getElementById("evaluationResult");
const loadingQuestions = document.getElementById("loadingQuestions");
const loadingFeedback = document.getElementById("loadingFeedback");

let currentRole = "";
let currentQuestion = "";

// ======================
// GENERATE
// ======================
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  loadingQuestions.textContent = "Generating...";
  resultBox.textContent = "";

  const formData = new FormData(this);

  const res = await fetch("http://localhost:5000/generate", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  loadingQuestions.textContent = "";
  resultBox.textContent = data.text;
});

// ======================
// EVALUATE
// ======================
document.getElementById("evaluateBtn").addEventListener("click", async () => {
  const question = document.getElementById("question").value;
  const answerBox = document.getElementById("chatAnswer");
  const answer = answerBox.value;

  const res = await fetch("http://localhost:5000/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      answer,
      role: currentRole,
    }),
  });

  const data = await res.json();

  evaluationBox.textContent = data.text;

  answerBox.value = ""; // ✅ FIX
});

// ======================
// INTERVIEW START
// ======================
document.getElementById("startInterview").addEventListener("click", async () => {
  const role = document.querySelector("input[name='role']").value;

  currentRole = role;

  const res = await fetch("http://localhost:5000/interview/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  const data = await res.json();

  currentQuestion = data.question;

  document.getElementById("interviewBox").textContent =
    "AI: " + currentQuestion;
});

// ======================
// SEND ANSWER
// ======================
document.getElementById("sendAnswer").addEventListener("click", async () => {
  const answerBox = document.getElementById("chatAnswer");
  const answer = answerBox.value;

  const evalRes = await fetch("http://localhost:5000/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: currentQuestion,
      answer,
      role: currentRole,
    }),
  });

  const evalData = await evalRes.json();

  const box = document.getElementById("interviewBox");

  box.textContent += "\n\nAI Feedback:\n" + evalData.text;

  answerBox.value = "";

  const nextRes = await fetch("http://localhost:5000/interview/next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
  });

  const nextData = await nextRes.json();

  // FIX: now backend sends "question"
  currentQuestion = nextData.question;

  box.textContent += "\n\nAI: " + currentQuestion;
});