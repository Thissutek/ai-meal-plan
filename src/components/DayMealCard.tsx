import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Meal } from '../../App';

interface DayMealCardProps {
  day: string;
  meals: Meal[];
  onPress: () => void;
  isSelected: boolean;
}

const DayMealCard: React.FC<DayMealCardProps> = ({ day, meals, onPress, isSelected }) => {
  // Group meals by category
  const mealsByCategory: Record<string, Meal[]> = {
    breakfast: meals.filter(meal => meal.category === 'breakfast'),
    lunch: meals.filter(meal => meal.category === 'lunch'),
    dinner: meals.filter(meal => meal.category === 'dinner'),
    snack: meals.filter(meal => meal.category === 'snack'),
  };

  // Calculate total cost for the day
  const totalDayCost = meals.reduce((sum, meal) => sum + meal.cost, 0);

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, isSelected && styles.selectedCard]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dayHeader}>
        <Text style={styles.dayText}>{day}</Text>
      </View>
      
      <View style={styles.mealList}>
        {Object.entries(mealsByCategory).map(([category, categoryMeals]) => (
          categoryMeals.length > 0 && (
            <View key={category} style={styles.mealCategory}>
              <Text style={styles.categoryLabel}>
                {category.charAt(0).toUpperCase() + category.slice(1)}:
              </Text>
              {categoryMeals.map(meal => (
                <Text key={meal.id} style={styles.mealName} numberOfLines={1} ellipsizeMode="tail">
                  {meal.name}
                </Text>
              ))}
            </View>
          )
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.totalCost}>{formatPrice(totalDayCost)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flex: 1,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#f0fff0',
  },
  dayHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  mealList: {
    flex: 1,
  },
  mealCategory: {
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  mealName: {
    fontSize: 12,
    color: '#333',
    paddingLeft: 4,
  },
  footer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  totalCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default DayMealCard;
