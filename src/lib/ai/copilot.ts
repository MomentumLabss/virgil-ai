import { CopilotMessage, Instruction, AgentRecord } from "@/types";

function buildSystemPrompt(
  instructions: Instruction[],
  recentRecords: AgentRecord[]
): string {
  return `You are Virgil, an AI agent assistant. You help users understand what their Web3 monitoring agent has been doing.

You have access to the user's current instructions and recent agent records. Always reference specific data when answering. Be concise and direct. Never make up data - only reference what is provided in the context.

If asked about a specific record, reference its ID and timestamp. If asked what the agent has been doing, summarize from the records provided.

Current user context (active instructions):
${JSON.stringify(instructions, null, 2)}

Recent agent records:
${JSON.stringify(recentRecords, null, 2)}`;
}

export async function* streamCopilotResponse(
  messages: CopilotMessage[],
  instructions: Instruction[],
  recentRecords: AgentRecord[]
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    yield "I'm sorry, but the AI copilot is not configured. Please set GROQ_API_KEY in your environment.";
    return;
  }

  const systemPrompt = buildSystemPrompt(instructions, recentRecords);

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true,
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Groq API error: ${response.statusText}. ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.choices?.[0]?.delta?.content;
            if (text) {
              yield text;
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    yield `I'm sorry, I encountered an error: ${message}`;
  }
}
