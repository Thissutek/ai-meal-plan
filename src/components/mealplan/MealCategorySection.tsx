import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Meal } from '../../App';
import MealItem from './MealItem';

interface MealCategorySectionProps {
  category: string;
  displayName: string;
  icon: string;
  meals: Meal[];
  expandedMeal: string | null;
  toggleMealExpansion: (mealId: string) => void;
  formatPrice: (price: number) => string;
}

const MealCategorySection: React.FC<MealCategorySectionProps> = ({
  category,
  displayName,
  icon,
  meals,
  expandedMeal,
  toggleMealExpansion,
  formatPrice,
}) => {
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
      {meals.map(meal => (
        <MealItem
          key={meal.id}
          meal={meal}
          isExpanded={expandedMeal === meal.id}
          onToggleExpansion={toggleMealExpansion}
          formatPrice={formatPrice}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default MealCategorySection;
