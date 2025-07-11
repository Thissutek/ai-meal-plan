import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MealPlan } from '../../App';

interface MealPlanSummaryProps {
  mealPlan: MealPlan;
  formatPrice: (price: number) => string;
}

const MealPlanSummary: React.FC<MealPlanSummaryProps> = ({ mealPlan, formatPrice }) => {
  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({
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
});

export default MealPlanSummary;
