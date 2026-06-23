import { DecisionOutcome, ParsedInstruction } from "@/types";

const SYSTEM_PROMPT = `You are Virgil's decision engine. You are given a monitoring instruction and real-time Web3 data.

Your job is to:
1. Determine if the condition in the instruction has been met
2. Explain your reasoning in plain English (2-3 sentences maximum)
3. State what action should be taken

CRITICAL RULES:
- Be precise and factual. Reference actual numbers and timestamps from the data provided.
- If the instruction asks to check for "new", "recent", or "any" transactions, look at the timestamp of the transactions in the data. If ANY transaction occurred within the last 2 minutes of the \`currentTime\` provided in the real-time data, consider the condition MET (triggered).

Respond ONLY with valid JSON: { "outcome": "triggered" | "not_triggered", "reasoning": string, "actionTaken": string }`;

export interface EvaluationResult {
  outcome: DecisionOutcome;
  reasoning: string;
  actionTaken: string;
}

export async function evaluateCondition(
  instruction: ParsedInstruction,
  realTimeData: Record<string, unknown>
): Promise<EvaluationResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prompt = `Instruction: ${instruction.raw}
Condition Type: ${instruction.conditionType}
Target: ${instruction.target}
Threshold: ${instruction.threshold} ${instruction.thresholdUnit}

Real-time data:
${JSON.stringify(realTimeData, null, 2)}`;

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
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content || "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from Groq response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    outcome: string;
    reasoning: string;
    actionTaken: string;
  };

  return {
    outcome:
      parsed.outcome === "triggered" ? "triggered" : "not_triggered",
    reasoning: parsed.reasoning || "No reasoning provided",
    actionTaken: parsed.actionTaken || "No action specified",
  };
}
