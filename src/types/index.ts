export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FlyerAnalysisResult {
  products: Product[];
  storeName: string;
  confidence: number;
}

export interface Product {
  name: string;
  price: number;
  category:
    | "produce"
    | "meat"
    | "dairy"
    | "pantry"
    | "snacks"
    | "beverages"
    | "other";
  unit?: string;
  brand?: string;
  onSale?: boolean;
  originalPrice?: number;
}

export interface MealPlanRequest {
  products: Product[];
  preferences: UserPreferences;
  targetBudget?: number;
  weekStartDate?: Date;
}

export interface MealPlanResponse {
  mealPlan: MealPlan;
  nutritionInfo?: NutritionInfo;
  shoppingList?: ShoppingListItem[];
}

export interface NutritionInfo {
  totalCalories: number;
  avgCaloriesPerDay: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface ShoppingListItem {
  name: string;
  quantity: string;
  estimatedPrice: number;
  category: string;
  found: boolean;
}

export interface UserProfile {
  id: string;
  name?: string;
  preferences: UserPreferences;
  savedMealPlans: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface AppSettings {
  theme: "light" | "dark";
  notifications: boolean;
  autoSave: boolean;
  cacheImages: boolean;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Preferences: undefined;
  Camera: undefined;
  MealPlan: { mealPlan: MealPlan };
  Settings?: undefined;
  History?: undefined;
};

// Utility types
export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";
export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "keto"
  | "paleo"
  | "lowCarb"
  | "halal"
  | "kosher"
  | "glutenFree";
export type AllergyType =
  | "nuts"
  | "dairy"
  | "gluten"
  | "eggs"
  | "seafood"
  | "soy"
  | "shellfish";

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: "low" | "medium" | "high" = "medium",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message, "API_ERROR", "high");
    this.name = "ApiError";
  }
}

// Constants
export const APP_CONSTANTS = {
  MAX_FLYER_IMAGES: 3,
  MAX_FAMILY_SIZE: 5,
  MIN_BUDGET: 20,
  MAX_BUDGET: 500,
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in ms
  API_TIMEOUT: 30000, // 30 seconds
} as const;
