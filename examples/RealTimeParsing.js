// Real-time Parsing: Extract THINKING and ANSWER sections
// As AI generates text, we parse it progressively

function extractThinkingSteps(text) {
  // Extract everything between THINKING: and ANSWER:
  const thinkingSection = text.replace("THINKING:", "").split("ANSWER:")[0];

  // Parse bullet points
  return thinkingSection
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.trim().substring(1).trim())
    .filter((step) => step.length > 0);
}

function extractAnswer(text) {
  // Extract everything after ANSWER:
  const parts = text.split("ANSWER:");
  return parts.length > 1 ? parts[1].trim() : "";
}

// Usage in streaming loop:
for await (const chunk of ollamaStream) {
  fullResponse += chunk.message?.content || "";

  // Detect section transitions
  if (fullResponse.includes("ANSWER:") && currentSection === "thinking") {
    currentSection = "answer";

    // Parse and send thinking steps
    const thinkingSteps = extractThinkingSteps(fullResponse);
    sendSSEMessage(controller, {
      type: "thinking",
      thoughts: thinkingSteps,
    });
  }

  // Progressive answer streaming
  if (currentSection === "answer") {
    const answer = extractAnswer(fullResponse);
    sendSSEMessage(controller, { type: "streaming", delta: answer });
  }
}
