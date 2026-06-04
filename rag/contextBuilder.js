import { retrieveContext } from "./retriever.js";

export function buildContext(input) {
  const context = retrieveContext(input);

  return {
    idealAnswer: context?.answer || "No reference available",
    topic: context?.topic || "general"
  };
}