import { NextResponse } from "next/server";

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 12000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("IBM recipe detail timed out.")), timeoutMs)
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

function extractJsonObject(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("IBM response did not contain JSON.");
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const recipeName: string = body.recipeName;
    const ingredients: string[] = body.ingredients ?? [];
    const goal: string = body.goal ?? "balanced diet";
    const restrictions: string = body.restrictions ?? "";

    if (!recipeName) {
      return NextResponse.json(
        { error: "Missing recipeName." },
        { status: 400 }
      );
    }

    const url = process.env.IBM_WATSONX_URL;
    const projectId = process.env.IBM_WATSONX_PROJECT_ID;
    const modelId =
      process.env.IBM_WATSONX_TEXT_MODEL_ID ||
      "meta-llama/llama-3-3-70b-instruct";

    if (!url) throw new Error("Missing IBM_WATSONX_URL.");
    if (!projectId) throw new Error("Missing IBM_WATSONX_PROJECT_ID.");

    const accessToken = await getIbmAccessToken();

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
              role: "system",
              content:
                "You are a practical cooking assistant. Return only valid JSON. Do not use markdown.",
            },
            {
              role: "user",
              content: `Create clear cooking instructions for this recipe.

Recipe name: ${recipeName}
Available ingredients: ${ingredients.join(", ")}
User goal: ${goal}
Dietary restrictions: ${restrictions || "none"}

Return ONLY this JSON:
{
  "name": "${recipeName}",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "steps": [
    "specific cooking step 1",
    "specific cooking step 2",
    "specific cooking step 3"
  ],
  "nutrition": {
    "calories": 450,
    "protein": 28,
    "fiber": 6,
    "vitaminA": 35
  }
}

Rules:
- Give 3 to 5 specific cooking steps.
- Use mostly the listed ingredients.
- Pantry basics like salt, pepper, oil, soy sauce, garlic, or spices are allowed.
- Do not write generic steps like "prepare ingredients" or "cook everything".
- Keep it practical for a home cook.
- Estimate nutrition for one normal serving.
- calories must be kcal.
- protein and fiber must be grams.
- vitaminA must be percent daily value.
- If exact quantity is unclear, make a reasonable estimate based on a normal serving.`,
            },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      }),
      12000
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`IBM recipe detail failed: ${text}`);
    }

    const data = await response.json();

    const text =
      data?.choices?.[0]?.message?.content ??
      data?.results?.[0]?.generated_text ??
      "";

    const parsed = extractJsonObject(String(text));

    return NextResponse.json({
      source: "ibm watsonx.ai",
      recipe: {
        name: parsed.name || recipeName,
        ingredients: Array.isArray(parsed.ingredients)
          ? parsed.ingredients.map(String)
          : ingredients,
        steps: Array.isArray(parsed.steps)
          ? parsed.steps.map(String).slice(0, 5)
          : [
              "Cook the main ingredients in a pan until done.",
              "Season to taste.",
              "Serve warm.",
            ],
        nutrition: {
          calories: Number(parsed.nutrition?.calories ?? 450),
          protein: Number(parsed.nutrition?.protein ?? 25),
          fiber: Number(parsed.nutrition?.fiber ?? 6),
          vitaminA: Number(parsed.nutrition?.vitaminA ?? 25),
        },
      },
    });;
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      source: "local fallback",
      recipe: null,
      error:
        error?.message ||
        "Could not generate recipe details. Using local fallback.",
    });
  }
}