import { UserPreferences, MealPlan, Meal, Ingredient } from "../App";

// You'll need to set your OpenAI API key
const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY || "your-api-key-here";

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
  try {
    // First, extract product data from flyer images
    const flyerData = await extractFlyerData(imageUris);

    // Then generate meal plan based on extracted data and preferences
    const mealPlan = await generateMealPlan(flyerData, preferences);

    return mealPlan;
  } catch (error) {
    console.error("Error processing flyers:", error);
    throw error;
  }
};

const extractFlyerData = async (imageUris: string[]): Promise<FlyerData[]> => {
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
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyze this grocery flyer and extract product information. Return ONLY a JSON object with this exact structure:
{
  "storeName": "store name if visible",
  "products": [
    {
      "name": "product name",
      "price": numeric_price,
      "category": "category (produce, meat, dairy, pantry, etc.)",
      "unit": "unit if specified (lb, kg, each, etc.)"
    }
  ]
}

Focus on food items with clear prices. Ignore non-food items. Be precise with prices.`,
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
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      // Parse the JSON response
      const parsedData = JSON.parse(content.trim());
      return parsedData as FlyerData;
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

    const allergiesText =
      preferences.allergies.length > 0
        ? `ALLERGIES TO AVOID: ${preferences.allergies.join(", ")}`
        : "";

    const dietaryText =
      preferences.dietaryRestrictions.length > 0
        ? `DIETARY RESTRICTIONS: ${preferences.dietaryRestrictions.join(", ")}`
        : "";

    const budgetText = preferences.budget
      ? `TARGET BUDGET: $${preferences.budget} per week`
      : "";

    const prompt = `Create a meal plan for ${preferences.familySize} ${preferences.familySize === 1 ? "person" : "people"} using these grocery products:

${JSON.stringify(allProducts, null, 2)}

Requirements:
- ${allergiesText}
- ${dietaryText}
- ${budgetText}
- Include breakfast, lunch, dinner, and snack options
- Use primarily products from the provided list
- Calculate realistic costs based on provided prices
- Include simple cooking instructions

Return ONLY a JSON object with this exact structure:
{
  "meals": [
    {
      "id": "unique_id",
      "name": "meal name",
      "category": "breakfast|lunch|dinner|snack",
      "ingredients": [
        {
          "name": "ingredient name",
          "quantity": "amount needed",
          "price": numeric_price_for_quantity_needed
        }
      ],
      "instructions": ["step 1", "step 2", "step 3"],
      "cost": total_meal_cost
    }
  ]
}

Create 7-10 diverse meals that provide good variety throughout the week.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No meal plan content received from OpenAI");
    }

    // Parse the meal plan
    const parsedMealPlan = JSON.parse(content.trim());

    // Calculate total cost
    const totalCost = parsedMealPlan.meals.reduce(
      (sum: number, meal: any) => sum + meal.cost,
      0,
    );

    // Create the final meal plan object
    const mealPlan: MealPlan = {
      id: Date.now().toString(),
      meals: parsedMealPlan.meals,
      totalCost,
      familySize: preferences.familySize,
      preferences,
    };

    return mealPlan;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    // Return a fallback meal plan if generation fails
    return createFallbackMealPlan(preferences);
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

const createFallbackMealPlan = (preferences: UserPreferences): MealPlan => {
  // Fallback meal plan when OpenAI fails
  const fallbackMeals: Meal[] = [
    {
      id: "1",
      name: "Scrambled Eggs with Toast",
      category: "breakfast",
      ingredients: [
        { name: "Eggs", quantity: "2 large", price: 1.5 },
        { name: "Bread", quantity: "2 slices", price: 0.5 },
        { name: "Butter", quantity: "1 tbsp", price: 0.25 },
      ],
      instructions: [
        "Crack eggs into a bowl and whisk",
        "Heat butter in a pan over medium heat",
        "Add eggs and scramble until cooked",
        "Toast bread and serve alongside eggs",
      ],
      cost: 2.25,
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
        "Cut in half and serve",
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
        "Boil water and cook spaghetti according to package directions",
        "Heat marinara sauce in a separate pan",
        "Drain pasta and combine with sauce",
        "Serve with grated Parmesan cheese",
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
  const filteredMeals = fallbackMeals.filter((meal) => {
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

  const totalCost = filteredMeals.reduce((sum, meal) => sum + meal.cost, 0);

  return {
    id: Date.now().toString(),
    meals: filteredMeals.length > 0 ? filteredMeals : fallbackMeals,
    totalCost,
    familySize: preferences.familySize,
    preferences,
  };
};

// Mock function for development/testing
export const createMockMealPlan = (preferences: UserPreferences): MealPlan => {
  const mockMeals: Meal[] = [
    {
      id: "1",
      name: "Avocado Toast with Eggs",
      category: "breakfast",
      ingredients: [
        { name: "Avocado", quantity: "1 medium", price: 1.5 },
        { name: "Sourdough bread", quantity: "2 slices", price: 1.0 },
        { name: "Eggs", quantity: "2 large", price: 1.0 },
        { name: "Salt and pepper", quantity: "to taste", price: 0.1 },
      ],
      instructions: [
        "Toast the sourdough bread slices",
        "Mash avocado with salt and pepper",
        "Fry or poach eggs to your preference",
        "Spread avocado on toast and top with eggs",
      ],
      cost: 3.6,
    },
    {
      id: "2",
      name: "Chicken Caesar Salad",
      category: "lunch",
      ingredients: [
        { name: "Chicken breast", quantity: "6 oz", price: 4.5 },
        { name: "Romaine lettuce", quantity: "1 head", price: 2.0 },
        { name: "Parmesan cheese", quantity: "1/4 cup", price: 1.5 },
        { name: "Caesar dressing", quantity: "3 tbsp", price: 0.75 },
        { name: "Croutons", quantity: "1/2 cup", price: 0.5 },
      ],
      instructions: [
        "Season and grill chicken breast until cooked through",
        "Chop romaine lettuce and place in large bowl",
        "Slice chicken and add to lettuce",
        "Top with Parmesan, croutons, and dressing",
      ],
      cost: 9.25,
    },
    {
      id: "3",
      name: "Beef Stir Fry with Rice",
      category: "dinner",
      ingredients: [
        { name: "Beef strips", quantity: "8 oz", price: 6.0 },
        { name: "Mixed vegetables", quantity: "2 cups", price: 3.0 },
        { name: "Jasmine rice", quantity: "1 cup dry", price: 1.5 },
        { name: "Soy sauce", quantity: "3 tbsp", price: 0.25 },
        { name: "Garlic", quantity: "2 cloves", price: 0.25 },
        { name: "Vegetable oil", quantity: "2 tbsp", price: 0.3 },
      ],
      instructions: [
        "Cook rice according to package instructions",
        "Heat oil in large pan or wok",
        "Stir-fry beef until browned",
        "Add vegetables and garlic, cook until tender",
        "Add soy sauce and serve over rice",
      ],
      cost: 11.3,
    },
    {
      id: "4",
      name: "Greek Yogurt with Berries",
      category: "snack",
      ingredients: [
        { name: "Greek yogurt", quantity: "1 cup", price: 1.25 },
        { name: "Mixed berries", quantity: "1/2 cup", price: 2.0 },
        { name: "Honey", quantity: "1 tbsp", price: 0.25 },
      ],
      instructions: [
        "Place Greek yogurt in a bowl",
        "Top with mixed berries",
        "Drizzle with honey and enjoy",
      ],
      cost: 3.5,
    },
    {
      id: "5",
      name: "Vegetable Soup",
      category: "dinner",
      ingredients: [
        { name: "Mixed vegetables", quantity: "3 cups", price: 4.0 },
        { name: "Vegetable broth", quantity: "4 cups", price: 2.5 },
        { name: "Onion", quantity: "1 medium", price: 0.75 },
        { name: "Garlic", quantity: "3 cloves", price: 0.25 },
        { name: "Olive oil", quantity: "2 tbsp", price: 0.5 },
      ],
      instructions: [
        "Heat olive oil in large pot",
        "Sauté onion and garlic until fragrant",
        "Add vegetables and broth",
        "Simmer for 20-25 minutes until vegetables are tender",
        "Season with salt and pepper to taste",
      ],
      cost: 8.0,
    },
  ];

  const totalCost = mockMeals.reduce((sum, meal) => sum + meal.cost, 0);

  return {
    id: Date.now().toString(),
    meals: mockMeals,
    totalCost,
    familySize: preferences.familySize,
    preferences,
  };
};
