import { NextResponse } from "next/server";

type FridgeItem = {
  name: string;
  boughtDate?: string | null;
  opened?: boolean | null;
};

type AnalyzedItem = FridgeItem & {
  estimatedDaysLeft: number | null;
  estimatedExpiryDate: string | null;
  risk: string;
  message?: string;
};

type MealPlan = {
  source: string;
  summary: string;
  goalAdvice: string;
  useFirst: string[];
  missingDates: string[];
  plan: {
    day: number;
    breakfast: string;
    lunch: string;
    dinner: string;
    reason: string;
  }[];
  restrictions: string;
  note: string;
};

const shelfLifeDays: Record<string, number> = {
  milk: 7,
  eggs: 28,
  egg: 28,
  chicken: 2,
  beef: 3,
  steak: 3,
  pork: 3,
  fish: 2,
  salmon: 2,
  shrimp: 2,
  spinach: 5,
  lettuce: 5,
  kale: 5,
  apple: 21,
  banana: 5,
  orange: 21,
  berries: 4,
  strawberry: 4,
  yogurt: 10,
  rice: 365,
  bread: 5,
  cheese: 14,
  tomato: 7,
  tomatoes: 7,
  pasta: 365,
  broccoli: 5,
  carrot: 21,
  potato: 30,
  avocado: 4,
  tofu: 5,
  beans: 365,
  tuna: 365,
  oats: 365,
};

const proteins = [
  "chicken",
  "beef",
  "steak",
  "pork",
  "fish",
  "salmon",
  "shrimp",
  "egg",
  "eggs",
  "tofu",
  "beans",
  "tuna",
  "yogurt",
  "cheese",
];

const carbs = ["rice", "bread", "pasta", "potato", "oats"];

const vegetables = [
  "spinach",
  "lettuce",
  "kale",
  "tomato",
  "tomatoes",
  "broccoli",
  "carrot",
  "avocado",
];

const fruits = ["apple", "banana", "orange", "berries", "strawberry"];

function normalize(name: string) {
  return name.toLowerCase().trim();
}

function matchesAny(item: string, list: string[]) {
  return list.some((word) => item.includes(word));
}

function estimateExpiry(item: FridgeItem): AnalyzedItem {
  const normalized = normalize(item.name);

  const matchedKey =
    Object.keys(shelfLifeDays).find((key) => normalized.includes(key)) ??
    normalized;

  const days = shelfLifeDays[matchedKey] ?? 7;

  if (!item.boughtDate) {
    return {
      ...item,
      estimatedDaysLeft: null,
      estimatedExpiryDate: null,
      risk: "unknown",
      message:
        "Purchase date missing. Add when you bought it for a better expiry estimate.",
    };
  }

  const bought = new Date(item.boughtDate);
  const expiry = new Date(bought);

  expiry.setDate(expiry.getDate() + days);

  const today = new Date();
  const diffMs = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let risk = "safe";

  if (daysLeft <= 0) risk = "expired_or_high_risk";
  else if (daysLeft <= 2) risk = "use_soon";
  else if (daysLeft <= 5) risk = "medium";

  return {
    ...item,
    estimatedDaysLeft: daysLeft,
    estimatedExpiryDate: expiry.toISOString().slice(0, 10),
    risk,
  };
}

function pickItems(items: AnalyzedItem[]) {
  const names = items.map((item) => item.name);
  const lowerNames = names.map(normalize);

  const protein =
    names.find((name, index) => matchesAny(lowerNames[index], proteins)) ??
    names[0] ??
    "available protein";

  const carb =
    names.find((name, index) => matchesAny(lowerNames[index], carbs)) ??
    "a simple carb";

  const vegetable =
    names.find((name, index) => matchesAny(lowerNames[index], vegetables)) ??
    names.find((name) => name !== protein) ??
    "vegetables";

  const fruit =
    names.find((name, index) => matchesAny(lowerNames[index], fruits)) ??
    "fruit";

  const urgent = items
    .filter(
      (item) =>
        item.risk === "use_soon" ||
        item.risk === "expired_or_high_risk" ||
        item.risk === "medium"
    )
    .map((item) => item.name);

  const firstPriority = urgent[0] ?? names[0] ?? "your freshest ingredient";

  return {
    names,
    protein,
    carb,
    vegetable,
    fruit,
    urgent,
    firstPriority,
  };
}

function makeGoalAdvice(goal: string) {
  const lowerGoal = goal.toLowerCase();

  if (lowerGoal.includes("lose")) {
    return "For weight loss, keep protein high, use more vegetables, and control portions of rice, bread, pasta, and sauces.";
  }

  if (lowerGoal.includes("gain")) {
    return "For weight gain, increase portions and add calorie-dense foods like rice, pasta, bread, yogurt, cheese, eggs, or healthy fats.";
  }

  if (lowerGoal.includes("maintain")) {
    return "For maintenance, keep meals balanced with protein, carbs, vegetables, and steady portions.";
  }

  return "For a balanced diet, combine protein, vegetables, and carbs while using foods with higher expiry risk first.";
}

function fallbackMealPlan(
  items: AnalyzedItem[],
  goal: string,
  restrictions: string
): MealPlan {
  const picked = pickItems(items);

  const urgentItems = items
    .filter(
      (item) =>
        item.risk === "use_soon" ||
        item.risk === "expired_or_high_risk" ||
        item.risk === "medium"
    )
    .map((item) => item.name);

  const missingDates = items
    .filter((item) => item.risk === "unknown")
    .map((item) => item.name);

  const lowerGoal = goal.toLowerCase();

  let breakfast1 = `${picked.protein} breakfast bowl with ${picked.fruit}`;
  let lunch1 = `${picked.protein} and ${picked.vegetable} bowl with ${picked.carb}`;
  let dinner1 = `${picked.firstPriority} stir-fry with ${picked.vegetable}`;

  let breakfast2 = `${picked.fruit} with yogurt, oats, or a simple protein side`;
  let lunch2 = `Leftover ${picked.protein} with ${picked.vegetable}`;
  let dinner2 = `${picked.vegetable} soup, pasta, or rice bowl`;

  let breakfast3 = `Quick breakfast using ${picked.fruit} and remaining fridge items`;
  let lunch3 = `${picked.protein} meal-prep bowl`;
  let dinner3 = `Final fridge-cleanout meal using ${picked.names
    .slice(0, 4)
    .join(", ")}`;

  if (lowerGoal.includes("lose")) {
    lunch1 = `Lean ${picked.protein} with extra ${picked.vegetable} and a smaller portion of ${picked.carb}`;
    dinner1 = `${picked.firstPriority} vegetable stir-fry with light sauce`;
    lunch2 = `High-protein bowl with ${picked.protein} and ${picked.vegetable}`;
    dinner2 = `${picked.vegetable} soup or salad with ${picked.protein}`;
  }

  if (lowerGoal.includes("gain")) {
    breakfast1 = `Larger ${picked.protein} breakfast with ${picked.carb} and ${picked.fruit}`;
    lunch1 = `${picked.protein} and ${picked.carb} power bowl with ${picked.vegetable}`;
    dinner1 = `${picked.firstPriority} stir-fry with extra ${picked.carb}`;
    lunch2 = `Large leftover bowl with ${picked.protein}, ${picked.carb}, and ${picked.vegetable}`;
    dinner2 = `${picked.vegetable} pasta or rice bowl with extra protein`;
  }

  return {
    source: "local fallback",
    summary: `3-day meal plan based on: ${picked.names.join(", ")}`,
    goalAdvice: makeGoalAdvice(goal),
    useFirst: urgentItems,
    missingDates,
    plan: [
      {
        day: 1,
        breakfast: breakfast1,
        lunch: lunch1,
        dinner: dinner1,
        reason: urgentItems.length
          ? `Uses higher-risk food first: ${urgentItems.join(", ")}.`
          : `Starts with ${picked.firstPriority} because it is already in your fridge.`,
      },
      {
        day: 2,
        breakfast: breakfast2,
        lunch: lunch2,
        dinner: dinner2,
        reason: `Reuses ${picked.protein}, ${picked.vegetable}, and ${picked.carb} in different combinations so the meals do not feel identical.`,
      },
      {
        day: 3,
        breakfast: breakfast3,
        lunch: lunch3,
        dinner: dinner3,
        reason: "Clears remaining ingredients before adding more groceries.",
      },
    ],
    restrictions,
    note: "This is a local fallback meal plan.",
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 12000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("IBM watsonx.ai timed out.")), timeoutMs)
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

function validateMealPlan(value: any): MealPlan {
  if (!value || typeof value !== "object") {
    throw new Error("Meal plan is not an object.");
  }

  if (!Array.isArray(value.plan) || value.plan.length < 1) {
    throw new Error("Meal plan missing plan array.");
  }

  return {
    source: value.source || "ibm watsonx.ai",
    summary: value.summary || "AI-generated meal plan.",
    goalAdvice: value.goalAdvice || "",
    useFirst: Array.isArray(value.useFirst) ? value.useFirst : [],
    missingDates: Array.isArray(value.missingDates) ? value.missingDates : [],
    plan: value.plan.slice(0, 3).map((day: any, index: number) => ({
      day: Number(day.day || index + 1),
      breakfast: String(day.breakfast || "Simple breakfast using fridge items"),
      lunch: String(day.lunch || "Simple lunch using fridge items"),
      dinner: String(day.dinner || "Simple dinner using fridge items"),
      reason: String(day.reason || "Uses available fridge items."),
    })),
    restrictions: value.restrictions || "",
    note: value.note || "Generated by IBM watsonx.ai.",
  };
}

async function generateMealPlanWithWatsonx(
  analyzedItems: AnalyzedItem[],
  goal: string,
  restrictions: string
): Promise<MealPlan> {
  const url = process.env.IBM_WATSONX_URL;
  const projectId = process.env.IBM_WATSONX_PROJECT_ID;
  const modelId =
    process.env.IBM_WATSONX_TEXT_MODEL_ID || "ibm/granite-3-8b-instruct";

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
              "You are a practical meal-planning assistant. Return only valid JSON. Do not use markdown. Do not include medical advice.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Create a 3-day meal plan from these fridge items.

Fridge items:
${JSON.stringify(analyzedItems, null, 2)}

User goal: ${goal}
Dietary restrictions: ${restrictions || "none"}

Return ONLY this exact JSON shape:
{
  "source": "ibm watsonx.ai",
  "summary": "3-day meal plan based on the fridge items.",
  "goalAdvice": "short practical advice based on the user's goal",
  "useFirst": ["item names that should be used first"],
  "missingDates": ["item names with missing purchase dates"],
  "plan": [
    {
      "day": 1,
      "breakfast": "recipe name",
      "lunch": "recipe name",
      "dinner": "recipe name",
      "reason": "why this day uses the fridge items well"
    },
    {
      "day": 2,
      "breakfast": "recipe name",
      "lunch": "recipe name",
      "dinner": "recipe name",
      "reason": "why this day uses the fridge items well"
    },
    {
      "day": 3,
      "breakfast": "recipe name",
      "lunch": "recipe name",
      "dinner": "recipe name",
      "reason": "why this day uses the fridge items well"
    }
  ],
  "restrictions": "${restrictions || ""}",
  "note": "Generated by IBM watsonx.ai."
}

Rules:
- Use the actual fridge items.
- Prioritize items with risk "use_soon", "medium", or "expired_or_high_risk".
- Do not invent expensive ingredients.
- Keep recipe names short.
- Return JSON only.`,
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    }),
    12000
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`IBM watsonx.ai failed: ${text}`);
  }

  const data = await response.json();

  const text =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.message?.content?.[0]?.text ??
    data?.results?.[0]?.generated_text ??
    "";

  if (!text) {
    throw new Error("IBM watsonx.ai returned empty text.");
  }

  const parsed = extractJsonObject(
    typeof text === "string" ? text : JSON.stringify(text)
  );

  return validateMealPlan(parsed);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const items: FridgeItem[] = body.items ?? [];
    const goal: string = body.goal ?? "balanced diet";
    const restrictions: string = body.restrictions ?? "";

    if (!items.length) {
      return NextResponse.json(
        { error: "Please add at least one fridge item." },
        { status: 400 }
      );
    }

    const analyzedItems = items.map(estimateExpiry);

    try {
      const mealPlan = await generateMealPlanWithWatsonx(
        analyzedItems,
        goal,
        restrictions
      );

      return NextResponse.json({
        items: analyzedItems,
        mealPlan,
        warning: null,
      });
    } catch (ibmError: any) {
      console.error("IBM watsonx.ai failed. Using fallback.", ibmError);

      return NextResponse.json({
        items: analyzedItems,
        mealPlan: fallbackMealPlan(analyzedItems, goal, restrictions),
        warning:
          ibmError?.message ||
          "Using local fallback meal planner because IBM watsonx.ai failed.",
      });
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong while generating the meal plan." },
      { status: 500 }
    );
  }
}