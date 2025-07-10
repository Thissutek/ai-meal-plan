import React, { useState } from 'react';
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
import { RootStackParamList, MealPlan, Meal } from '../../App';
import { saveMealPlan } from '../services/mealPlanStorage';
import WeeklyMealPlanGrid from '../components/WeeklyMealPlanGrid';

type Props = StackScreenProps<RootStackParamList, 'MealPlan'>;

const MealPlanScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mealPlan } = route.params;
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mealPlanTitle, setMealPlanTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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
      <View style={styles.categorySection}>
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

  return (
    <SafeAreaView style={styles.container}>
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

      {showWeeklyView ? (
        <View style={styles.weeklyViewContainer}>
          <WeeklyMealPlanGrid
            mealPlan={mealPlan}
            onDaySelected={handleDaySelected}
          />
          <ScrollView style={styles.selectedDayScrollView}>
            {renderDayMeals()}
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Meal Plan Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Family Size:</Text>
              <Text style={styles.summaryValue}>
                {mealPlan.familySize} {mealPlan.familySize === 1 ? 'person' : 'people'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cost:</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(mealPlan.totalCost)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average per day:</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(mealPlan.totalCost / 7)}
              </Text>
            </View>

            {mealPlan.preferences && (
              <View style={styles.preferencesContainer}>
                <Text style={styles.preferencesTitle}>Preferences Applied:</Text>
                {mealPlan.preferences.allergies.length > 0 && (
                  <Text style={styles.preferencesText}>
                    Allergies: {mealPlan.preferences.allergies.join(', ')}
                  </Text>
                )}
                {mealPlan.preferences.dietaryRestrictions.length > 0 && (
                  <Text style={styles.preferencesText}>
                    Dietary Restrictions: {mealPlan.preferences.dietaryRestrictions.join(', ')}
                  </Text>
                )}
                {mealPlan.preferences.budget && (
                  <Text style={styles.preferencesText}>
                    Budget: {formatPrice(mealPlan.preferences.budget)}
                  </Text>
                )}
              </View>
            )}
          </View>

          {renderMealCategory('breakfast', 'Breakfast', '🍳')}
          {renderMealCategory('lunch', 'Lunch', '🥪')}
          {renderMealCategory('dinner', 'Dinner', '🍽️')}
          {renderMealCategory('snack', 'Snacks', '🍌')}
        </ScrollView>
      )}
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
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  preferencesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
});

export default MealPlanScreen;
