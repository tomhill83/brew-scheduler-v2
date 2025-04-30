export async function fetchRecipes() {
  const endpoint = "https://script.google.com/macros/s/AKfycbw1W4eFCe8iVROuZIvC_kpOH3r09M7sGcepd-BpeIyu0LNJCXXZO5UXZ9gc1xTSAkSjpg/exec?action=getRecipesForWebApp";
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data || []; // ← You’re returning an array directly, not `{ recipes: [...] }`
  } catch (err) {
    console.error("Error fetching recipes:", err);
    return [];
  }
}



