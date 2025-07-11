export interface FlyerData {
  storeName: string;
  products: Product[];
}

export interface Product {
  name: string;
  price: number;
  category: string;
  unit?: string;
  originalPrice?: number;
  onSale?: boolean;
}import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import PreferencesScreen from './src/screens/PreferenceScreen';
import CameraScreen from './src/screens/CameraScreen';
import FlyerResultsScreen from './src/screens/FlyerResultsScreen';
import MealPlanScreen from './src/screens/MealPlanScreen';
import SavedPlansScreen from './src/screens/SavedPlansScreen';
import { initializeDeviceId } from './src/services/deviceService';

export type RootStackParamList = {
  Home: undefined;
  Preferences: undefined;
  Camera: undefined;
  FlyerResults: { flyerData: FlyerData[], imageUris: string[], preferences: UserPreferences };
  MealPlan: { mealPlan: SerializableMealPlan };
  SavedPlans: undefined;
};

export interface SerializableMealPlan {
  id: string;
  meals: Meal[];
  totalCost: number;
  familySize: number;
  preferences: UserPreferences;
  groceryList?: GroceryList;
  savedAt?: string; // Use string instead of Date for navigation
}

export interface MealPlan {
  id: string;
  meals: Meal[];
  totalCost: number;
  familySize: number;
  preferences: UserPreferences;
  groceryList?: GroceryList;
}

export interface GroceryList {
  items: GroceryItem[];
  totalCost: number;
  stores: StoreSection[];
  checkedItems: string[]; // Array of item IDs that are checked off
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
  store?: string;
  unit?: string;
  isChecked: boolean;
}

export interface StoreSection {
  storeName: string;
  items: GroceryItem[];
  totalCost: number;
}

export interface Meal {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  cost: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface Ingredient {
  name: string;
  quantity: string;
  price: number;
  store?: string;
}

export interface UserPreferences {
  familySize: number;
  allergies: string[];
  dietaryRestrictions: string[];
  budget?: number;
}

const Stack = createStackNavigator<RootStackParamList>();

export default function App(): JSX.Element {
  useEffect(() => {
    // Initialize device ID when app starts
    initializeDeviceId().then(deviceId => {
      console.log('App started with device ID:', deviceId);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Sayvr' }}
        />
        <Stack.Screen
          name="Preferences"
          component={PreferencesScreen}
          options={{ title: 'Your Preferences' }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'Scan Flyers' }}
        />
        <Stack.Screen
          name="FlyerResults"
          component={FlyerResultsScreen}
          options={{ title: 'Flyer Results' }}
        />
        <Stack.Screen
          name="MealPlan"
          component={MealPlanScreen}
          options={{ title: 'Your Meal Plan' }}
        />
        <Stack.Screen
          name="SavedPlans"
          component={SavedPlansScreen}
          options={{ title: 'Saved Meal Plans' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
