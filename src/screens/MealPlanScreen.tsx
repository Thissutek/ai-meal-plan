import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MealPlan, Meal, SerializableMealPlan } from '../../App';
import { saveMealPlan } from '../services/mealPlanStorage';
import TabNavigation from '../components/TabNavigation';
import ViewToggle from '../components/ViewToggle';
import WeeklyView from '../components/WeeklyView';
import ListMealsView from '../components/ListMealsView';
import GroceryListView from '../components/GroceryListView';
import SavePlanModal from '../components/SavePlanModal';
import ActionButtons from '../components/ActionButtons';

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
  const { mealPlan: serializedMealPlan } = route.params;

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

  const handleSaveMealPlan = async () => {
    if (!mealPlanTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your meal plan.');
      return;
    }

    setIsSaving(true);
    try {
      await saveMealPlan(mealPlan, mealPlanTitle.trim());
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
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal plan. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openSaveModal = () => {
    const defaultTitle = `Meal Plan ${new Date().toLocaleDateString()}`;
    setMealPlanTitle(defaultTitle);
    setShowSaveModal(true);
  };

  const shareMealPlan = async () => {
    try {
      const mealPlanText = generateShareText();
      await Share.share({
        message: mealPlanText,
        title: 'My AI Generated Meal Plan',
      });
    } catch (error) {
      console.error('Error sharing meal plan:', error);
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

  const combineQuantities = (qty1: string, qty2: string): string => {
    // Simple quantity combination - could be enhanced with unit parsing
    const num1 = parseFloat(qty1);
    const num2 = parseFloat(qty2);

    if (!isNaN(num1) && !isNaN(num2)) {
      const unit1 = qty1.replace(num1.toString(), '').trim();
      const unit2 = qty2.replace(num2.toString(), '').trim();

      if (unit1 === unit2) {
        return `${(num1 + num2)} ${unit1}`;
      }
    }

    return `${qty1}, ${qty2}`;
  };

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

  // Generate grocery list when switching to grocery tab
  useEffect(() => {
    if (activeTab === 'grocery' && groceryList.length === 0) {
      const items = generateGroceryList();
      setGroceryList(items);

      // Update meal plan with grocery list data
      const groceryListData = createGroceryListData(items);

      setMealPlan(prevPlan => ({
        ...prevPlan,
        groceryList: groceryListData
      }));
    }
  }, [activeTab, groceryList.length, generateGroceryList, createGroceryListData]);

  const toggleGroceryItem = useCallback((itemId: string) => {
    const updatedList = groceryList.map(item =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    setGroceryList(updatedList);

    // Update meal plan with new grocery list state
    const groceryListData = createGroceryListData(updatedList);

    setMealPlan(prevPlan => ({
      ...prevPlan,
      groceryList: groceryListData
    }));
  }, [groceryList, createGroceryListData]);

  const shareGroceryList = async (items: GroceryItem[], totalCost: number) => {
    let text = `🛒 Grocery Shopping List\n`;
    text += `Total Cost: ${formatPrice(totalCost)}\n\n`;

    items.forEach(item => {
      const status = item.isChecked ? '✓' : '○';
      text += `${status} ${item.quantity} ${item.name} - ${formatPrice(item.price)}\n`;
    });

    try {
      await Share.share({
        message: text,
        title: 'Grocery Shopping List',
      });
    } catch (error) {
      console.error('Error sharing grocery list:', error);
    }
  };

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
  
  return (
      <SafeAreaView style={styles.container}>
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
    
        {/* Bottom Actions */}
        <ActionButtons
          onSave={openSaveModal}
          onShare={shareMealPlan}
          onNewPlan={() => navigation.navigate('Camera')}
        />
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  }
});

export default MealPlanScreen;