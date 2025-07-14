import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { MealPlan } from '../../App';
import MealPlanSummary from './MealPlanSummary';
import MealCategorySection from './MealCategorySection';

interface ListMealsViewProps {
  mealPlan: MealPlan;
  expandedMeal: string | null;
  toggleMealExpansion: (mealId: string) => void;
  formatPrice: (price: number) => string;
  getMealsByCategory: (category: string) => any[];
}

const ListMealsView: React.FC<ListMealsViewProps> = ({
  mealPlan,
  expandedMeal,
  toggleMealExpansion,
  formatPrice,
  getMealsByCategory,
}) => {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <MealPlanSummary mealPlan={mealPlan} formatPrice={formatPrice} />

        {/* Meal Categories */}
        <MealCategorySection
          category="breakfast"
          displayName="Breakfast"
          icon="🌅"
          meals={getMealsByCategory('breakfast')}
          expandedMeal={expandedMeal}
          toggleMealExpansion={toggleMealExpansion}
          formatPrice={formatPrice}
        />
        <MealCategorySection
          category="lunch"
          displayName="Lunch"
          icon="☀️"
          meals={getMealsByCategory('lunch')}
          expandedMeal={expandedMeal}
          toggleMealExpansion={toggleMealExpansion}
          formatPrice={formatPrice}
        />
        <MealCategorySection
          category="dinner"
          displayName="Dinner"
          icon="🌙"
          meals={getMealsByCategory('dinner')}
          expandedMeal={expandedMeal}
          toggleMealExpansion={toggleMealExpansion}
          formatPrice={formatPrice}
        />
        <MealCategorySection
          category="snack"
          displayName="Snacks"
          icon="🍎"
          meals={getMealsByCategory('snack')}
          expandedMeal={expandedMeal}
          toggleMealExpansion={toggleMealExpansion}
          formatPrice={formatPrice}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
});

export default ListMealsView;
