import AsyncStorage from "@react-native-async-storage/async-storage";
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
  console.log("Supabase credentials not found, using local storage only");
}

export interface SavedMealPlan extends MealPlan {
  title: string;
  savedAt: Date;
  isSyncedToCloud?: boolean;
  cloudId?: string;
}

// Save meal plan locally and to cloud
export const saveMealPlan = async (
  mealPlan: MealPlan,
  title?: string,
): Promise<SavedMealPlan> => {
  const deviceId = await getDeviceId();
  const planTitle = title || `Meal Plan ${new Date().toLocaleDateString()}`;

  const savedPlan: SavedMealPlan = {
    ...mealPlan,
    title: planTitle,
    savedAt: new Date(),
    isSyncedToCloud: false,
  };

  try {
    // Save locally first (always works)
    const localPlans = await getLocalMealPlans();
    localPlans.push(savedPlan);
    await AsyncStorage.setItem("savedMealPlans", JSON.stringify(localPlans));

    console.log("Meal plan saved locally");

    // Try to save to cloud if Supabase is available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("meal_plans")
          .insert({
            device_id: deviceId,
            title: planTitle,
            total_cost: mealPlan.totalCost,
            family_size: mealPlan.familySize,
            preferences: mealPlan.preferences,
            meals: mealPlan.meals,
            local_id: mealPlan.id,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Supabase save error:", error);
        } else {
          console.log("Meal plan saved to cloud with ID:", data.id);
          savedPlan.isSyncedToCloud = true;
          savedPlan.cloudId = data.id;

          // Update local storage with cloud ID
          const updatedPlans = localPlans.map((plan) =>
            plan.id === savedPlan.id ? savedPlan : plan,
          );
          await AsyncStorage.setItem(
            "savedMealPlans",
            JSON.stringify(updatedPlans),
          );
        }
      } catch (cloudError) {
        console.error("Cloud save failed:", cloudError);
      }
    }

    return savedPlan;
  } catch (error) {
    console.error("Error saving meal plan:", error);
    throw error;
  }
};

// Get all locally saved meal plans
export const getLocalMealPlans = async (): Promise<SavedMealPlan[]> => {
  try {
    const plansJson = await AsyncStorage.getItem("savedMealPlans");
    if (!plansJson) return [];

    const plans = JSON.parse(plansJson);
    // Convert savedAt back to Date objects
    return plans.map((plan: any) => ({
      ...plan,
      savedAt: new Date(plan.savedAt),
    }));
  } catch (error) {
    console.error("Error loading meal plans:", error);
    return [];
  }
};

// Get all meal plans from cloud
export const getCloudMealPlans = async (): Promise<SavedMealPlan[]> => {
  if (!supabase) return [];

  try {
    const deviceId = await getDeviceId();
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cloud meal plans:", error);
      return [];
    }

    return data.map((plan: any) => ({
      id: plan.local_id || plan.id,
      title: plan.title,
      meals: plan.meals,
      totalCost: plan.total_cost,
      familySize: plan.family_size,
      preferences: plan.preferences,
      savedAt: new Date(plan.created_at),
      isSyncedToCloud: true,
      cloudId: plan.id,
    }));
  } catch (error) {
    console.error("Error fetching cloud meal plans:", error);
    return [];
  }
};

// Get all meal plans (local + cloud, deduplicated)
export const getAllMealPlans = async (): Promise<SavedMealPlan[]> => {
  const [localPlans, cloudPlans] = await Promise.all([
    getLocalMealPlans(),
    getCloudMealPlans(),
  ]);

  // Merge and deduplicate (prefer cloud version if both exist)
  const allPlansMap = new Map<string, SavedMealPlan>();

  // Add local plans first
  localPlans.forEach((plan) => allPlansMap.set(plan.id, plan));

  // Add cloud plans (will overwrite local if same ID)
  cloudPlans.forEach((plan) => allPlansMap.set(plan.id, plan));

  // Convert back to array and sort by date
  const allPlans = Array.from(allPlansMap.values());
  return allPlans.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
};

// Delete a meal plan
export const deleteMealPlan = async (planId: string): Promise<void> => {
  try {
    // Delete locally
    const plans = await getLocalMealPlans();
    const planToDelete = plans.find((p) => p.id === planId);
    const filteredPlans = plans.filter((plan) => plan.id !== planId);
    await AsyncStorage.setItem("savedMealPlans", JSON.stringify(filteredPlans));

    // Delete from cloud if it exists there
    if (supabase && planToDelete?.cloudId) {
      const { error } = await supabase
        .from("meal_plans")
        .delete()
        .eq("id", planToDelete.cloudId);

      if (error) {
        console.error("Error deleting from cloud:", error);
      } else {
        console.log("Meal plan deleted from cloud");
      }
    }
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

// Sync local plans to cloud (useful for initial setup)
export const syncLocalPlansToCloud = async (): Promise<void> => {
  if (!supabase) return;

  try {
    const deviceId = await getDeviceId();
    const localPlans = await getLocalMealPlans();
    const unsyncedPlans = localPlans.filter((plan) => !plan.isSyncedToCloud);

    for (const plan of unsyncedPlans) {
      try {
        const { data, error } = await supabase
          .from("meal_plans")
          .insert({
            device_id: deviceId,
            title: plan.title,
            total_cost: plan.totalCost,
            family_size: plan.familySize,
            preferences: plan.preferences,
            meals: plan.meals,
            local_id: plan.id,
          })
          .select("id")
          .single();

        if (!error && data) {
          plan.isSyncedToCloud = true;
          plan.cloudId = data.id;
        }
      } catch (syncError) {
        console.error("Error syncing plan:", syncError);
      }
    }

    // Update local storage with sync status
    await AsyncStorage.setItem("savedMealPlans", JSON.stringify(localPlans));
    console.log(`Synced ${unsyncedPlans.length} plans to cloud`);
  } catch (error) {
    console.error("Error syncing to cloud:", error);
  }
};
