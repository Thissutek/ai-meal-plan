import { UserPreferences, MealPlan, Meal, Ingredient } from "../../App";

// You'll need to set your OpenAI API key
const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface FlyerData {
  storeName: string;
  products: Product[];
}

export interface Product {
  name: string;
  price: number;
  category: string;
  unit?: string;
  originalText?: string;
}

export const processFlyers = async (
  imageUris: string[],
  preferences: UserPreferences,
): Promise<MealPlan> => {
  console.log(
    "Processing flyers with API key:",
    OPENAI_API_KEY ? "Present" : "Missing",
  );

  // Check if API key is available
  if (!OPENAI_API_KEY) {
    console.log("No valid API key found, using mock data");
    return createMockMealPlan(preferences);
  }

  try {
    // First, extract product data from flyer images
    const flyerData = await extractFlyerData(imageUris);

    // Check if we got any valid data
    const allProducts = flyerData.flatMap((flyer) => flyer.products);
    if (allProducts.length === 0) {
      console.log("No products extracted, using mock data");
      return createMockMealPlan(preferences);
    }

    // Then generate meal plan based on extracted data and preferences
    const mealPlan = await generateMealPlan(flyerData, preferences);

    return mealPlan;
  } catch (error) {
    console.error("Error processing flyers:", error);
    console.log("Falling back to mock meal plan");
    return createMockMealPlan(preferences);
  }
};

export const extractFlyerData = async (
  imageUris: string[],
): Promise<FlyerData[]> => {
  const flyerDataPromises = imageUris.map(async (uri) => {
    try {
      // Convert image to base64
      const base64Image = await convertImageToBase64(uri);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o", // Updated to use gpt-4o instead of gpt-4-vision-preview
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyze this grocery flyer and extract ALL food and beverage product information. Return ONLY a valid JSON object with this exact structure:
{
  "storeName": "store name if visible or Unknown Store",
  "products": [
    {
      "name": "product name",
      "price": 1.99,
      "category": "produce",
      "unit": "lb"
    }
  ]
}

Important rules:
- Return ONLY valid JSON, no extra text
- Include ALL food items, beverages, snacks, and cooking ingredients with clear prices
- Price must be a number, not a string
- If no products found, return empty products array
- Categories: produce, meat, dairy, pantry, snacks, beverages, frozen, bakery, deli, other
- Include: sodas, juices, beer, wine, chips, candy, frozen meals, bread, etc.`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1500,
            temperature: 0.1,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error: ${response.status} - ${errorText}`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      // Clean the content and try to parse JSON
      const cleanContent = content
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      try {
        const parsedData = JSON.parse(cleanContent);

        // Validate the structure
        if (!parsedData.products || !Array.isArray(parsedData.products)) {
          throw new Error("Invalid response structure");
        }

        return {
          storeName: parsedData.storeName || "Unknown Store",
          products: parsedData.products.filter(
            (p: any) => p.name && typeof p.price === "number" && p.price > 0,
          ),
        } as FlyerData;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Content that failed to parse:", cleanContent);
        throw new Error("Failed to parse OpenAI response as JSON");
      }
    } catch (error) {
      console.error("Error extracting flyer data:", error);
      // Return empty flyer data if parsing fails
      return {
        storeName: "Unknown Store",
        products: [],
      } as FlyerData;
    }
  });

  return Promise.all(flyerDataPromises);
};

const generateMealPlan = async (
  flyerData: FlyerData[],
  preferences: UserPreferences,
): Promise<MealPlan> => {
  try {
    // Combine all products from all flyers
    const allProducts = flyerData.flatMap((flyer) => flyer.products);

    if (allProducts.length === 0) {
      throw new Error("No products to work with");
    }

    const allergiesText =
      preferences.allergies.length > 0
        ? `AVOID THESE ALLERGIES: ${preferences.allergies.join(", ")}`
        : "";

    const dietaryText =
      preferences.dietaryRestrictions.length > 0
        ? `DIETARY REQUIREMENTS: ${preferences.dietaryRestrictions.join(", ")}`
        : "";

    const budgetText = preferences.budget
      ? `TARGET BUDGET: $${preferences.budget} per week`
      : "";

    const prompt = `Create a meal plan for ${preferences.familySize} ${preferences.familySize === 1 ? "person" : "people"} using these grocery products:

${JSON.stringify(allProducts, null, 2)}

Requirements:
${allergiesText}
${dietaryText}
${budgetText}

Return ONLY a valid JSON object with this exact structure:
{
  "meals": [
    {
      "id": "meal1",
      "name": "Scrambled Eggs",
      "category": "breakfast",
      "ingredients": [
        {
          "name": "Eggs",
          "quantity": "2 large",
          "price": 1.50
        }
      ],
      "instructions": ["Beat eggs", "Cook in pan"],
      "cost": 1.50
    }
  ]
}

Rules:
- Return ONLY valid JSON, no extra text
- Create 5-8 meals total including snacks and beverages when appropriate
- Use products from the provided list when possible (including beverages as drink pairings)
- Include beverages, snacks, and convenience items where suitable
- Calculate realistic costs
- Category must be: breakfast, lunch, dinner, or snack
- Each ingredient price should be the amount needed for the recipe
- Consider beverages as drink options with meals or as snacks`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No meal plan content received from OpenAI");
    }

    // Clean and parse the meal plan
    const cleanContent = content
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    try {
      const parsedMealPlan = JSON.parse(cleanContent);

      // Validate structure
      if (!parsedMealPlan.meals || !Array.isArray(parsedMealPlan.meals)) {
        throw new Error("Invalid meal plan structure");
      }

      // Calculate total cost
      const totalCost = parsedMealPlan.meals.reduce(
        (sum: number, meal: any) => {
          const mealCost =
            meal.cost ||
            meal.ingredients?.reduce(
              (ingredientSum: number, ing: any) =>
                ingredientSum + (ing.price || 0),
              0,
            ) ||
            0;
          return sum + mealCost;
        },
        0,
      );

      // Create the final meal plan object
      const mealPlan: MealPlan = {
        id: Date.now().toString(),
        meals: parsedMealPlan.meals.map((meal: any) => ({
          ...meal,
          cost:
            meal.cost ||
            meal.ingredients?.reduce(
              (sum: number, ing: any) => sum + (ing.price || 0),
              0,
            ) ||
            0,
        })),
        totalCost,
        familySize: preferences.familySize,
        preferences,
      };

      return mealPlan;
    } catch (parseError) {
      console.error("JSON parse error for meal plan:", parseError);
      console.error("Content that failed to parse:", cleanContent);
      throw new Error("Failed to parse meal plan response as JSON");
    }
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
};

const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
};

// Generate meal plan from already extracted products
export const generateMealPlanFromProducts = async (
  products: Product[],
  preferences: UserPreferences,
): Promise<MealPlan> => {
  console.log("Generating meal plan from products:", products.length);

  // Check if API key is available
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "your-api-key-here") {
    console.log("No valid API key found, using mock data");
    return createMockMealPlan(preferences);
  }

  try {
    // Create fake flyer data structure for existing generateMealPlan function
    const flyerData: FlyerData[] = [
      {
        storeName: "Parsed Products",
        products: products,
      },
    ];

    return await generateMealPlan(flyerData, preferences);
  } catch (error) {
    console.error("Error generating meal plan from products:", error);
    console.log("Falling back to mock meal plan");
    return createMockMealPlan(preferences);
  }
};

// Helper function to serialize meal plan for navigation
export const serializeMealPlanForNavigation = (mealPlan: MealPlan): any => {
  return {
    ...mealPlan,
    savedAt: mealPlan.savedAt ? mealPlan.savedAt.toISOString() : undefined,
  };
};
const createMockMealPlan = (preferences: UserPreferences): MealPlan => {
  const mockMeals: Meal[] = [
    {
      id: "1",
      name: "Avocado Toast with Eggs",
      category: "breakfast",
      ingredients: [
        { name: "Avocado", quantity: "1 medium", price: 1.5 },
        { name: "Sourdough bread", quantity: "2 slices", price: 1.0 },
        { name: "Eggs", quantity: "2 large", price: 1.0 },
      ],
      instructions: [
        "Toast the sourdough bread slices",
        "Mash avocado with salt and pepper",
        "Fry eggs to your preference",
        "Spread avocado on toast and top with eggs",
      ],
      cost: 3.5,
    },
    {
      id: "2",
      name: "Turkey Sandwich",
      category: "lunch",
      ingredients: [
        { name: "Turkey slices", quantity: "4 oz", price: 3.0 },
        { name: "Bread", quantity: "2 slices", price: 0.5 },
        { name: "Cheese", quantity: "1 slice", price: 0.75 },
        { name: "Lettuce", quantity: "2 leaves", price: 0.25 },
      ],
      instructions: [
        "Layer turkey on bread",
        "Add cheese and lettuce",
        "Top with second slice of bread",
      ],
      cost: 4.5,
    },
    {
      id: "3",
      name: "Spaghetti with Marinara",
      category: "dinner",
      ingredients: [
        { name: "Spaghetti pasta", quantity: "8 oz", price: 1.25 },
        { name: "Marinara sauce", quantity: "1 cup", price: 2.0 },
        { name: "Parmesan cheese", quantity: "2 tbsp", price: 0.75 },
      ],
      instructions: [
        "Boil water and cook spaghetti",
        "Heat marinara sauce",
        "Drain pasta and combine with sauce",
        "Serve with grated Parmesan",
      ],
      cost: 4.0,
    },
    {
      id: "4",
      name: "Apple with Peanut Butter",
      category: "snack",
      ingredients: [
        { name: "Apple", quantity: "1 medium", price: 0.75 },
        { name: "Peanut butter", quantity: "2 tbsp", price: 0.5 },
      ],
      instructions: [
        "Wash and slice apple",
        "Serve with peanut butter for dipping",
      ],
      cost: 1.25,
    },
  ];

  // Filter meals based on allergies and dietary restrictions
  const filteredMeals = mockMeals.filter((meal) => {
    // Check for allergies
    if (preferences.allergies.length > 0) {
      const hasAllergy = meal.ingredients.some((ingredient) =>
        preferences.allergies.some((allergy) =>
          ingredient.name.toLowerCase().includes(allergy.toLowerCase()),
        ),
      );
      if (hasAllergy) return false;
    }

    // Check for dietary restrictions
    if (preferences.dietaryRestrictions.includes("Vegetarian")) {
      const hasMeat = meal.ingredients.some((ingredient) =>
        ["turkey", "chicken", "beef", "pork", "fish"].some((meat) =>
          ingredient.name.toLowerCase().includes(meat),
        ),
      );
      if (hasMeat) return false;
    }

    if (preferences.dietaryRestrictions.includes("Vegan")) {
      const hasAnimalProducts = meal.ingredients.some((ingredient) =>
        ["eggs", "cheese", "butter", "milk", "turkey", "chicken", "beef"].some(
          (animal) => ingredient.name.toLowerCase().includes(animal),
        ),
      );
      if (hasAnimalProducts) return false;
    }

    return true;
  });

  const finalMeals = filteredMeals.length > 0 ? filteredMeals : mockMeals;
  const totalCost = finalMeals.reduce((sum, meal) => sum + meal.cost, 0);

  return {
    id: Date.now().toString(),
    meals: finalMeals,
    totalCost,
    familySize: preferences.familySize,
    preferences,
  };
};
