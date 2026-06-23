import { ParsedInstruction } from "@/types";

const SYSTEM_PROMPT = `You are Virgil's instruction parser. Your job is to extract structured parameters from a plain English monitoring instruction.

The user wants to monitor Web3 conditions. Extract:
- conditionType: one of wallet_movement | price_threshold | dao_event | contract_interaction | token_received
- target: the wallet address, token name, or asset being monitored
- threshold: numeric threshold if applicable (null if none)
- thresholdUnit: ETH, USD, etc. (null if none)
- action: what should happen when the condition is met
- confidence: 0-100 integer, how confident you are in the parse
- needsClarification: boolean
- clarificationQuestion: if needsClarification is true, one specific question to ask the user

Respond ONLY with a valid JSON object. No markdown, no explanation. Just the JSON.`;

export async function parseInstruction(
  instruction: string
): Promise<ParsedInstruction> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: instruction }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Groq API error: ${response.statusText}. ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content || "";

  // Extract JSON from response (handle potential markdown fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from Groq response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Omit<
    ParsedInstruction,
    "raw"
  >;

  return {
    raw: instruction,
    conditionType: parsed.conditionType || "wallet_movement",
    target: parsed.target || "",
    threshold: parsed.threshold ?? null,
    thresholdUnit: parsed.thresholdUnit ?? null,
    action: parsed.action || "Notify the user",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 50,
    needsClarification: !!parsed.needsClarification,
    clarificationQuestion: parsed.clarificationQuestion ?? null,
  };
}
