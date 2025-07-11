import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Meal } from '../../App';
import MealItem from './MealItem';

interface DayMealsViewProps {
  selectedDayMeals: Meal[];
  selectedDayIndex: number;
  expandedMeal: string | null;
  toggleMealExpansion: (mealId: string) => void;
  formatPrice: (price: number) => string;
}

const DayMealsView: React.FC<DayMealsViewProps> = ({
  selectedDayMeals,
  selectedDayIndex,
  expandedMeal,
  toggleMealExpansion,
  formatPrice,
}) => {
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
          {mealsByCategory.breakfast.map(meal => (
            <MealItem
              key={meal.id}
              meal={meal}
              isExpanded={expandedMeal === meal.id}
              onToggleExpansion={toggleMealExpansion}
              formatPrice={formatPrice}
            />
          ))}
        </View>
      )}

      {mealsByCategory.lunch.length > 0 && (
        <View style={styles.mealCategorySection}>
          <Text style={styles.mealCategoryTitle}>🥪 Lunch</Text>
          {mealsByCategory.lunch.map(meal => (
            <MealItem
              key={meal.id}
              meal={meal}
              isExpanded={expandedMeal === meal.id}
              onToggleExpansion={toggleMealExpansion}
              formatPrice={formatPrice}
            />
          ))}
        </View>
      )}

      {mealsByCategory.dinner.length > 0 && (
        <View style={styles.mealCategorySection}>
          <Text style={styles.mealCategoryTitle}>🍽️ Dinner</Text>
          {mealsByCategory.dinner.map(meal => (
            <MealItem
              key={meal.id}
              meal={meal}
              isExpanded={expandedMeal === meal.id}
              onToggleExpansion={toggleMealExpansion}
              formatPrice={formatPrice}
            />
          ))}
        </View>
      )}

      {mealsByCategory.snack.length > 0 && (
        <View style={styles.mealCategorySection}>
          <Text style={styles.mealCategoryTitle}>🍌 Snacks</Text>
          {mealsByCategory.snack.map(meal => (
            <MealItem
              key={meal.id}
              meal={meal}
              isExpanded={expandedMeal === meal.id}
              onToggleExpansion={toggleMealExpansion}
              formatPrice={formatPrice}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default DayMealsView;
