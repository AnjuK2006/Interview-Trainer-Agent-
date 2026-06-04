const fs = require("fs");
const path = require("path");

const knowledgeDB = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../knowledge.json"), "utf8")
);

function retrieve(role, resumeText = "") {

  const normalizedRole = (role || "").toLowerCase().trim();

  // Map UI roles to knowledge.json roles
  let mappedRole = normalizedRole;

  if (normalizedRole === "web developer") {
    mappedRole = "frontend developer";
  }

  if (normalizedRole === "full stack developer") {
    mappedRole = "frontend developer";
  }

  console.log("Role received:", normalizedRole);
  console.log("Mapped role:", mappedRole);
  console.log("Available roles:", Object.keys(knowledgeDB));

  const data =
    knowledgeDB[mappedRole] ||
    knowledgeDB["frontend developer"] || {
      industryExpectations: [],
      technicalQuestions: [],
      behavioralQuestions: [],
      prepTopics: [],
      companies: {}
    };

  const words = resumeText.toLowerCase().split(/\s+/);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const filterByKeywords = (items = []) => {
    return items.filter((q) =>
      words.some((w) => q.toLowerCase().includes(w))
    );
  };

  const techPool =
    filterByKeywords(data.technicalQuestions).length > 0
      ? filterByKeywords(data.technicalQuestions)
      : data.technicalQuestions;

  const behPool =
    filterByKeywords(data.behavioralQuestions).length > 0
      ? filterByKeywords(data.behavioralQuestions)
      : data.behavioralQuestions;

  const prepPool =
    filterByKeywords(data.prepTopics).length > 0
      ? filterByKeywords(data.prepTopics)
      : data.prepTopics;

  return {
    industryExpectations: data.industryExpectations || [],
    technicalQuestions: shuffle(techPool || []).slice(0, 5),
    behavioralQuestions: shuffle(behPool || []).slice(0, 3),
    prepTopics: shuffle(prepPool || []).slice(0, 4),
    companies: data.companies || {}
  };
}

module.exports = { retrieve };