import { CopilotMessage, Instruction, AgentRecord } from "@/types";

function buildSystemPrompt(
  instructions: Instruction[],
  recentRecords: AgentRecord[]
): string {
  const instructionsContext = instructions.length > 0 
    ? `\n\nCurrent user context (active instructions):\n${JSON.stringify(instructions, null, 2)}`
    : "";

  const recordsContext = recentRecords.length > 0
    ? `\n\nRecent agent records:\n${JSON.stringify(recentRecords, null, 2)}`
    : "";

  return `You are CoVirgil, an AI Web3 assistant built into the Virgil platform. 
You help users understand their Web3 monitoring agent activity, but you can also answer general Web3, crypto, and wallet analysis questions.

If the user asks about their monitoring instructions or agent records, reference the context below. 
If the context is empty, politely explain that they haven't set up any active monitoring instructions yet.
If the user asks a general question (like fetching a balance, explaining a transaction, or analyzing a wallet), answer it normally as an AI assistant.
DO NOT leak raw JSON arrays to the user. Always format your responses in clean, readable text.${instructionsContext}${recordsContext}`;
}

export async function* streamCopilotResponse(
  messages: CopilotMessage[],
  instructions: Instruction[],
  recentRecords: AgentRecord[]
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = "llama-3.3-70b-versatile";

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
