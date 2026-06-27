import { NextRequest } from "next/server";
import { streamCopilotResponse } from "@/lib/ai/copilot";
import { CopilotMessage, Instruction, AgentRecord } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages: CopilotMessage[];
      walletAddress: string;
      context: {
        instructions: Instruction[];
        recentRecords: AgentRecord[];
      };
    };

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid messages" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = streamCopilotResponse(
            body.messages,
            body.context?.instructions || [],
            body.context?.recentRecords || [],
            body.walletAddress
          );

          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(
            encoder.encode(`Error: ${message}`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: `Copilot error: ${message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
