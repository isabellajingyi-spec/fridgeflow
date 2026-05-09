import { NextResponse } from "next/server";

function cleanQuery(query: string) {
  return query
    .toLowerCase()
    .replace(/day \d+/g, "")
    .replace(/breakfast|lunch|dinner/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const recipeName: string = body.recipeName || "";
    const ingredients: string[] = body.ingredients || [];

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      return NextResponse.json(
        { error: "Missing UNSPLASH_ACCESS_KEY." },
        { status: 500 }
      );
    }

    const query =
      cleanQuery(recipeName) ||
      ingredients.slice(0, 3).join(" ") ||
      "healthy food bowl";

    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", `${query} food`);
    url.searchParams.set("per_page", "5");
    url.searchParams.set("orientation", "landscape");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Unsplash failed: ${text}`);
    }

    const data = await response.json();
    const photo = data.results?.[0];

    if (!photo) {
      return NextResponse.json({
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
        source: "fallback",
      });
    }

    return NextResponse.json({
      image: photo.urls.regular,
      alt: photo.alt_description || recipeName,
      source: "unsplash",
      credit: {
        photographer: photo.user?.name,
        photographerUrl: photo.user?.links?.html,
      },
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
      source: "fallback",
      error: error?.message || "Could not fetch recipe image.",
    });
  }
}