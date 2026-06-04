export function buildQuestionPrompt(profile) {
  return `
You are an interview question generator.

Role: ${profile.role}
Experience: ${profile.experience}

Generate:
- 5 technical questions
- 3 HR questions
- 3 behavioral questions

Make them role-specific and realistic.
`;
}