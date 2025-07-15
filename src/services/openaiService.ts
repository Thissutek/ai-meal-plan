import { UserPreferences, MealPlan, Meal, Ingredient } from "../../App";

// You'll need to set your OpenAI API key
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

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
    // First, extract product data from flyer images (using GPT-4o)
    const flyerData = await extractFlyerData(imageUris);

    // Check if we got any valid data
    const allProducts = flyerData.flatMap((flyer) => flyer.products);
    if (allProducts.length === 0) {
      console.log("No products extracted, using mock data");
      return createMockMealPlan(preferences);
    }

    // Then generate meal plan using optimized approach (GPT-3.5-turbo)
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
            model: "gpt-4o", // Keep GPT-4o for vision tasks
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyze this grocery flyer. Extract food/beverage products. Return ONLY valid, complete JSON with this exact structure:
{
  "storeName": "store name or Unknown Store",
  "products": [
    {
      "name": "product name",
      "price": 1.99,
      "category": "produce",
      "unit": "lb"
    }
  ]
}

Rules:
- Return ONLY valid, complete JSON - no markdown, no code blocks, no extra text
- Price must be a number (not a string)
- Categories: produce, meat, dairy, pantry, snacks, beverages, frozen, bakery, deli, other
- Focus on items with clear prices
- Ensure the JSON is properly closed with all necessary braces
- Do not include any text before or after the JSON object`,
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
            max_tokens: 1000,
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

      // Store the original content for error logging
      const originalContent = content;

      try {
        // Clean the response
        let cleanContent = content
          .trim()
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");

        // Try to fix common JSON issues
        if (!cleanContent.startsWith("{") || !cleanContent.endsWith("}")) {
          console.warn("Incomplete JSON detected, attempting to fix");

          // If it starts with { but doesn't end with }, try to find where the JSON should end
          if (cleanContent.startsWith("{") && !cleanContent.endsWith("}")) {
            // Add closing brace if missing
            cleanContent = cleanContent + "}";
          }

          // If it's still not valid JSON, try to extract JSON from the text
          if (!cleanContent.startsWith("{") || !cleanContent.endsWith("}")) {
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/); // Match anything between { and }
            if (jsonMatch) {
              cleanContent = jsonMatch[0];
            }
          }
        }

        // Fix specific issue with extra closing brace after the last product
        // This pattern matches cases like: "unit": "package" },} or "unit": "package"},}
        const extraClosingBracePattern =
          /"[^"]+"\s*:\s*"[^"]+"\s*}\s*,\s*}\s*$/;
        if (extraClosingBracePattern.test(cleanContent)) {
          console.warn("Found extra closing brace after last product, fixing");
          cleanContent = cleanContent.replace(
            extraClosingBracePattern,
            (match: string) => {
              // Replace the extra closing brace with a proper JSON structure ending
              return match.replace(/}\s*,\s*}\s*$/, "\n  }\n}");
            },
          );
        }

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

        // Get the content for error logging
        const contentToLog =
          originalContent && originalContent.length > 500
            ? originalContent.substring(0, 500) + "... [truncated]"
            : originalContent;
        console.error("Content that failed to parse:", contentToLog);

        // Try to extract any product data we can from the response
        try {
          // If we can identify a partial product list, try to use it
          if (
            originalContent &&
            originalContent.includes('"products"') &&
            originalContent.includes('"name"') &&
            originalContent.includes('"price"')
          ) {
            console.log("Attempting to salvage partial product data");

            // Create a minimal valid JSON structure
            const minimalJson = `{"storeName": "Unknown Store", "products": []}`;
            return JSON.parse(minimalJson) as FlyerData;
          }
        } catch (e) {
          console.error("Failed to salvage partial data:", e);
        }

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

// OPTIMIZED: New hybrid approach using GPT-3.5-turbo for meal planning
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

    // Pre-filter products to remove allergens - reduces AI workload
    const safeProducts = filterProductsByAllergies(
      allProducts,
      preferences.allergies,
    );

    // Create more aggressive filtering for token reduction
    const optimizedProducts = safeProducts
      .filter(
        (product, index, self) =>
          index ===
          self.findIndex(
            (p) => p.name.toLowerCase() === product.name.toLowerCase(),
          ),
      )
      .slice(0, 30) // Reduced from 50 to save tokens
      .map((p) => ({
        name: p.name,
        price: parseFloat(p.price.toFixed(2)),
        category: p.category,
      })); // Removed unit field to save tokens

    // Build allergy restrictions text
    const allergyList =
      preferences.allergies.length > 0 ? preferences.allergies.join(", ") : "";

    const dietaryText =
      preferences.dietaryRestrictions.length > 0
        ? `DIETARY REQUIREMENTS: ${preferences.dietaryRestrictions.join(", ")}`
        : "";

    const budgetText = preferences.budget
      ? `BUDGET: $${preferences.budget}/week`
      : "";

    // Enhanced prompt with explicit family size scaling
    const prompt = `Create unique meal options for ${preferences.familySize} ${preferences.familySize === 1 ? 'person' : 'people'}.

Scale ingredient amounts and costs appropriately for ${preferences.familySize} ${preferences.familySize === 1 ? 'person' : 'people'}.
Costs should reflect serving ${preferences.familySize} ${preferences.familySize === 1 ? 'person' : 'people'}.

FORBIDDEN INGREDIENTS: ${allergyList}
AVAILABLE: ${JSON.stringify(optimizedProducts)}
${dietaryText}
${budgetText}

Return ONLY this JSON structure:
{
  "meals": [
    {"name": "Oatmeal", "type": "breakfast", "day": "Monday", "ingredients": ["Oats", "Banana"], "cost": 3.5},
    {"name": "Rice Bowl", "type": "lunch", "day": "Tuesday", "ingredients": ["Rice", "Vegetables"], "cost": 5.0}
  ]
}

Rules:
- Create exactly 21 unique meals: 7 breakfast, 7 lunch, 7 dinner
- Each meal must be different from others in its category
- Assign each meal to a specific day (Monday through Sunday)
- Use ONLY ingredients from the available list
- NEVER use forbidden ingredients
- Keep meal names under 3 words
- Cost must be number, not string (already scaled for ${preferences.familySize} ${preferences.familySize === 1 ? 'person' : 'people'})
- Use simple ingredient names only
- Vary ingredients across meals to create diversity`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Standard model
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000, // Increased from 1200 to handle more complex meal plans
        temperature: 0.1, // Low temperature for consistency
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

    // Parse and validate the meals
    let cleanContent = content
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    try {
      // Check if the content is too minimal to be valid JSON
      if (cleanContent.length < 10) {
        console.warn(
          "Response too short to be valid JSON, falling back to mock data",
        );
        return createMockMealPlan(preferences);
      }

      // Try to fix common JSON issues
      if (!cleanContent.startsWith("{") || !cleanContent.endsWith("}")) {
        console.warn("Incomplete meal plan JSON detected, attempting to fix");

        // If it starts with { but doesn't end with }, try to find where the JSON should end
        if (cleanContent.startsWith("{") && !cleanContent.endsWith("}")) {
          // Add closing brace if missing
          cleanContent = cleanContent + "}";
        }

        // If it's still not valid JSON, try to extract JSON from the text
        if (!cleanContent.startsWith("{") || !cleanContent.endsWith("}")) {
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/); // Match anything between { and }
          if (jsonMatch) {
            cleanContent = jsonMatch[0];
          }
        }
      }

      // Check if we just have an opening brace with nothing else or very minimal content
      if (
        cleanContent === "{" ||
        cleanContent === "{}" ||
        cleanContent.length <= 5
      ) {
        console.warn(
          "Empty or minimal JSON object received, falling back to mock data",
        );
        return createMockMealPlan(preferences);
      }

      // Check for truncated numbers (like "cost": 4. instead of "cost": 4.0)
      cleanContent = cleanContent.replace(/"cost":\s*(\d+)\./g, '"cost": $1.0');
      cleanContent = cleanContent.replace(
        /"price":\s*(\d+)\./g,
        '"price": $1.0',
      );

      const parsedData = JSON.parse(cleanContent);

      // Validate that we have 21 meals and no forbidden ingredients
      const validationIssues = validateUniqueMeals(
        parsedData.meals,
        preferences.allergies,
      );

      if (validationIssues.length > 0) {
        console.warn("Validation issues found:", validationIssues);
        // Fall back to mock data
        return createMockMealPlan(preferences);
      }

      // Convert to full meal plan format
      const fullMealPlan = convertToMealPlanFormat(
        parsedData.meals,
        preferences,
      );

      return fullMealPlan;
    } catch (parseError) {
      console.error("JSON parse error for meal plan:", parseError);

      // Special handling for "Unexpected end of input" errors which indicate incomplete JSON
      if (
        parseError instanceof SyntaxError &&
        (parseError.message.includes("Unexpected end of input") ||
          parseError.message.includes("Unexpected character"))
      ) {
        console.warn(
          "Received incomplete JSON from API, falling back to mock data",
        );
        return createMockMealPlan(preferences);
      }

      // Log the content that failed to parse, but be careful with very large responses
      const contentToLog =
        cleanContent.length > 500
          ? cleanContent.substring(0, 500) + "... [truncated]"
          : cleanContent;
      console.error("Content that failed to parse:", contentToLog);

      // If we can't parse anything, fall back to mock data
      console.log("Falling back to mock meal plan due to parsing error");
      return createMockMealPlan(preferences);
    }
  } catch (error) {
    console.error("Error generating meal plan:", error);
    console.log("Using mock data due to error");
    return createMockMealPlan(preferences);
  }
};

// NEW: Pre-filter products to remove obvious allergens
const filterProductsByAllergies = (
  products: Product[],
  allergies: string[],
): Product[] => {
  if (allergies.length === 0) return products;

  const allergenKeywords: Record<string, string[]> = {
    nuts: [
      "nuts",
      "almond",
      "walnut",
      "peanut",
      "cashew",
      "pecan",
      "pistachio",
    ],
    dairy: ["milk", "cheese", "butter", "yogurt", "cream", "dairy"],
    gluten: ["wheat", "bread", "pasta", "flour", "gluten", "cereal"],
    eggs: ["egg", "eggs"],
    seafood: ["fish", "salmon", "tuna", "cod", "seafood"],
    soy: ["soy", "tofu", "edamame", "soybean"],
    shellfish: ["shrimp", "lobster", "crab", "shellfish", "prawns"],
  };

  return products.filter((product) => {
    const productName = product.name.toLowerCase();

    return !allergies.some((allergy) => {
      const keywords = allergenKeywords[allergy.toLowerCase()] || [
        allergy.toLowerCase(),
      ];
      return keywords.some((keyword) => productName.includes(keyword));
    });
  });
};

// NEW: Validate unique meals don't contain allergens and meet requirements
const validateUniqueMeals = (meals: any[], allergies: string[]): string[] => {
  const issues: string[] = [];

  if (!meals || !Array.isArray(meals)) {
    issues.push("Invalid meals structure");
    return issues;
  }

  // Check if we have exactly 21 meals
  if (meals.length !== 21) {
    issues.push(`Expected 21 meals, got ${meals.length}`);
  }

  // Check distribution (should be 7 of each type)
  const breakfastCount = meals.filter((m) => m.type === "breakfast").length;
  const lunchCount = meals.filter((m) => m.type === "lunch").length;
  const dinnerCount = meals.filter((m) => m.type === "dinner").length;

  if (breakfastCount !== 7)
    issues.push(`Expected 7 breakfasts, got ${breakfastCount}`);
  if (lunchCount !== 7) issues.push(`Expected 7 lunches, got ${lunchCount}`);
  if (dinnerCount !== 7) issues.push(`Expected 7 dinners, got ${dinnerCount}`);

  const allergenKeywords: Record<string, string[]> = {
    nuts: [
      "nuts",
      "almond",
      "walnut",
      "peanut",
      "cashew",
      "pecan",
      "pistachio",
    ],
    dairy: ["milk", "cheese", "butter", "yogurt", "cream", "dairy"],
    gluten: ["wheat", "bread", "pasta", "flour", "gluten", "cereal"],
    eggs: ["egg", "eggs"],
    seafood: ["fish", "salmon", "tuna", "cod", "seafood"],
    soy: ["soy", "tofu", "edamame", "soybean"],
    shellfish: ["shrimp", "lobster", "crab", "shellfish", "prawns"],
  };

  meals.forEach((meal, index) => {
    if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
      issues.push(`Meal ${index} has invalid ingredients`);
      return;
    }

    if (!meal.day || !meal.type || !meal.name) {
      issues.push(`Meal ${index} missing required fields (day, type, name)`);
    }

    meal.ingredients.forEach((ingredient: string) => {
      const ingredientLower = ingredient.toLowerCase();

      allergies.forEach((allergy) => {
        const keywords = allergenKeywords[allergy.toLowerCase()] || [
          allergy.toLowerCase(),
        ];
        if (keywords.some((keyword) => ingredientLower.includes(keyword))) {
          issues.push(`${meal.name} contains ${allergy}: ${ingredient}`);
        }
      });
    });
  });

  // Check for uniqueness within each category
  const checkUniqueness = (categoryMeals: any[], category: string) => {
    const names = categoryMeals.map((m) => m.name.toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      issues.push(`Duplicate ${category} meal names found`);
    }
  };

  checkUniqueness(
    meals.filter((m) => m.type === "breakfast"),
    "breakfast",
  );
  checkUniqueness(
    meals.filter((m) => m.type === "lunch"),
    "lunch",
  );
  checkUniqueness(
    meals.filter((m) => m.type === "dinner"),
    "dinner",
  );

  return issues;
};

// NEW: Convert AI-generated meals to MealPlan format with family size scaling
const convertToMealPlanFormat = (
  aiMeals: any[],
  preferences: UserPreferences,
): MealPlan => {
  const meals: Meal[] = aiMeals.map((aiMeal, index) => ({
    id: (index + 1).toString(),
    name: aiMeal.name,
    category: aiMeal.type as "breakfast" | "lunch" | "dinner",
    day: aiMeal.day,
    ingredients: aiMeal.ingredients.map((ingredientName: string) => ({
      name: ingredientName,
      quantity: `${preferences.familySize} serving${preferences.familySize > 1 ? "s" : ""}`,
      price: (aiMeal.cost * preferences.familySize) / aiMeal.ingredients.length,
    })),
    cost: aiMeal.cost * preferences.familySize,
  }));

  const totalCost = meals.reduce((sum, meal) => sum + meal.cost, 0);

  return {
    id: Date.now().toString(),
    meals,
    totalCost,
    familySize: preferences.familySize,
    preferences,
  };
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
    // Create flyer data structure for the optimized meal plan function
    const flyerData: FlyerData[] = [
      {
        storeName: "Parsed Products",
        products: products,
      },
    ];

    // Use the same optimized meal plan generation as processFlyers
    return await generateMealPlan(flyerData, preferences);
  } catch (error) {
    console.error("Error generating meal plan from products:", error);
    console.log("Falling back to mock meal plan");
    return createMockMealPlan(preferences);
  }
};

// Helper function to serialize meal plan for navigation
export const serializeMealPlanForNavigation = (mealPlan: MealPlan): any => {
  // Create a serializable version of the meal plan
  // Note: MealPlan type doesn't have savedAt property, so we don't need to handle it
  return {
    ...mealPlan,
  };
};

// UPDATED: Mock meal plan with proper family size scaling
const createMockMealPlan = (preferences: UserPreferences): MealPlan => {
  // Create a more comprehensive mock meal plan with meals for each day of the week
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday", 
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Base meal templates - 7 unique options per category for variety (costs for 1 person)
  const breakfastTemplates = [
    {
      name: "Oatmeal with Berries",
      ingredients: [
        { name: "Oats", quantity: "1/2 cup", price: 1.0 },
        { name: "Mixed berries", quantity: "1/2 cup", price: 2.0 },
        { name: "Honey", quantity: "1 tbsp", price: 0.5 },
      ],
      cost: 3.5,
    },
    {
      name: "Rice Porridge", 
      ingredients: [
        { name: "Rice", quantity: "1/2 cup", price: 0.75 },
        { name: "Banana", quantity: "1 medium", price: 0.5 },
        { name: "Cinnamon", quantity: "1 tsp", price: 0.25 },
      ],
      cost: 1.5,
    },
    {
      name: "Fruit Smoothie Bowl",
      ingredients: [
        { name: "Frozen fruit", quantity: "1 cup", price: 2.0 },
        { name: "Coconut milk", quantity: "1/2 cup", price: 1.0 },
        { name: "Granola", quantity: "2 tbsp", price: 0.75 },
      ],
      cost: 3.75,
    },
    {
      name: "Quinoa Breakfast Bowl",
      ingredients: [
        { name: "Quinoa", quantity: "1/2 cup", price: 1.5 },
        { name: "Apple", quantity: "1 medium", price: 0.75 },
        { name: "Maple syrup", quantity: "1 tbsp", price: 0.5 },
      ],
      cost: 2.75,
    },
    {
      name: "Chia Pudding",
      ingredients: [
        { name: "Chia seeds", quantity: "2 tbsp", price: 1.0 },
        { name: "Almond milk", quantity: "1 cup", price: 1.25 },
        { name: "Vanilla", quantity: "1 tsp", price: 0.25 },
      ],
      cost: 2.5,
    },
    {
      name: "Breakfast Rice",
      ingredients: [
        { name: "Brown rice", quantity: "1/2 cup", price: 0.75 },
        { name: "Coconut flakes", quantity: "2 tbsp", price: 0.5 },
        { name: "Dates", quantity: "2 pieces", price: 1.0 },
      ],
      cost: 2.25,
    },
    {
      name: "Vegetable Hash",
      ingredients: [
        { name: "Sweet potato", quantity: "1 medium", price: 1.0 },
        { name: "Bell pepper", quantity: "1/2 cup", price: 0.75 },
        { name: "Onion", quantity: "1/4 cup", price: 0.25 },
      ],
      cost: 2.0,
    },
  ];

  const lunchTemplates = [
    {
      name: "Rice and Vegetables",
      ingredients: [
        { name: "Brown rice", quantity: "1 cup", price: 1.0 },
        { name: "Mixed vegetables", quantity: "1 cup", price: 2.0 },
        { name: "Olive oil", quantity: "1 tbsp", price: 0.5 },
      ],
      cost: 3.5,
    },
    {
      name: "Quinoa Salad",
      ingredients: [
        { name: "Quinoa", quantity: "3/4 cup", price: 2.0 },
        { name: "Cucumber", quantity: "1/2 medium", price: 0.75 },
        { name: "Tomatoes", quantity: "1/2 cup", price: 1.0 },
      ],
      cost: 3.75,
    },
    {
      name: "Vegetable Stir-fry",
      ingredients: [
        { name: "Broccoli", quantity: "1 cup", price: 1.5 },
        { name: "Carrots", quantity: "1/2 cup", price: 0.75 },
        { name: "Sesame oil", quantity: "1 tsp", price: 0.25 },
      ],
      cost: 2.5,
    },
    {
      name: "Lentil Soup",
      ingredients: [
        { name: "Red lentils", quantity: "1/2 cup", price: 1.0 },
        { name: "Vegetable broth", quantity: "2 cups", price: 1.5 },
        { name: "Onion", quantity: "1/4 cup", price: 0.25 },
      ],
      cost: 2.75,
    },
    {
      name: "Sweet Potato Bowl",
      ingredients: [
        { name: "Sweet potato", quantity: "1 large", price: 1.25 },
        { name: "Black beans", quantity: "1/2 cup", price: 1.0 },
        { name: "Avocado", quantity: "1/2 medium", price: 1.0 },
      ],
      cost: 3.25,
    },
    {
      name: "Vegetable Curry",
      ingredients: [
        { name: "Cauliflower", quantity: "1 cup", price: 1.5 },
        { name: "Coconut milk", quantity: "1/2 cup", price: 1.0 },
        { name: "Curry powder", quantity: "1 tsp", price: 0.25 },
      ],
      cost: 2.75,
    },
    {
      name: "Grain Bowl",
      ingredients: [
        { name: "Barley", quantity: "3/4 cup", price: 1.0 },
        { name: "Roasted vegetables", quantity: "1 cup", price: 2.0 },
        { name: "Tahini", quantity: "1 tbsp", price: 0.5 },
      ],
      cost: 3.5,
    },
  ];

  const dinnerTemplates = [
    {
      name: "Vegetable Pasta",
      ingredients: [
        { name: "Rice pasta", quantity: "2 oz", price: 1.0 },
        { name: "Marinara sauce", quantity: "1/2 cup", price: 1.5 },
        { name: "Zucchini", quantity: "1/2 cup", price: 0.75 },
      ],
      cost: 3.25,
    },
    {
      name: "Stuffed Bell Peppers",
      ingredients: [
        { name: "Bell peppers", quantity: "2 medium", price: 2.0 },
        { name: "Quinoa", quantity: "1/2 cup", price: 1.5 },
        { name: "Mushrooms", quantity: "1/2 cup", price: 1.0 },
      ],
      cost: 4.5,
    },
    {
      name: "Vegetable Chili",
      ingredients: [
        { name: "Kidney beans", quantity: "1 cup", price: 1.5 },
        { name: "Diced tomatoes", quantity: "1 cup", price: 1.25 },
        { name: "Bell pepper", quantity: "1/2 cup", price: 0.75 },
      ],
      cost: 3.5,
    },
    {
      name: "Roasted Vegetables",
      ingredients: [
        { name: "Root vegetables", quantity: "2 cups", price: 2.5 },
        { name: "Olive oil", quantity: "2 tbsp", price: 1.0 },
        { name: "Herbs", quantity: "1 tsp", price: 0.25 },
      ],
      cost: 3.75,
    },
    {
      name: "Vegetable Soup",
      ingredients: [
        { name: "Mixed vegetables", quantity: "2 cups", price: 2.0 },
        { name: "Vegetable broth", quantity: "3 cups", price: 2.0 },
        { name: "Garlic", quantity: "2 cloves", price: 0.25 },
      ],
      cost: 4.25,
    },
    {
      name: "Rice Pilaf",
      ingredients: [
        { name: "Basmati rice", quantity: "1 cup", price: 1.25 },
        { name: "Vegetables", quantity: "1 cup", price: 1.5 },
        { name: "Vegetable broth", quantity: "2 cups", price: 1.5 },
      ],
      cost: 4.25,
    },
    {
      name: "Buddha Bowl",
      ingredients: [
        { name: "Brown rice", quantity: "3/4 cup", price: 1.0 },
        { name: "Steamed vegetables", quantity: "1.5 cups", price: 2.0 },
        { name: "Hummus", quantity: "3 tbsp", price: 1.0 },
      ],
      cost: 4.0,
    },
  ];

  // Filter out meals that contain allergens
  const filterMealsByAllergies = (meals: any[]) => {
    return meals.filter((meal: any) => {
      // Check for allergies
      if (preferences.allergies.length > 0) {
        const mealIngredients = meal.ingredients.map((ing: any) =>
          ing.name.toLowerCase(),
        );
        const hasAllergy = preferences.allergies.some((allergen: string) =>
          mealIngredients.some((ingredient: string) =>
            ingredient.includes(allergen.toLowerCase()),
          ),
        );
        if (hasAllergy) return false;
      }

      // Check for dietary restrictions
      if (preferences.dietaryRestrictions.includes("Vegetarian")) {
        const hasMeat = meal.ingredients.some((ingredient: any) =>
          ["turkey", "chicken", "beef", "pork", "fish", "salmon"].some((meat: string) =>
            ingredient.name.toLowerCase().includes(meat),
          ),
        );
        if (hasMeat) return false;
      }

      if (preferences.dietaryRestrictions.includes("Vegan")) {
        const hasAnimalProducts = meal.ingredients.some((ingredient: any) =>
          [
            "eggs",
            "cheese",
            "butter",
            "milk",
            "turkey",
            "chicken",
            "beef",
            "salmon",
            "yogurt",
          ].some((animal: string) => ingredient.name.toLowerCase().includes(animal)),
        );
        if (hasAnimalProducts) return false;
      }

      return true;
    });
  };

  // Filter templates based on allergies and dietary restrictions
  const filteredBreakfasts = filterMealsByAllergies(breakfastTemplates);
  const filteredLunches = filterMealsByAllergies(lunchTemplates);
  const filteredDinners = filterMealsByAllergies(dinnerTemplates);

  // Ensure we have enough meals, pad with safe options if needed
  const ensureMinimumMeals = (meals: any[], type: string) => {
    if (meals.length < 7) {
      const safeMeal = {
        name: `Simple ${type}`,
        ingredients: [
          { name: "Rice", quantity: "1 cup", price: 1.0 },
          { name: "Vegetables", quantity: "1 cup", price: 1.5 },
        ],
        cost: 2.5,
      };

      while (meals.length < 7) {
        meals.push({
          ...safeMeal,
          name: `${safeMeal.name} ${meals.length + 1}`,
        });
      }
    }
    return meals;
  };

  const finalBreakfasts = ensureMinimumMeals(filteredBreakfasts, "Breakfast");
  const finalLunches = ensureMinimumMeals(filteredLunches, "Lunch");
  const finalDinners = ensureMinimumMeals(filteredDinners, "Dinner");

  // Create 21 unique meals (7 of each type) and scale by family size
  const mockMeals: Meal[] = [];
  let mealId = 1;

  days.forEach((day, dayIndex) => {
    // Scale breakfast for family size
    const breakfastTemplate = finalBreakfasts[dayIndex];
    const breakfast = {
      id: mealId.toString(),
      name: breakfastTemplate.name,
      category: "breakfast" as "breakfast" | "lunch" | "dinner",
      day: day,
      ingredients: breakfastTemplate.ingredients.map((ing: any) => ({
        name: ing.name,
        quantity: `${preferences.familySize} serving${preferences.familySize > 1 ? "s" : ""}`,
        price: ing.price * preferences.familySize,
      })),
      cost: breakfastTemplate.cost * preferences.familySize,
    };
    mockMeals.push(breakfast);
    mealId++;

    // Scale lunch for family size
    const lunchTemplate = finalLunches[dayIndex];
    const lunch = {
      id: mealId.toString(),
      name: lunchTemplate.name,
      category: "lunch" as "breakfast" | "lunch" | "dinner",
      day: day,
      ingredients: lunchTemplate.ingredients.map((ing: any) => ({
        name: ing.name,
        quantity: `${preferences.familySize} serving${preferences.familySize > 1 ? "s" : ""}`,
        price: ing.price * preferences.familySize,
      })),
      cost: lunchTemplate.cost * preferences.familySize,
    };
    mockMeals.push(lunch);
    mealId++;

    // Scale dinner for family size
    const dinnerTemplate = finalDinners[dayIndex];
    const dinner = {
      id: mealId.toString(),
      name: dinnerTemplate.name,
      category: "dinner" as "breakfast" | "lunch" | "dinner",
      day: day,
      ingredients: dinnerTemplate.ingredients.map((ing: any) => ({
        name: ing.name,
        quantity: `${preferences.familySize} serving${preferences.familySize > 1 ? "s" : ""}`,
        price: ing.price * preferences.familySize,
      })),
      cost: dinnerTemplate.cost * preferences.familySize,
    };
    mockMeals.push(dinner);
    mealId++;
  });

  const totalCost = mockMeals.reduce((sum, meal) => sum + meal.cost, 0);

  return {
    id: Date.now().toString(),
    meals: mockMeals,
    totalCost,
    familySize: preferences.familySize,
    preferences,
  };
};