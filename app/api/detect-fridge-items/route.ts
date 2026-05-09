import { NextResponse } from "next/server";

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
      setTimeout(() => reject(new Error("IBM vision model timed out.")), timeoutMs)
    ),
  ]);
}

async function getIbmAccessToken() {
  const apiKey = process.env.IBM_WATSONX_API_KEY;

  if (!apiKey) {
    throw new Error("Missing IBM_WATSONX_API_KEY.");
  }

  const response = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: apiKey,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`IBM IAM token failed: ${text}`);
  }

  const data = await response.json();
  return data.access_token as string;
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

    const url = process.env.IBM_WATSONX_URL;
    const projectId = process.env.IBM_WATSONX_PROJECT_ID;
    const modelId =
      process.env.IBM_WATSONX_VISION_MODEL_ID ||
      "meta-llama/llama-3-2-11b-vision-instruct";

    if (!url) throw new Error("Missing IBM_WATSONX_URL.");
    if (!projectId) throw new Error("Missing IBM_WATSONX_PROJECT_ID.");

    const accessToken = await getIbmAccessToken();
    const base64 = cleanBase64(imageBase64);

    const response = await withTimeout(
      fetch(`${url}/ml/v1/text/chat?version=2024-10-10`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          model_id: modelId,
          project_id: projectId,
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
- Maximum 15 items.
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
          temperature: 0,
          max_tokens: 200,
        }),
      }),
      12000
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`IBM vision failed: ${text}`);
    }

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content;

    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
        ? content.find((item: any) => item?.type === "text")?.text ||
          content[0]?.text ||
          ""
        : "";

        console.log("IBM vision raw text:", text);

        let items: string[] = [];
        
        try {
          const parsed = extractJson(text);
          items = cleanItems(parsed.items);
        } catch {
          items = cleanItems(
            text
              .split(/,|\n|-/)
              .map((item) =>
                item
                  .replace(/^\d+\./, "")
                  .replace(/["{}[\]]/g, "")
                  .trim()
              )
              .filter(Boolean)
          );
        }

    if (!items.length) {
      return NextResponse.json({
        source: "manual fallback",
        fallback: true,
        error:
          "IBM vision could not confidently identify fridge items. Please enter ingredients manually.",
        items: [],
        rawText: text,
      });
    }

    return NextResponse.json({
      source: "ibm watsonx.ai vision",
      fallback: false,
      items: items.map((name) => ({ name })),
      rawText: text,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      source: "manual fallback",
      fallback: true,
      error:
        error?.message === "IBM vision model timed out."
          ? "IBM vision is taking too long. Please enter the ingredients manually for now."
          : error?.message ||
            "Could not scan fridge image. Please enter ingredients manually.",
      items: [],
    });
  }
}