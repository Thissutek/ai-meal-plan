import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Alert,
  Share,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MealPlan, Meal, SerializableMealPlan } from '../../App';
import { saveMealPlan } from '../services/mealPlanStorage';
import TabNavigation from '../components/mealplan/TabNavigation';
import ViewToggle from '../components/mealplan/ViewToggle';
import WeeklyView from '../components/mealplan/WeeklyView';
import ListMealsView from '../components/mealplan/ListMealsView';
import GroceryListView from '../components/mealplan/GroceryListView';
import SavePlanModal from '../components/mealplan/SavePlanModal';
import ActionButtons from '../components/mealplan/ActionButtons';

type Props = StackScreenProps<RootStackParamList, 'MealPlan'>;

interface GroceryItem {
  id: string;
  name: string;
  quantity: string; 
  price: number;
  category: string;
  isChecked: boolean;
}

const MealPlanScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mealPlan: serializedMealPlan, source = 'camera' } = route.params;

  // Convert serialized meal plan back to proper MealPlan with Date objects
  const initialMealPlan: MealPlan = {
    ...serializedMealPlan,
    savedAt: serializedMealPlan.savedAt ? new Date(serializedMealPlan.savedAt) : undefined
  } as MealPlan;

  const [mealPlan, setMealPlan] = useState<MealPlan>(initialMealPlan);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mealPlanTitle, setMealPlanTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Use refs to track mounted state for async operations
  const isMounted = useRef(true);
  
  // Weekly view state
  const [showWeeklyView, setShowWeeklyView] = useState(true);
  const [selectedDayMeals, setSelectedDayMeals] = useState<Meal[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  
  // Grocery list state
  const [activeTab, setActiveTab] = useState<'meals' | 'grocery'>('meals');
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);

  const toggleMealExpansion = (mealId: string) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId);
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const getMealsByCategory = (category: string) => {
    return mealPlan.meals.filter(meal => meal.category === category);
  };

  // Validate meal plan data structure
  const validateMealPlan = useCallback((plan: MealPlan): boolean => {
    if (!plan) return false;
    if (!Array.isArray(plan.meals)) return false;
    if (typeof plan.totalCost !== 'number') return false;
    if (typeof plan.familySize !== 'number') return false;
    if (!plan.id) return false;
    
    // Check that each meal has required properties
    for (const meal of plan.meals) {
      // Check required fields
      if (!meal.id || !meal.name || !Array.isArray(meal.ingredients) || 
          typeof meal.cost !== 'number' || !meal.category) {
        console.error('Invalid meal structure:', meal);
        return false;
      }
      
      // If instructions exist, they should be an array
      if (meal.instructions && !Array.isArray(meal.instructions)) {
        console.error('Invalid instructions format:', meal.instructions);
        return false;
      }
    }
    
    return true;
  }, []);

  const handleSaveMealPlan = async () => {
    // Validate inputs
    if (!mealPlanTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your meal plan.');
      return;
    }
    
    if (!validateMealPlan(mealPlan)) {
      Alert.alert('Invalid Data', 'The meal plan data appears to be corrupted or incomplete.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      await saveMealPlan(mealPlan, mealPlanTitle.trim());
      
      if (isMounted.current) {
        setShowSaveModal(false);
        setMealPlanTitle('');
        Alert.alert(
          'Success!',
          'Your meal plan has been saved successfully.',
          [
            { text: 'View Saved Plans', onPress: () => navigation.navigate('SavedPlans') },
            { text: 'OK', style: 'default' }
          ]
        );
      }
    } catch (error) {
      if (isMounted.current) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrorMessage(`Failed to save: ${errorMsg}`);
        Alert.alert(
          'Error Saving Plan', 
          'Failed to save meal plan. Please try again.',
          [
            { text: 'Try Again', onPress: () => handleSaveMealPlan() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        console.error('Save error:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  };

  const openSaveModal = () => {
    const defaultTitle = `Meal Plan ${new Date().toLocaleDateString()}`;
    setMealPlanTitle(defaultTitle);
    setShowSaveModal(true);
  };

  const shareMealPlan = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const mealPlanText = generateShareText();
      await Share.share({
        message: mealPlanText,
        title: 'My AI Generated Meal Plan',
      });
    } catch (error) {
      if (isMounted.current) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrorMessage(`Failed to share: ${errorMsg}`);
        Alert.alert('Error Sharing', 'Could not share your meal plan. Please try again.');
        console.error('Error sharing meal plan:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const generateShareText = (): string => {
    let text = `🍽️ AI Generated Meal Plan\n`;
    text += `For ${mealPlan.familySize} ${mealPlan.familySize === 1 ? 'person' : 'people'}\n`;
    text += `Total Cost: ${formatPrice(mealPlan.totalCost)}\n\n`;

    const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
    categories.forEach(category => {
      const meals = getMealsByCategory(category);
      if (meals.length > 0) {
        text += `${category.toUpperCase()}:\n`;
        meals.forEach(meal => {
          text += `• ${meal.name} - ${formatPrice(meal.cost)}\n`;
        });
        text += '\n';
      }
    });

    return text;
  };

  // Helper function to generate a stable ID based on content
  const generateStableId = useCallback((text: string): string => {
    // Simple hash function that produces the same ID for the same input
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `grocery_${Math.abs(hash).toString(36)}`;
  }, []);

  // Generate grocery list from meal plan ingredients
  const generateGroceryList = useCallback((): GroceryItem[] => {
    const ingredients = new Map<string, GroceryItem>();

    mealPlan.meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase().trim();

        if (ingredients.has(key)) {
          const existing = ingredients.get(key)!;
          existing.price += ingredient.price;
          existing.quantity = combineQuantities(existing.quantity, ingredient.quantity);
        } else {
          ingredients.set(key, {
            id: generateStableId(ingredient.name), // Use stable ID generation
            name: ingredient.name,
            quantity: ingredient.quantity,
            price: ingredient.price,
            category: 'other', // Add the required category property
            isChecked: false
          });
        }
      });
    });

    return Array.from(ingredients.values());
  }, [mealPlan.meals, generateStableId]);

  const combineQuantities = useCallback((qty1: string, qty2: string): string => {
    // Enhanced quantity combination with better unit handling
    const parseQuantity = (qtyStr: string): { value: number, unit: string } => {
      // Common unit conversions for cooking
      const unitMap: Record<string, { base: string, factor: number }> = {
        'tbsp': { base: 'tbsp', factor: 1 },
        'tablespoon': { base: 'tbsp', factor: 1 },
        'tablespoons': { base: 'tbsp', factor: 1 },
        'tsp': { base: 'tsp', factor: 1 },
        'teaspoon': { base: 'tsp', factor: 1 },
        'teaspoons': { base: 'tsp', factor: 1 },
        'cup': { base: 'cup', factor: 1 },
        'cups': { base: 'cup', factor: 1 },
        'oz': { base: 'oz', factor: 1 },
        'ounce': { base: 'oz', factor: 1 },
        'ounces': { base: 'oz', factor: 1 },
        'lb': { base: 'lb', factor: 1 },
        'pound': { base: 'lb', factor: 1 },
        'pounds': { base: 'lb', factor: 1 },
        'g': { base: 'g', factor: 1 },
        'gram': { base: 'g', factor: 1 },
        'grams': { base: 'g', factor: 1 },
        'kg': { base: 'g', factor: 1000 },
        'kilogram': { base: 'g', factor: 1000 },
        'kilograms': { base: 'g', factor: 1000 },
        'ml': { base: 'ml', factor: 1 },
        'milliliter': { base: 'ml', factor: 1 },
        'milliliters': { base: 'ml', factor: 1 },
        'l': { base: 'ml', factor: 1000 },
        'liter': { base: 'ml', factor: 1000 },
        'liters': { base: 'ml', factor: 1000 }
      };
      
      // Extract number and unit
      const numMatch = qtyStr.match(/^([\d./]+)/);
      if (!numMatch) return { value: 1, unit: qtyStr.trim() };
      
      const value = eval(numMatch[0]); // Safely evaluate fractions like 1/2
      const unitStr = qtyStr.replace(numMatch[0], '').trim().toLowerCase();
      
      // Find matching unit in map
      for (const [unitKey, unitData] of Object.entries(unitMap)) {
        if (unitStr.includes(unitKey)) {
          return { 
            value: value * unitData.factor, 
            unit: unitData.base 
          };
        }
      }
      
      return { value: value, unit: unitStr };
    };
    
    try {
      const quantity1 = parseQuantity(qty1);
      const quantity2 = parseQuantity(qty2);
      
      // If units match or can be converted, combine them
      if (quantity1.unit === quantity2.unit) {
        const totalValue = quantity1.value + quantity2.value;
        return `${totalValue % 1 === 0 ? totalValue : totalValue.toFixed(2)} ${quantity1.unit}`;
      }
      
      // Units don't match, return both quantities
      return `${qty1}, ${qty2}`;
    } catch (error) {
      console.error('Error combining quantities:', error);
      return `${qty1}, ${qty2}`;
    }
  }, []);

  // Create a memoized grocery list
  const memoizedGroceryList = useMemo(() => {
    if (groceryList.length > 0) {
      return groceryList;
    }
    return generateGroceryList();
  }, [groceryList, generateGroceryList]);

  // Helper function to create grocery list data object
  const createGroceryListData = useCallback((items: GroceryItem[]) => {
    return {
      items: items,
      totalCost: items.reduce((sum, item) => sum + item.price, 0),
      checkedItems: items.filter(item => item.isChecked).map(item => item.id),
      stores: [] // Required property to match the GroceryList interface
    };
  }, []);

  // Initialize or load grocery list when switching to grocery tab
  useEffect(() => {
    if (activeTab === 'grocery' && groceryList.length === 0) {
      setIsLoading(true);
      setErrorMessage(null);
      
      try {
        // First check if there's a saved grocery list in the meal plan
        if (mealPlan.groceryList && Array.isArray(mealPlan.groceryList.items) && mealPlan.groceryList.items.length > 0) {
          // Use the saved grocery list from the database
          console.log('Loading saved grocery list from database');
          const savedItems = mealPlan.groceryList.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price || 0,
            category: item.category || 'other',
            isChecked: item.isChecked || mealPlan.groceryList?.checkedItems?.includes(item.id) || false
          }));
          
          if (isMounted.current) {
            setGroceryList(savedItems);
          }
        } else {
          // Generate a new grocery list if none exists
          console.log('Generating new grocery list');
          const items = generateGroceryList();
          
          if (isMounted.current) {
            setGroceryList(items);
            
            // Update meal plan with grocery list data
            const groceryListData = createGroceryListData(items);
            
            setMealPlan(prevPlan => ({
              ...prevPlan,
              groceryList: groceryListData
            }));
          }
        }
      } catch (error) {
        if (isMounted.current) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
          setErrorMessage(`Failed to load grocery list: ${errorMsg}`);
          console.error('Error loading grocery list:', error);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }
  }, [activeTab, groceryList.length, generateGroceryList, createGroceryListData, mealPlan.groceryList]);
  
  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggleGroceryItem = useCallback((itemId: string) => {
    const updatedList = groceryList.map(item =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    setGroceryList(updatedList);

    // Update meal plan with new grocery list state
    const groceryListData = createGroceryListData(updatedList);

    // Get the cloudId from the initial meal plan if it exists
    const savedPlan = initialMealPlan as unknown as { cloudId?: string, title?: string };
    const cloudId = savedPlan.cloudId;
    
    const updatedMealPlan = {
      ...mealPlan,
      groceryList: groceryListData,
      // Ensure cloudId is preserved in the updated meal plan
      ...(cloudId ? { cloudId } : {})
    };
    
    setMealPlan(updatedMealPlan);
    
    // Save the updated meal plan to the database to persist the checked state
    if (cloudId) {
      // If this is a saved meal plan, update it in the database
      const planTitle = savedPlan.title || `Meal Plan ${new Date().toLocaleDateString()}`;
      
      console.log(`Updating meal plan ${cloudId} with checked state changes`);
      
      // Save the updated meal plan to persist the grocery list state
      saveMealPlan(updatedMealPlan, planTitle)
        .then((savedMealPlan) => {
          console.log('Grocery list checked state saved successfully');
          // No need to update state again as we're just updating the existing plan
        })
        .catch(error => {
          console.error('Failed to save grocery list checked state:', error);
        });
    }
  }, [groceryList, createGroceryListData]);

  const shareGroceryList = useCallback(async (items: GroceryItem[], totalCost: number) => {
    if (!items || items.length === 0) {
      Alert.alert('Empty List', 'There are no items in your grocery list to share.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Group items by category for better organization
      const categorizedItems = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
        const category = item.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {});
      
      let text = `🛒 Grocery Shopping List\n`;
      text += `Total Cost: ${formatPrice(totalCost)}\n\n`;

      // Add items by category
      Object.entries(categorizedItems).forEach(([category, categoryItems]) => {
        text += `${category.toUpperCase()}:\n`;
        categoryItems.forEach(item => {
          const status = item.isChecked ? '✓' : '○';
          text += `${status} ${item.quantity} ${item.name} - ${formatPrice(item.price)}\n`;
        });
        text += '\n';
      });

      await Share.share({
        message: text,
        title: 'Grocery Shopping List',
      });
    } catch (error) {
      if (isMounted.current) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrorMessage(`Failed to share: ${errorMsg}`);
        Alert.alert('Error Sharing', 'Could not share your grocery list. Please try again.');
        console.error('Error sharing grocery list:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [formatPrice]);

  const handleDaySelected = (dayIndex: number, meals: Meal[]) => {
    setSelectedDayIndex(dayIndex);
    setSelectedDayMeals(meals);
    // Automatically expand the first meal if available
    if (meals.length > 0) {
      setExpandedMeal(meals[0].id);
    } else {
      setExpandedMeal(null);
    }
  };
  
  // Error display component
  const ErrorDisplay = useCallback(() => {
    if (!errorMessage) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }, [errorMessage]);
  
  // Loading overlay component
  const LoadingOverlay = useCallback(() => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }, [isLoading]);
  
  return (
      <SafeAreaView style={styles.container}>
        <ErrorDisplay />
        <LoadingOverlay />
        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
    
        {/* View Toggle for Meals Tab */}
        {activeTab === 'meals' && (
          <ViewToggle
            showWeeklyView={showWeeklyView}
            onToggle={setShowWeeklyView}
          />
        )}
    
        {/* Content */}
        {activeTab === 'meals' ? (
          showWeeklyView ? (
            <WeeklyView
              mealPlan={mealPlan}
              selectedDayMeals={selectedDayMeals}
              selectedDayIndex={selectedDayIndex}
              expandedMeal={expandedMeal}
              toggleMealExpansion={toggleMealExpansion}
              onDaySelected={handleDaySelected}
              formatPrice={formatPrice}
            />
          ) : (
            <ListMealsView
              mealPlan={mealPlan}
              expandedMeal={expandedMeal}
              toggleMealExpansion={toggleMealExpansion}
              formatPrice={formatPrice}
              getMealsByCategory={getMealsByCategory}
            />
          )
        ) : (
          <GroceryListView
            groceryList={memoizedGroceryList}
            toggleGroceryItem={toggleGroceryItem}
            shareGroceryList={shareGroceryList}
            formatPrice={formatPrice}
          />
        )}
    
        {/* Save Modal */}
        <SavePlanModal
          visible={showSaveModal}
          title={mealPlanTitle}
          onChangeTitle={setMealPlanTitle}
          onSave={handleSaveMealPlan}
          onCancel={() => setShowSaveModal(false)}
          isSaving={isSaving}
        />
    
        {/* Bottom Actions - Only show for camera flow */}
        {source === 'camera' && (
          <ActionButtons
            onSave={openSaveModal}
            onShare={shareMealPlan}
            onNewPlan={() => navigation.navigate('Camera')}
          />
        )}
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2E7D32',
  }
});

export default MealPlanScreen;