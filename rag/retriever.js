const fs = require("fs");
const path = require("path");

const knowledgeDB = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../knowledge.json"), "utf8")
);

// simple relevance scoring
function score(a, b) {
  const A = a.toLowerCase().split(" ");
  const B = b.toLowerCase().split(" ");
  return B.filter(w => A.includes(w)).length;
}

function retrieve(role, resumeText = "") {
  const data = knowledgeDB[role] || knowledgeDB["frontend"];

  const words = resumeText.toLowerCase().split(/\s+/);

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const filterByKeywords = (items) => {
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
    industryExpectations: data.industryExpectations,
    technicalQuestions: shuffle(techPool).slice(0, 5),
    behavioralQuestions: shuffle(behPool).slice(0, 3),
    prepTopics: shuffle(prepPool).slice(0, 4),
    companies: data.companies || {}
  };
}

module.exports = { retrieve };