export function parseResume(text) {
  const lower = text.toLowerCase();

  let role = "general";

  if (lower.includes("html") || lower.includes("css") || lower.includes("javascript")) {
    role = "frontend";
  }

  if (lower.includes("node") || lower.includes("api") || lower.includes("backend")) {
    role = "backend";
  }

  const experience =
    lower.includes("fresher") ? "fresher" : "experienced";

  return {
    role,
    experience
  };
}