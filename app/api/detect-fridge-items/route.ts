import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.featherless.ai/v1",
  apiKey: process.env.FEATHERLESS_API_KEY,
});

function cleanBase64(dataUrl: string) {
  return dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found.");
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

function cleanItems(items: unknown) {
  if (!Array.isArray(items)) return [];

  return Array.from(
    new Set(
      items
        .map((item) => String(item).toLowerCase().trim())
        .filter(Boolean)
    )
  ).slice(0, 15);
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 12000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Vision model timed out.")), timeoutMs)
    ),
  ]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imageBase64 = body.imageBase64;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing imageBase64." },
        { status: 400 }
      );
    }

    const base64 = cleanBase64(imageBase64);

    const response = await withTimeout(
      client.chat.completions.create({
        model:
          process.env.FEATHERLESS_VISION_MODEL ||
          "OptimusePrime/Magistral-Small-2506-Vision",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Identify visible fridge food items only.

Return ONLY this JSON:
{"items":["item1","item2","item3"]}

Rules:
- Maximum 10 items.
- No repeated items.
- Do not guess hidden food.
- Do not explain.
- Do not write recipes.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0,
      }),
      12000
    );

    const text = response.choices[0]?.message?.content || "";
    const parsed = extractJson(text);
    const items = cleanItems(parsed.items);

    if (!items.length) {
      return NextResponse.json({
        source: "manual fallback",
        fallback: true,
        error:
          "The AI could not confidently identify fridge items. Please enter the ingredients manually.",
        items: [],
        rawText: text,
      });
    }

    return NextResponse.json({
      source: "featherless vision",
      fallback: false,
      items: items.map((name) => ({ name })),
      rawText: text,
    });
  } catch (error: any) {
    console.error(error);

    const timedOut = error?.message === "Vision model timed out.";

    return NextResponse.json({
      source: "manual fallback",
      fallback: true,
      error: timedOut
        ? "The vision model is taking too long. Please enter the ingredients manually for now."
        : error?.error?.message ||
          error?.message ||
          "Could not scan fridge image. Please enter the ingredients manually.",
      items: [],
    });
  }
}