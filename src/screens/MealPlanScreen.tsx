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
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MealPlan, Meal, SerializableMealPlan } from '../../App';
import { saveMealPlan } from '../services/mealPlanStorage';

type Props = StackScreenProps<RootStackParamList, 'MealPlan'>;

const MealPlanScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mealPlan: serializedMealPlan } = route.params;

  // Convert serialized meal plan back to proper MealPlan with Date objects
  const mealPlan: MealPlan = {
    ...serializedMealPlan,
    savedAt: serializedMealPlan.savedAt ? new Date(serializedMealPlan.savedAt) : undefined
  } as MealPlan;

  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mealPlanTitle, setMealPlanTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'meals' | 'grocery'>('meals');

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

  // Simple grocery list generation
  const generateGroceryList = () => {
    const ingredients = new Map();

    mealPlan.meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        if (ingredients.has(key)) {
          const existing = ingredients.get(key);
          existing.price += ingredient.price;
          existing.quantity = `${existing.quantity}, ${ingredient.quantity}`;
        } else {
          ingredients.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity,
            price: ingredient.price
          });
        }
      });
    });

    return Array.from(ingredients.values());
  };

  const renderSimpleGroceryList = () => {
    const groceryItems = generateGroceryList();
    const totalCost = groceryItems.reduce((sum, item) => sum + item.price, 0);

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Grocery Shopping List</Text>
            <Text style={styles.summarySubtitle}>
              {groceryItems.length} items • {formatPrice(totalCost)}
            </Text>
          </View>

          {groceryItems.map((item, index) => (
            <View key={index} style={styles.groceryItem}>
              <View style={styles.groceryItemContent}>
                <Text style={styles.groceryItemName}>{item.name}</Text>
                <Text style={styles.groceryItemQuantity}>{item.quantity}</Text>
              </View>
              <Text style={styles.groceryItemPrice}>{formatPrice(item.price)}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.shareGroceryButton}
            onPress={() => shareGroceryList(groceryItems, totalCost)}
          >
            <Text style={styles.shareGroceryButtonText}>📤 Share Grocery List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const shareGroceryList = async (items: any[], totalCost: number) => {
    let text = `🛒 Grocery Shopping List\n`;
    text += `Total Cost: ${formatPrice(totalCost)}\n\n`;

    items.forEach(item => {
      text += `• ${item.quantity} ${item.name} - ${formatPrice(item.price)}\n`;
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

      {/* Content */}
      {activeTab === 'meals' ? (
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
      ) : (
        renderSimpleGroceryList()
      )}

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
  groceryItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  groceryItemContent: {
    flex: 1,
  },
  groceryItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groceryItemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  groceryItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
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
});

export default MealPlanScreen;
