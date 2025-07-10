import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MealPlan, Meal } from '../../App';

interface WeeklyMealPlanGridProps {
  mealPlan: MealPlan;
  onDaySelected: (dayIndex: number, meals: Meal[]) => void;
}

const WeeklyMealPlanGrid: React.FC<WeeklyMealPlanGridProps> = ({ mealPlan, onDaySelected }) => {
  const [selectedDay, setSelectedDay] = useState<number>(0); // Default to first day (Monday)
  
  // Define the days of the week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Distribute meals across the week
  const distributeMealsAcrossDays = (): Meal[][] => {
    const mealsByDay: Meal[][] = Array(7).fill(null).map(() => []);
    const mealsByCategory = {
      breakfast: mealPlan.meals.filter(meal => meal.category === 'breakfast'),
      lunch: mealPlan.meals.filter(meal => meal.category === 'lunch'),
      dinner: mealPlan.meals.filter(meal => meal.category === 'dinner'),
      snack: mealPlan.meals.filter(meal => meal.category === 'snack'),
    };
    
    // Distribute breakfast meals
    mealsByCategory.breakfast.forEach((meal, index) => {
      const dayIndex = index % 7;
      mealsByDay[dayIndex].push(meal);
    });
    
    // Distribute lunch meals
    mealsByCategory.lunch.forEach((meal, index) => {
      const dayIndex = index % 7;
      mealsByDay[dayIndex].push(meal);
    });
    
    // Distribute dinner meals
    mealsByCategory.dinner.forEach((meal, index) => {
      const dayIndex = index % 7;
      mealsByDay[dayIndex].push(meal);
    });
    
    // Distribute snack meals
    mealsByCategory.snack.forEach((meal, index) => {
      const dayIndex = index % 7;
      mealsByDay[dayIndex].push(meal);
    });
    
    return mealsByDay;
  };
  
  const mealsByDay = distributeMealsAcrossDays();
  
  // Call onDaySelected with the initial day on first render
  React.useEffect(() => {
    handleDayPress(0);
  }, []);
  
  const handleDayPress = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    onDaySelected(dayIndex, mealsByDay[dayIndex]);
  };
  
  // Calculate daily costs
  const getDailyCost = (dayIndex: number): number => {
    return mealsByDay[dayIndex].reduce((sum, meal) => sum + meal.cost, 0);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Meal Plan</Text>
      <Text style={styles.subtitle}>
        For {mealPlan.familySize} {mealPlan.familySize === 1 ? 'person' : 'people'} - 
        Total: ${mealPlan.totalCost.toFixed(2)}
      </Text>
      
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDay === index && styles.selectedDayButton]}
            onPress={() => handleDayPress(index)}
          >
            <Text style={[styles.dayText, selectedDay === index && styles.selectedDayText]}>
              {day}
            </Text>
            <Text style={[styles.dayCost, selectedDay === index && styles.selectedDayCost]}>
              ${getDailyCost(index).toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDayButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
  },
  dayCost: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  selectedDayCost: {
    color: '#fff',
  },
});

export default WeeklyMealPlanGrid;
