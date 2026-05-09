"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  ChefHat,
  Clock,
  Sparkles,
  ScanLine,
  ArrowRight,
  Leaf,
  Dumbbell,
  Moon,
  ShoppingBag,
  Utensils,
  Flame,
  Beef,
  Carrot,
  CheckCircle2,
} from "lucide-react";

type Recipe = {
  name: string;
  time: string;
  tag: string;
  image: string;
  ingredients: string[];
  steps: string[];
  nutrition: {
    calories: number;
    protein: number;
    fiber: number;
    vitaminA: number;
  };
};

type MealPlanDay = {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  reason: string;
};

type MealPlan = {
  source: string;
  summary: string;
  goalAdvice: string;
  useFirst: string[];
  missingDates: string[];
  plan: MealPlanDay[];
  restrictions: string;
  note: string;
};

type ResultItem = {
  name: string;
  estimatedDaysLeft: number | null;
  estimatedExpiryDate?: string | null;
  risk: string;
  message?: string;
};

type StorageItem = {
  name: string;
  added: string;
  place: string;
  status: string;
  risk: string;
};

const heroSlides = [
  {
    title: "Turn What’s in Your Fridge Into Today’s Meal",
    subtitle: "Eat well, waste less, and make the most of what you already have.",
    slogan: "Cook smart. Waste less. Feel better.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2200&q=90",
  },
  {
    title: "Fresh Food Should Become Dinner, Not Waste",
    subtitle: "FridgeFlow helps you use what is already at home before it expires.",
    slogan: "From fridge to fork.",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=2200&q=90",
  },
  {
    title: "Healthy Meals Without Starting From Zero",
    subtitle: "Scan your fridge, edit the ingredients, and get meals that fit your day.",
    slogan: "Simple meals. Better choices.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=2200&q=90",
  },
  {
    title: "Plan Less. Cook Better. Waste Less.",
    subtitle: "A warmer way to manage food, nutrition, and grocery planning.",
    slogan: "Good food starts at home.",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=2200&q=90",
  },
];

const recipes: Recipe[] = [
  {
    name: "Tomato & Egg Stir Fry",
    time: "12 min",
    tag: "Comfort meal",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=85",
    ingredients: ["eggs", "tomatoes", "green onion", "rice"],
    steps: [
      "Scramble eggs until soft and just set.",
      "Cook tomatoes until juicy and lightly softened.",
      "Return eggs to the pan, season, and serve with rice.",
    ],
    nutrition: { calories: 420, protein: 22, fiber: 5, vitaminA: 35 },
  },
  {
    name: "Broccoli Chicken Bowl",
    time: "18 min",
    tag: "High protein",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
    ingredients: ["chicken", "broccoli", "rice", "garlic"],
    steps: [
      "Cook chicken with garlic until done.",
      "Steam or stir-fry broccoli until bright green.",
      "Serve over rice with a light sauce.",
    ],
    nutrition: { calories: 560, protein: 42, fiber: 8, vitaminA: 45 },
  },
  {
    name: "Creamy Yogurt Fruit Bowl",
    time: "5 min",
    tag: "Quick breakfast",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=85",
    ingredients: ["Greek yogurt", "banana", "berries", "honey"],
    steps: [
      "Spoon yogurt into a bowl.",
      "Add sliced fruit on top.",
      "Finish with honey, granola, or nuts if available.",
    ],
    nutrition: { calories: 330, protein: 24, fiber: 6, vitaminA: 12 },
  },
  {
    name: "Leftover Fried Rice",
    time: "15 min",
    tag: "Zero waste",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85",
    ingredients: ["leftover rice", "egg", "vegetables", "soy sauce"],
    steps: [
      "Heat leftover rice until it separates.",
      "Add egg and vegetables.",
      "Season and stir-fry until hot.",
    ],
    nutrition: { calories: 500, protein: 18, fiber: 7, vitaminA: 30 },
  },
  {
    name: "Spinach Garlic Pasta",
    time: "20 min",
    tag: "Use greens first",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85",
    ingredients: ["spinach", "pasta", "garlic", "milk"],
    steps: [
      "Boil pasta until al dente.",
      "Cook garlic and spinach in a pan.",
      "Toss with pasta and a splash of milk or cream.",
    ],
    nutrition: { calories: 610, protein: 20, fiber: 9, vitaminA: 80 },
  },
  {
    name: "Egg Avocado Toast",
    time: "8 min",
    tag: "Lazy mode",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85",
    ingredients: ["egg", "avocado", "toast", "pepper"],
    steps: [
      "Toast bread until crisp.",
      "Mash avocado with salt and pepper.",
      "Top with a cooked egg.",
    ],
    nutrition: { calories: 390, protein: 17, fiber: 10, vitaminA: 18 },
  },
];

const featureCards = [
  {
    icon: <Leaf className="h-5 w-5" />,
    title: "Clear My Fridge",
    text: "Use fresh food before it expires.",
  },
  {
    icon: <Moon className="h-5 w-5" />,
    title: "Lazy Mode",
    text: "Simple meals for low-energy days.",
  },
  {
    icon: <Dumbbell className="h-5 w-5" />,
    title: "Fitness Mode",
    text: "Meals that support your goals.",
  },
  {
    icon: <ShoppingBag className="h-5 w-5" />,
    title: "Smart Grocery",
    text: "Only buy what you actually need.",
  },
];

const defaultStorageItems: StorageItem[] = [
  {
    name: "Mushrooms",
    added: "May 7",
    place: "Fridge drawer",
    status: "Use soon",
    risk: "use_soon",
  },
  {
    name: "Tomatoes",
    added: "May 8",
    place: "Produce shelf",
    status: "Fresh",
    risk: "safe",
  },
  {
    name: "Spinach",
    added: "May 6",
    place: "Fridge drawer",
    status: "Use soon",
    risk: "use_soon",
  },
  {
    name: "Eggs",
    added: "May 6",
    place: "Middle shelf",
    status: "Fresh",
    risk: "safe",
  },
  {
    name: "Milk",
    added: "May 5",
    place: "Door shelf",
    status: "Use soon",
    risk: "medium",
  },
  {
    name: "Chicken",
    added: "May 7",
    place: "Lower shelf",
    status: "Cook today",
    risk: "cook_today",
  },
];

function progressPercent(value: number, goal: number) {
  return Math.min(100, Math.round((value / goal) * 100));
}

function getBmiCategory(bmi: number | null) {
  if (!bmi) return "Add height and weight";
  if (bmi < 18.5) return "Underweight range";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Overweight range";
  return "Higher BMI range";
}

function riskClass(risk: string) {
  if (risk === "expired_or_high_risk") return "bg-red-100 text-red-700";
  if (risk === "use_soon" || risk === "cook_today") return "bg-[#fff0df] text-[#c2410c]";
  if (risk === "medium") return "bg-[#fff7cc] text-[#854d0e]";
  if (risk === "unknown") return "bg-stone-100 text-stone-600";
  return "bg-[#eaf7df] text-[#3f6212]";
}

function riskLabel(risk: string) {
  if (risk === "expired_or_high_risk") return "High risk";
  if (risk === "use_soon") return "Use soon";
  if (risk === "cook_today") return "Cook today";
  if (risk === "medium") return "Medium";
  if (risk === "unknown") return "Unknown";
  return "Safe";
}

function getRecipeImage(recipeName: string) {
  const name = recipeName.toLowerCase();

  if (name.includes("egg")) {
    return "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85";
  }

  if (
    name.includes("banana") ||
    name.includes("fruit") ||
    name.includes("yogurt") ||
    name.includes("oats")
  ) {
    return "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=85";
  }

  if (name.includes("rice") || name.includes("bowl")) {
    return "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85";
  }

  if (name.includes("pasta") || name.includes("noodle")) {
    return "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85";
  }

  if (
    name.includes("salad") ||
    name.includes("avocado") ||
    name.includes("spinach") ||
    name.includes("lettuce")
  ) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85";
  }

  if (
    name.includes("chicken") ||
    name.includes("steak") ||
    name.includes("beef") ||
    name.includes("pork") ||
    name.includes("fish") ||
    name.includes("salmon")
  ) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85";
  }

  if (name.includes("bread") || name.includes("toast")) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85";
  }

  if (name.includes("stir-fry") || name.includes("stir fry")) {
    return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85";
  }

  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85";
}

function getRecipeIngredients(recipeName: string, userIngredients: string[]) {
  const lowerRecipeName = recipeName.toLowerCase();

  const matched = userIngredients.filter((ingredient) => {
    const cleanIngredient = ingredient.toLowerCase().trim();
    if (!cleanIngredient) return false;

    const firstWord = cleanIngredient.split(" ")[0];

    return (
      lowerRecipeName.includes(cleanIngredient) ||
      lowerRecipeName.includes(firstWord)
    );
  });

  if (matched.length) return matched;

  return userIngredients.slice(0, 3);
}

function getRecipeSteps(recipeName: string, recipeIngredients: string[]) {
  return [
    `Prepare ${recipeIngredients.join(", ")}.`,
    `Cook the main ingredients for: ${recipeName}.`,
    "Season, taste, and serve while warm.",
  ];
}

function getFoodStoragePlace(name: string) {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes("milk") ||
    lowerName.includes("yogurt") ||
    lowerName.includes("cheese")
  ) {
    return "Door or dairy shelf";
  }

  if (
    lowerName.includes("spinach") ||
    lowerName.includes("lettuce") ||
    lowerName.includes("tomato") ||
    lowerName.includes("broccoli") ||
    lowerName.includes("carrot") ||
    lowerName.includes("mushroom")
  ) {
    return "Fridge drawer";
  }

  if (
    lowerName.includes("chicken") ||
    lowerName.includes("beef") ||
    lowerName.includes("steak") ||
    lowerName.includes("fish") ||
    lowerName.includes("salmon")
  ) {
    return "Lower shelf";
  }

  if (lowerName.includes("egg")) {
    return "Middle shelf";
  }

  return "Fridge shelf";
}

function getStatusFromResultItem(item: ResultItem) {
  if (item.risk === "expired_or_high_risk") return "High risk";
  if (item.risk === "use_soon") return "Use soon";
  if (item.risk === "medium") return "Medium";
  if (item.risk === "unknown") return "Unknown";
  return "Fresh";
}

export default function FridgeFlowWebsite() {
  const [slide, setSlide] = useState(0);
  const [itemsText, setItemsText] = useState(
    "eggs, tomatoes, spinach, milk, yogurt, broccoli, chicken"
  );
  const [photoName, setPhotoName] = useState("");
  const [scanned, setScanned] = useState(false);
  const [goal, setGoal] = useState("balanced diet");
  const [boughtDate, setBoughtDate] = useState("");
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(55);
  const [restrictions, setRestrictions] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultItems, setResultItems] = useState<ResultItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    fiber: 0,
    vitaminA: 0,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const bmi = useMemo(() => {
    if (!height || !weight) return null;
    return Number((weight / (height / 100) ** 2).toFixed(1));
  }, [height, weight]);

  const ingredients = useMemo(() => {
    return itemsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [itemsText]);

  const matchedRecipes = useMemo(() => {
    return recipes.filter((recipe) =>
      recipe.ingredients.some((ingredient) =>
        ingredients.some((item) =>
          item.toLowerCase().includes(ingredient.toLowerCase().split(" ")[0])
        )
      )
    );
  }, [ingredients]);

  const recommendedRecipes: Recipe[] = useMemo(() => {
    if (!mealPlan?.plan?.length) return [];

    return mealPlan.plan.flatMap((day) => {
      const meals = [
        { mealType: "Breakfast", name: day.breakfast, time: "10 min" },
        { mealType: "Lunch", name: day.lunch, time: "18 min" },
        { mealType: "Dinner", name: day.dinner, time: "22 min" },
      ];

      return meals.map((meal) => {
        const recipeIngredients = getRecipeIngredients(meal.name, ingredients);

        return {
          name: meal.name,
          time: meal.time,
          tag: `Day ${day.day} · ${meal.mealType}`,
          image: getRecipeImage(meal.name),
          ingredients: recipeIngredients,
          steps: getRecipeSteps(meal.name, recipeIngredients),
          nutrition: {
            calories:
              meal.mealType === "Breakfast"
                ? 350
                : meal.mealType === "Lunch"
                ? 550
                : 650,
            protein:
              meal.mealType === "Breakfast"
                ? 18
                : meal.mealType === "Lunch"
                ? 32
                : 38,
            fiber:
              meal.mealType === "Breakfast"
                ? 5
                : meal.mealType === "Lunch"
                ? 8
                : 9,
            vitaminA:
              meal.mealType === "Breakfast"
                ? 15
                : meal.mealType === "Lunch"
                ? 35
                : 45,
          },
        };
      });
    });
  }, [mealPlan, ingredients]);

  const recipesToShow = recommendedRecipes.length
    ? recommendedRecipes
    : matchedRecipes.length
    ? matchedRecipes
    : recipes;

  const storageItems: StorageItem[] = useMemo(() => {
    if (!resultItems.length) return defaultStorageItems;

    return resultItems.map((item) => ({
      name: item.name,
      added: boughtDate || "Latest scan",
      place: getFoodStoragePlace(item.name),
      status: getStatusFromResultItem(item),
      risk: item.risk,
    }));
  }, [resultItems, boughtDate]);

  const grocerySuggestions = useMemo(() => {
    const lowerIngredients = ingredients.map((item) => item.toLowerCase());

    const basics = [
      "Broccoli 🥦",
      "Chicken breast 🍗",
      "Greek yogurt 🥛",
      "Bananas 🍌",
      "Rice 🍚",
      "Eggs 🥚",
    ];

    return basics.filter((item) => {
      const plain = item.split(" ")[0].toLowerCase();
      return !lowerIngredients.some((ingredient) => ingredient.includes(plain));
    });
  }, [ingredients]);
  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
  
      reader.readAsDataURL(file);
    });
  }
  async function simulatePhotoScan(file?: File) {
    if (!file) return;
  
    try {
      setLoading(true);
      setPhotoName(file.name);
  
      const imageBase64 = await fileToBase64(file);
  
      const response = await fetch("/api/detect-fridge-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64 }),
      });
  
      const data = await response.json();
  
      console.log("Fridge scan response:", data);
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to scan fridge.");
      }
  
      const detectedNames = data.items
        .map((item: { name: string }) => item.name)
        .filter(Boolean);
  
      setItemsText(detectedNames.join(", "));
      setScanned(true);
    } catch (error) {
      console.error(error);
      alert("Could not scan the fridge photo.");
    } finally {
      setLoading(false);
    }
  }

  async function generateMealPlan() {
    try {
      setLoading(true);

      const items = ingredients.map((name) => ({
        name,
        boughtDate: boughtDate || null,
        opened: null,
      }));

      const response = await fetch("/api/meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          goal,
          restrictions,
        }),
      });

      const data = await response.json();

      console.log("Meal plan response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate meal plan.");
      }

      setResultItems(data.items);
      setMealPlan(data.mealPlan);

      window.setTimeout(() => {
        document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error(error);
      alert("Could not generate meal plan.");
    } finally {
      setLoading(false);
    }
  }

  async function cookNow(recipe: Recipe) {
    let aiRecipe: any = null;
    setSelectedRecipe({
      ...recipe,
      steps: ["Generating AI cooking steps..."],
    });
  
    try {
      const response = await fetch("/api/recipe-detail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeName: recipe.name,
          ingredients: recipe.ingredients,
          goal,
          restrictions,
        }),
      });
  
      const data = await response.json();
  
      aiRecipe = data.recipe;
  
      if (aiRecipe?.steps?.length) {
        setSelectedRecipe({
          ...recipe,
          name: aiRecipe.name || recipe.name,
          ingredients: aiRecipe.ingredients?.length
            ? aiRecipe.ingredients
            : recipe.ingredients,
          steps: aiRecipe.steps,
        });
      } else {
        setSelectedRecipe(recipe);
      }
    } catch (error) {
      console.error(error);
      setSelectedRecipe(recipe);
    }
  
    const nutritionToAdd = aiRecipe?.nutrition ?? recipe.nutrition;

    setNutrition((current) => ({
      calories: current.calories + Number(nutritionToAdd.calories ?? 0),
      protein: current.protein + Number(nutritionToAdd.protein ?? 0),
      fiber: current.fiber + Number(nutritionToAdd.fiber ?? 0),
      vitaminA: current.vitaminA + Number(nutritionToAdd.vitaminA ?? 0),
    }));
  
    document.getElementById("recipe-detail")?.scrollIntoView({ behavior: "smooth" });
  }

  const activeHero = heroSlides[slide];

  return (
    <div className="min-h-screen bg-[#fff7ec] text-[#1f1a17]">
      <nav className="fixed left-0 right-0 top-0 z-50 bg-[#fff7ec]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 text-2xl font-black">
            <div className="rounded-2xl bg-[#ff6a00] p-2 text-white shadow-lg shadow-orange-200">
              <ChefHat className="h-6 w-6" />
            </div>
            FridgeFlow
          </div>

          <div className="hidden items-center gap-7 text-sm font-bold text-stone-700 md:flex">
            <a href="#scan">Scan</a>
            <a href="#recipes">Meals</a>
            <a href="#nutrition">Nutrition</a>
            <a href="#waste">Waste Less</a>
            <a href="#storage">Storage</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative min-h-screen overflow-hidden pt-20">
          {heroSlides.map((item, index) => (
            <motion.img
              key={item.image}
              src={item.image}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
              initial={false}
              animate={{
                opacity: index === slide ? 1 : 0,
                scale: index === slide ? 1.03 : 1,
              }}
              transition={{ duration: 0.9 }}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fff7ec] via-transparent to-transparent" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-6 py-20">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-5xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-black text-orange-100 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" /> {activeHero.slogan}
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-white drop-shadow md:text-7xl lg:text-8xl">
                {activeHero.title}
              </h1>

              <p className="mt-7 max-w-2xl text-xl leading-9 text-white/90 md:text-2xl">
                {activeHero.subtitle}
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#scan"
                  className="rounded-full bg-[#ff6a00] px-7 py-4 font-black text-white shadow-xl shadow-black/20 transition hover:bg-[#e85f00]"
                >
                  Start with my fridge
                </a>

                <a
                  href="#recipes"
                  className="rounded-full bg-white/90 px-7 py-4 font-black text-stone-900 shadow-xl backdrop-blur transition hover:bg-white"
                >
                  See meal ideas
                </a>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
            {heroSlides.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-3 rounded-full transition-all ${
                  index === slide ? "w-12 bg-[#ff6a00]" : "w-3 bg-white/70"
                }`}
              />
            ))}
          </div>
        </section>

        <section id="scan" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#d9480f]">
              Step 1 · scan or edit
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Tell FridgeFlow what you already have.
            </h2>
            <p className="mt-4 text-lg leading-8 text-stone-600">
              Scan your fridge, check the detected ingredients, then generate meals that actually match your kitchen.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-stone-200/60 lg:col-span-2">
              <label className="flex min-h-[300px] cursor-pointer flex-col justify-between rounded-[1.75rem] border-2 border-dashed border-orange-200 bg-[#fffaf2] p-7 transition hover:border-[#ff6a00] hover:bg-orange-50">
                <div>
                  <div className="inline-flex rounded-full bg-orange-100 p-4 text-[#d9480f]">
                    <ScanLine className="h-7 w-7" />
                  </div>

                  <h3 className="mt-5 text-2xl font-black">
                    Upload today’s fridge photo
                  </h3>

                  <p className="mt-3 leading-7 text-stone-600">
                    For better results, update your fridge photo daily. FridgeFlow will compare changes, detect what was added or used, and refresh meal plans automatically.
                  </p>
                </div>

                <div className="mt-6">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => simulatePhotoScan(event.target.files?.[0])}
                  />

                  <span className="inline-flex rounded-full bg-[#ff6a00] px-7 py-3 font-black text-white shadow-lg shadow-orange-200">
                    Upload Fridge Photo
                  </span>
                </div>
              </label>

              {photoName && (
                <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm font-bold text-[#d9480f]">
                  Detected from: {photoName}
                </p>
              )}

              <div className="mt-5 rounded-[1.5rem] bg-[#fffaf2] p-5">
                <p className="font-black text-stone-800">How it works later</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Once AI is connected, this scan will update ingredients, storage dates, food risk, and recipe plans automatically.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-stone-200/60 lg:col-span-3">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">Detected ingredients</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    AI result first, manual editing anytime.
                  </p>
                </div>

                {scanned && (
                  <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-black text-green-700">
                    <CheckCircle2 className="h-4 w-4" /> Scanned
                  </div>
                )}
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {ingredients.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#fff0df] px-4 py-2 text-sm font-black capitalize text-[#c2410c]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <label className="text-sm font-bold text-stone-700">
                Ingredient list
              </label>
              <textarea
                value={itemsText}
                onChange={(event) => setItemsText(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf2] p-4 outline-none focus:border-[#ff6a00]"
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-stone-700">Goal</label>
                  <select
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf2] p-4 outline-none focus:border-[#ff6a00]"
                  >
                    <option value="balanced diet">Balanced diet</option>
                    <option value="lose weight">Lose weight</option>
                    <option value="gain weight">Gain weight</option>
                    <option value="maintain weight">Maintain weight</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-stone-700">
                    Bought date / scan date
                  </label>
                  <input
                    type="date"
                    value={boughtDate}
                    onChange={(event) => setBoughtDate(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf2] p-4 outline-none focus:border-[#ff6a00]"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-orange-100 bg-[#fffaf2] p-4">
                <p className="font-black text-stone-800">Fridge update mode</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  Upload a new photo when your fridge changes. New items are logged as added, missing items are marked as used, and meal plans update based on the latest scan.
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-bold text-stone-700">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(event) => setHeight(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf2] p-4 outline-none focus:border-[#ff6a00]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-stone-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(event) => setWeight(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf2] p-4 outline-none focus:border-[#ff6a00]"
                  />
                </div>

                <div className="rounded-2xl bg-[#fff0df] p-4">
                  <p className="text-sm font-black text-[#c2410c]">
                    BMI preview
                  </p>
                  <p className="mt-1 text-3xl font-black">{bmi ?? "--"}</p>
                  <p className="text-xs text-stone-600">
                    {getBmiCategory(bmi)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-bold text-stone-700">
                  Dietary restrictions
                </label>
                <input
                  value={restrictions}
                  onChange={(event) => setRestrictions(event.target.value)}
                  placeholder="Example: vegetarian, halal, no dairy"
                  className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf2] p-4 outline-none focus:border-[#ff6a00]"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={generateMealPlan}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-full bg-[#ff6a00] px-7 py-4 font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#e85f00] disabled:opacity-60"
                >
                  <Camera className="h-5 w-5" />
                  {loading ? "Generating..." : "Generate Meal Plan"}
                </button>

                <a
                  href="#recipes"
                  className="rounded-full bg-[#fffaf2] px-7 py-4 font-black text-stone-800 shadow-sm transition hover:shadow-md"
                >
                  See Meals
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="recipes" className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#d9480f]">
                Step 2 · cook now
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                {recommendedRecipes.length
                  ? "Recommended from your fridge 🍽️"
                  : "You can make this right now 🍽️"}
              </h2>

             
            </div>

            <p className="hidden text-sm font-bold text-[#d9480f] md:block">
              Swipe / scroll →
            </p>
          </div>

          {mealPlan && (
            <div className="mb-6 rounded-[2rem] bg-white p-5 shadow-xl shadow-stone-200/60">
              <p className="font-black text-stone-800">{mealPlan.summary}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {mealPlan.goalAdvice}
              </p>
            </div>
          )}

          <div className="flex snap-x gap-6 overflow-x-auto pb-6 [scrollbar-width:thin]">
            {recipesToShow.map((recipe) => (
              <article
                key={`${recipe.tag}-${recipe.name}`}
                className="min-w-[330px] snap-start overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-stone-200/60 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="h-60 w-full bg-orange-50 object-cover"
                />

                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between text-sm text-stone-500">
                    <span>{recipe.tag}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {recipe.time}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black">{recipe.name}</h3>

                  <p className="mt-2 text-sm capitalize text-stone-600">
                    {recipe.ingredients.slice(0, 3).join(" · ")}
                  </p>

                  <button
                    onClick={() => cookNow(recipe)}
                    className="mt-5 flex items-center gap-2 rounded-full bg-[#fff0df] px-5 py-3 text-sm font-black text-[#c2410c] transition hover:bg-orange-100"
                  >
                    Cook Now <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="recipe-detail"
          className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-5"
        >
          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-stone-200/60 md:col-span-3">
            <div className="mb-4 flex items-center gap-2 text-[#d9480f]">
              <Utensils className="h-5 w-5" />
              <p className="font-black">Recipe detail</p>
            </div>

            {selectedRecipe ? (
              <div>
                <h2 className="text-3xl font-black">{selectedRecipe.name}</h2>
                <p className="mt-2 capitalize text-stone-600">
                  Ingredients: {selectedRecipe.ingredients.join(", ")}
                </p>

                <ol className="mt-5 space-y-3 text-sm leading-6 text-stone-700">
                  {selectedRecipe.steps.map((step, index) => (
                    <li key={step} className="rounded-2xl bg-[#fffaf2] p-4">
                      <strong>Step {index + 1}:</strong> {step}
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#fffaf2] p-5 text-stone-600">
                Click <strong>Cook Now</strong> on a recipe card to open the actual recipe here.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-[#496526] p-7 text-white shadow-xl shadow-stone-200/60 md:col-span-2">
            <h2 className="text-2xl font-black">Cooking updates nutrition</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              When the user cooks a recipe, FridgeFlow adds estimated calories, protein, fiber, and vitamin A to today’s goal.
            </p>

            {selectedRecipe && (
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/15 p-3">
                  <Flame className="mb-2 h-4 w-4" />
                  {selectedRecipe.nutrition.calories} kcal
                </div>

                <div className="rounded-2xl bg-white/15 p-3">
                  <Beef className="mb-2 h-4 w-4" />
                  {selectedRecipe.nutrition.protein} g protein
                </div>

                <div className="rounded-2xl bg-white/15 p-3">
                  <Leaf className="mb-2 h-4 w-4" />
                  {selectedRecipe.nutrition.fiber} g fiber
                </div>

                <div className="rounded-2xl bg-white/15 p-3">
                  <Carrot className="mb-2 h-4 w-4" />
                  {selectedRecipe.nutrition.vitaminA}% Vit A
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="nutrition" className="mx-auto max-w-7xl px-6 py-14">
          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-stone-200/60">
            <h2 className="text-4xl font-black">Daily Nutrition Goal 📊</h2>
            <p className="mt-2 text-stone-600">
              Cook a recipe and watch the bars grow.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[
                { label: "Calories", value: nutrition.calories, goal: 2000, unit: "kcal" },
                { label: "Protein", value: nutrition.protein, goal: 80, unit: "g" },
                { label: "Fiber", value: nutrition.fiber, goal: 25, unit: "g" },
                { label: "Vitamin A", value: nutrition.vitaminA, goal: 100, unit: "%" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-[#fffaf2] p-5">
                  <div className="flex items-center justify-between text-sm font-black">
                    <span>{item.label}</span>
                    <span>
                      {item.value}/{item.goal} {item.unit}
                    </span>
                  </div>

                  <div className="mt-3 h-4 overflow-hidden rounded-full bg-orange-100">
                    <div
                      className="h-full rounded-full bg-[#ff6a00] transition-all"
                      style={{ width: `${progressPercent(item.value, item.goal)}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-stone-500">
                    {progressPercent(item.value, item.goal)}% of daily goal
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="waste"
          className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-3"
        >
          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-stone-200/60 md:col-span-2">
            <h2 className="text-4xl font-black">Use these before they’re gone 🕒</h2>

            <a
              href="#storage"
              className="mt-5 inline-flex rounded-full bg-[#fff0df] px-5 py-3 text-sm font-black text-[#c2410c] transition hover:bg-orange-100"
            >
              See full fridge storage
            </a>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(resultItems.length
                ? resultItems.slice(0, 3)
                : [
                    {
                      name: "Spinach",
                      estimatedDaysLeft: null,
                      risk: "use_soon",
                      message: "Generate a plan to estimate expiry",
                    },
                    {
                      name: "Milk",
                      estimatedDaysLeft: null,
                      risk: "medium",
                      message: "Add a daily scan for better estimate",
                    },
                    {
                      name: "Tomatoes",
                      estimatedDaysLeft: null,
                      risk: "safe",
                      message: "Use fresh produce first",
                    },
                  ]
              ).map((food) => (
                <div key={food.name} className="rounded-3xl bg-[#fffaf2] p-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${riskClass(
                      food.risk
                    )}`}
                  >
                    {riskLabel(food.risk)}
                  </span>

                  <p className="mt-3 text-lg font-black capitalize">{food.name}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {food.message ??
                      (food.estimatedDaysLeft !== null
                        ? `${food.estimatedDaysLeft} day(s) left`
                        : "Add a scan date for better estimate")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#ff6a00] p-7 text-white shadow-xl shadow-orange-200">
            <h2 className="text-2xl font-black">Eat better without thinking too much</h2>
            <div className="mt-6 space-y-4 text-orange-50">
              <p>🥦 Balance protein, vegetables, and carbs.</p>
              <p>👍 Prioritize food that expires first.</p>
              <p>🍽️ Turn leftovers into real meals.</p>
              <p>✏️ Edit ingredients anytime.</p>
            </div>
          </div>
        </section>

        <section id="storage" className="mx-auto max-w-7xl px-6 py-14">
          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-stone-200/60">
            <h2 className="text-4xl font-black">Full Fridge Storage 🧊</h2>

            <p className="mt-2 text-stone-600">
              This section uses generated fridge items when you press Generate Meal Plan. Later, AI photo scans can update this automatically.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {storageItems.map((food) => (
                <div key={food.name} className="rounded-3xl bg-[#fffaf2] p-5">
                  <p className="text-lg font-black capitalize">{food.name}</p>
                  <p className="mt-2 text-sm text-stone-600">Added: {food.added}</p>
                  <p className="text-sm text-stone-600">Stored in: {food.place}</p>
                  <p
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${riskClass(
                      food.risk
                    )}`}
                  >
                    {food.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-stone-200/60">
            <h2 className="text-4xl font-black">A few things you might want 🛍️</h2>
            <p className="mt-2 text-stone-600">
              Grocery suggestions are based on common missing ingredients from your current fridge list.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {(grocerySuggestions.length
                ? grocerySuggestions
                : ["You already have the basics 👍"]
              ).map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#fff0df] px-4 py-2 font-bold text-stone-700"
                >
                  {item}
                </span>
              ))}
            </div>

            <button className="mt-6 rounded-full bg-[#ff6a00] px-5 py-3 font-black text-white">
              Add to shopping list
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[1.5rem] bg-white p-5 shadow-xl shadow-stone-200/60"
              >
                <div className="mb-3 inline-flex rounded-2xl bg-orange-100 p-3 text-[#d9480f]">
                  {feature.icon}
                </div>

                <h3 className="font-black">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 text-sm text-stone-500 md:flex-row md:items-center md:justify-between">
        <p>© 2026 FridgeFlow. Eat smart. Waste less.</p>
        <p>Built for hackathon demo · AI photo scan · BMI · Nutrition tracker</p>
      </footer>
    </div>
  );
}