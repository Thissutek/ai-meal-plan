import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Share,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MealPlan, Meal, SerializableMealPlan } from '../../App';
import { saveMealPlan } from '../services/mealPlanStorage';
import WeeklyMealPlanGrid from '../components/WeeklyMealPlanGrid';

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
  const [activeTab, setActiveTab] = useState<'meals' | 'grocery'>('meals');
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [showWeeklyView, setShowWeeklyView] = useState(true);
  const [selectedDayMeals, setSelectedDayMeals] = useState<Meal[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

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
          { text: 'View Saved Plans', onPress: () => navigation.navigate('SavedPlans' as any) },
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

  // Generate grocery list from meal plan ingredients
  const generateGroceryList = (): GroceryItem[] => {
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
            id: `grocery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
  };

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

  // Generate grocery list when switching to grocery tab
  useEffect(() => {
    if (activeTab === 'grocery' && groceryList.length === 0) {
      const items = generateGroceryList();
      setGroceryList(items);

      // Update meal plan with grocery list data
      const groceryListData = {
        items: items,
        totalCost: items.reduce((sum, item) => sum + item.price, 0),
        checkedItems: [],
        stores: [] // Add the required stores property to match the GroceryList interface
      };

      setMealPlan(prevPlan => ({
        ...prevPlan,
        groceryList: groceryListData
      }));
    }
  }, [activeTab]);

  const toggleGroceryItem = (itemId: string) => {
    const updatedList = groceryList.map(item =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    setGroceryList(updatedList);

    // Update meal plan with new grocery list state
    const groceryListData = {
      items: updatedList,
      totalCost: updatedList.reduce((sum, item) => sum + item.price, 0),
      checkedItems: updatedList.filter(item => item.isChecked).map(item => item.id),
      stores: [] // Add the required stores property to match the GroceryList interface
    };

    setMealPlan(prevPlan => ({
      ...prevPlan,
      groceryList: groceryListData
    }));
  };

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

  const renderMeal = (meal: Meal) => {
    const isExpanded = expandedMeal === meal.id;

    return (
      <View key={meal.id} style={styles.mealCard}>
        <TouchableOpacity
          style={styles.mealHeader}
          onPress={() => toggleMealExpansion(meal.id)}
        >
          <View style={styles.mealTitleContainer}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealCost}>{formatPrice(meal.cost)}</Text>
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.mealDetails}>
            <View style={styles.ingredientsSection}>
              <Text style={styles.sectionTitle}>Ingredients:</Text>
              {meal.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Text style={styles.ingredientText}>
                    • {ingredient.quantity} {ingredient.name}
                  </Text>
                  <Text style={styles.ingredientPrice}>
                    {formatPrice(ingredient.price)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.instructionsSection}>
              <Text style={styles.sectionTitle}>Instructions:</Text>
              {meal.instructions.map((instruction, index) => (
                <Text key={index} style={styles.instructionText}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderMealCategory = (category: string, displayName: string, icon: string) => {
    const meals = getMealsByCategory(category);
    if (meals.length === 0) return null;

    const categoryTotal = meals.reduce((sum, meal) => sum + meal.cost, 0);

    return (
      <View key={category} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>
            {icon} {displayName}
          </Text>
          <Text style={styles.categoryTotal}>
            {formatPrice(categoryTotal)}
          </Text>
        </View>
        {meals.map(renderMeal)}
      </View>
    );
  };

  const renderGroceryList = () => {
    const items = groceryList.length > 0 ? groceryList : generateGroceryList();
    const totalCost = items.reduce((sum, item) => sum + item.price, 0);
    const checkedCount = items.filter(item => item.isChecked).length;

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Grocery Shopping List</Text>
            <Text style={styles.summarySubtitle}>
              {checkedCount}/{items.length} items checked • {formatPrice(totalCost)}
            </Text>
          </View>

          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.groceryItem, item.isChecked && styles.groceryItemChecked]}
              onPress={() => toggleGroceryItem(item.id)}
            >
              <View style={styles.groceryCheckbox}>
                <Text style={styles.checkboxText}>
                  {item.isChecked ? '✓' : '○'}
                </Text>
              </View>
              <View style={styles.groceryItemContent}>
                <Text style={[styles.groceryItemName, item.isChecked && styles.groceryItemNameChecked]}>
                  {item.name}
                </Text>
                <Text style={[styles.groceryItemQuantity, item.isChecked && styles.groceryItemQuantityChecked]}>
                  {item.quantity}
                </Text>
              </View>
              <Text style={[styles.groceryItemPrice, item.isChecked && styles.groceryItemPriceChecked]}>
                {formatPrice(item.price)}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.shareGroceryButton}
            onPress={() => shareGroceryList(items, totalCost)}
          >
            <Text style={styles.shareGroceryButtonText}>📤 Share Grocery List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderDayMeals = () => {
    if (selectedDayMeals.length === 0) {
      return (
        <View style={styles.emptyDayContainer}>
          <Text style={styles.emptyDayText}>No meals planned for this day</Text>
        </View>
      );
    }

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayName = daysOfWeek[selectedDayIndex];

    // Group meals by category for the selected day
    const mealsByCategory = {
      breakfast: selectedDayMeals.filter(meal => meal.category === 'breakfast'),
      lunch: selectedDayMeals.filter(meal => meal.category === 'lunch'),
      dinner: selectedDayMeals.filter(meal => meal.category === 'dinner'),
      snack: selectedDayMeals.filter(meal => meal.category === 'snack'),
    };

    // Calculate total cost for the day
    const dayTotalCost = selectedDayMeals.reduce((sum, meal) => sum + meal.cost, 0);

    return (
      <View style={styles.dayMealsContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{dayName}'s Meals</Text>
          <Text style={styles.dayTotalCost}>{formatPrice(dayTotalCost)}</Text>
        </View>

        {mealsByCategory.breakfast.length > 0 && (
          <View style={styles.mealCategorySection}>
            <Text style={styles.mealCategoryTitle}>🍳 Breakfast</Text>
            {mealsByCategory.breakfast.map(renderMeal)}
          </View>
        )}

        {mealsByCategory.lunch.length > 0 && (
          <View style={styles.mealCategorySection}>
            <Text style={styles.mealCategoryTitle}>🥪 Lunch</Text>
            {mealsByCategory.lunch.map(renderMeal)}
          </View>
        )}

        {mealsByCategory.dinner.length > 0 && (
          <View style={styles.mealCategorySection}>
            <Text style={styles.mealCategoryTitle}>🍽️ Dinner</Text>
            {mealsByCategory.dinner.map(renderMeal)}
          </View>
        )}

        {mealsByCategory.snack.length > 0 && (
          <View style={styles.mealCategorySection}>
            <Text style={styles.mealCategoryTitle}>🍌 Snacks</Text>
            {mealsByCategory.snack.map(renderMeal)}
          </View>
        )}
      </View>
    );
  };

  const renderMealsContent = () => {
    if (showWeeklyView) {
      return (
        <View style={styles.weeklyViewContainer}>
          <WeeklyMealPlanGrid
            mealPlan={mealPlan}
            onDaySelected={handleDaySelected}
          />
          <ScrollView style={styles.selectedDayScrollView}>
            {renderDayMeals()}
          </ScrollView>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Meal Plan</Text>
            <Text style={styles.summarySubtitle}>
              For {mealPlan.familySize} {mealPlan.familySize === 1 ? 'person' : 'people'}
            </Text>

            <View style={styles.costContainer}>
              <Text style={styles.totalCostLabel}>Total Weekly Cost:</Text>
              <Text style={styles.totalCost}>{formatPrice(mealPlan.totalCost)}</Text>
            </View>

            <View style={styles.averageContainer}>
              <Text style={styles.averageText}>
                Average per person: {formatPrice(mealPlan.totalCost / mealPlan.familySize)}
              </Text>
              <Text style={styles.averageText}>
                Average per day: {formatPrice(mealPlan.totalCost / 7)}
              </Text>
            </View>
          </View>

          {/* Preferences Info */}
          {(mealPlan.preferences.allergies.length > 0 ||
            mealPlan.preferences.dietaryRestrictions.length > 0) && (
              <View style={styles.preferencesCard}>
                <Text style={styles.preferencesTitle}>Preferences Considered:</Text>
                {mealPlan.preferences.allergies.length > 0 && (
                  <Text style={styles.preferencesText}>
                    🚫 Allergies avoided: {mealPlan.preferences.allergies.join(', ')}
                  </Text>
                )}
                {mealPlan.preferences.dietaryRestrictions.length > 0 && (
                  <Text style={styles.preferencesText}>
                    🥗 Dietary: {mealPlan.preferences.dietaryRestrictions.join(', ')}
                  </Text>
                )}
              </View>
            )}

          {/* Meal Categories */}
          {renderMealCategory('breakfast', 'Breakfast', '🌅')}
          {renderMealCategory('lunch', 'Lunch', '☀️')}
          {renderMealCategory('dinner', 'Dinner', '🌙')}
          {renderMealCategory('snack', 'Snacks', '🍎')}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'meals' && styles.tabActive]}
          onPress={() => setActiveTab('meals')}
        >
          <Text style={[styles.tabText, activeTab === 'meals' && styles.tabTextActive]}>
            🍽️ Meal Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'grocery' && styles.tabActive]}
          onPress={() => setActiveTab('grocery')}
        >
          <Text style={[styles.tabText, activeTab === 'grocery' && styles.tabTextActive]}>
            🛒 Grocery List
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle for Meals Tab */}
      {activeTab === 'meals' && (
        <View style={styles.viewToggleContainer}>
          <Text style={styles.viewToggleLabel}>Weekly View</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={showWeeklyView ? '#4CAF50' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setShowWeeklyView(!showWeeklyView)}
            value={showWeeklyView}
          />
        </View>
      )}

      {/* Content */}
      {activeTab === 'meals' ? renderMealsContent() : renderGroceryList()}

      {/* Save Modal */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Meal Plan</Text>
            <Text style={styles.modalSubtitle}>Give your meal plan a name:</Text>

            <TextInput
              style={styles.titleInput}
              value={mealPlanTitle}
              onChangeText={setMealPlanTitle}
              placeholder="Enter meal plan title"
              autoFocus={true}
              maxLength={50}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveMealPlan}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Plan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveActionButton]}
          onPress={openSaveModal}
        >
          <Text style={styles.actionButtonText}>💾 Save Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={shareMealPlan}
        >
          <Text style={styles.actionButtonText}>📤 Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.newPlanButton]}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.actionButtonText}>🆕 New Plan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  tabTextActive: {
    color: '#4CAF50',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  viewToggleLabel: {
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  weeklyViewContainer: {
    flex: 1,
  },
  selectedDayScrollView: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 5,
  },
  summarySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  totalCostLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalCost: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  averageContainer: {
    alignItems: 'center',
  },
  averageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  preferencesCard: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  preferencesText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  categoryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  mealTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  mealCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
  },
  mealDetails: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ingredientsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    marginTop: 5,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  ingredientPrice: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  instructionsSection: {
    marginTop: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  dayMealsContainer: {
    padding: 15,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'left',
  },
  dayTotalCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  mealCategorySection: {
    marginBottom: 20,
  },
  mealCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emptyDayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyDayText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  groceryItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groceryItemChecked: {
    backgroundColor: '#f0f9f0',
    opacity: 0.8,
  },
  groceryCheckbox: {
    marginRight: 15,
    width: 30,
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  groceryItemContent: {
    flex: 1,
  },
  groceryItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groceryItemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  groceryItemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  groceryItemQuantityChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  groceryItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  groceryItemPriceChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  shareGroceryButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  shareGroceryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveActionButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  newPlanButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 25,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MealPlanScreen;