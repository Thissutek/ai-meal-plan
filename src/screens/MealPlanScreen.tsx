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
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MealPlan, Meal } from '../../App';

type Props = StackScreenProps<RootStackParamList, 'MealPlan'>;

const MealPlanScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mealPlan } = route.params;
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const toggleMealExpansion = (mealId: string) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId);
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const getMealsByCategory = (category: string) => {
    return mealPlan.meals.filter(meal => meal.category === category);
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

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={shareMealPlan}
        >
          <Text style={styles.actionButtonText}>📤 Share Plan</Text>
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
  shareButton: {
    backgroundColor: '#2196F3',
  },
  newPlanButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MealPlanScreen;
