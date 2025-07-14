import { createClient } from "@supabase/supabase-js";
import { getDeviceId } from "./deviceService";
import { MealPlan } from "../../App";

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;

// Initialize Supabase client if credentials are available
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("Supabase initialized successfully");
} else {
  console.log("Supabase credentials not found");
}

export interface SavedMealPlan extends MealPlan {
  title: string;
  savedAt: Date;
  cloudId: string;
}

// Save meal plan directly to database only
export const saveMealPlan = async (
  mealPlan: MealPlan,
  title?: string,
): Promise<SavedMealPlan> => {
  if (!supabase) {
    throw new Error(
      "Database not available. Please check your internet connection.",
    );
  }

  const deviceId = await getDeviceId();
  const planTitle = title || `Meal Plan ${new Date().toLocaleDateString()}`;
  
  // Check if this is an existing meal plan that needs to be updated
  const mealPlanWithId = mealPlan as unknown as { cloudId?: string };
  const existingId = mealPlanWithId.cloudId;
  
  try {
    let data;
    let error;
    
    if (existingId) {
      // Update existing meal plan
      console.log(`Updating existing meal plan with ID: ${existingId}`);
      const result = await supabase
        .from("meal_plans")
        .update({
          title: planTitle,
          total_cost: mealPlan.totalCost,
          family_size: mealPlan.familySize,
          preferences: mealPlan.preferences,
          meals: mealPlan.meals,
          grocery_list: mealPlan.groceryList || null,
        })
        .eq("id", existingId)
        .select("*")
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new meal plan
      console.log('Creating new meal plan');
      const result = await supabase
        .from("meal_plans")
        .insert({
          device_id: deviceId,
          title: planTitle,
          total_cost: mealPlan.totalCost,
          family_size: mealPlan.familySize,
          preferences: mealPlan.preferences,
          meals: mealPlan.meals,
          grocery_list: mealPlan.groceryList || null,
        })
        .select("*")
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Database save error:", error);
      throw new Error("Failed to save meal plan to database");
    }

    console.log("Meal plan saved to database with ID:", data.id);

    const savedPlan: SavedMealPlan = {
      id: data.id,
      title: data.title,
      meals: data.meals,
      totalCost: data.total_cost,
      familySize: data.family_size,
      preferences: data.preferences,
      groceryList: data.grocery_list || undefined,
      savedAt: new Date(data.created_at),
      cloudId: data.id,
    };

    return savedPlan;
  } catch (error) {
    console.error("Error saving meal plan:", error);
    throw error;
  }
};

// Get all meal plans from database only
export const getAllMealPlans = async (): Promise<SavedMealPlan[]> => {
  if (!supabase) {
    console.log("Database not available, returning empty list");
    return [];
  }

  try {
    const deviceId = await getDeviceId();
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching meal plans:", error);
      return [];
    }

    return data.map((plan: any) => ({
      id: plan.id,
      title: plan.title,
      meals: plan.meals,
      totalCost: plan.total_cost,
      familySize: plan.family_size,
      preferences: plan.preferences,
      groceryList: plan.grocery_list || undefined,
      savedAt: new Date(plan.created_at),
      cloudId: plan.id,
    }));
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return [];
  }
};

// Delete a meal plan from database only
export const deleteMealPlan = async (planId: string): Promise<void> => {
  if (!supabase) {
    throw new Error(
      "Database not available. Please check your internet connection.",
    );
  }

  try {
    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", planId);

    if (error) {
      console.error("Error deleting meal plan:", error);
      throw new Error("Failed to delete meal plan");
    }

    console.log("Meal plan deleted successfully");
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    throw error;
  }
};

// Get meal plan count for display
export const getMealPlanCount = async (): Promise<number> => {
  const plans = await getAllMealPlans();
  return plans.length;
};
