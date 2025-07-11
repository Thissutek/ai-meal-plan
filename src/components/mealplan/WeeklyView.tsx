import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { MealPlan, Meal } from '../../App';
import WeeklyMealPlanGrid from './WeeklyMealPlanGrid';
import DayMealsView from './DayMealsView';

interface WeeklyViewProps {
  mealPlan: MealPlan;
  selectedDayMeals: Meal[];
  selectedDayIndex: number;
  expandedMeal: string | null;
  toggleMealExpansion: (mealId: string) => void;
  onDaySelected: (dayIndex: number, meals: Meal[]) => void;
  formatPrice: (price: number) => string;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  mealPlan,
  selectedDayMeals,
  selectedDayIndex,
  expandedMeal,
  toggleMealExpansion,
  onDaySelected,
  formatPrice,
}) => {
  return (
    <View style={styles.weeklyViewContainer}>
      <WeeklyMealPlanGrid
        mealPlan={mealPlan}
        onDaySelected={onDaySelected}
      />
      <ScrollView style={styles.selectedDayScrollView}>
        <DayMealsView
          selectedDayMeals={selectedDayMeals}
          selectedDayIndex={selectedDayIndex}
          expandedMeal={expandedMeal}
          toggleMealExpansion={toggleMealExpansion}
          formatPrice={formatPrice}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  weeklyViewContainer: {
    flex: 1,
  },
  selectedDayScrollView: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
});

export default WeeklyView;
