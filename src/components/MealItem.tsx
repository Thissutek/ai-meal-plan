import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Meal } from '../../App';

interface MealItemProps {
  meal: Meal;
  isExpanded: boolean;
  onToggleExpansion: (mealId: string) => void;
  formatPrice: (price: number) => string;
}

const MealItem: React.FC<MealItemProps> = ({
  meal,
  isExpanded,
  onToggleExpansion,
  formatPrice,
}) => {
  return (
    <View key={meal.id} style={styles.mealCard}>
      <TouchableOpacity
        style={styles.mealHeader}
        onPress={() => onToggleExpansion(meal.id)}
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

const styles = StyleSheet.create({
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
});

export default MealItem;
