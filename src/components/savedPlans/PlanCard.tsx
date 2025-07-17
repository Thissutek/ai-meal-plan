import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlanCardProps } from './types';

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  onViewPlan, 
  onDeletePlan,
  formatDate,
  formatPrice
}) => {
  return (
    <View style={styles.planCard}>
      <TouchableOpacity
        style={styles.planContent}
        onPress={() => onViewPlan(plan)}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{plan.title}</Text>
        </View>

        <View style={styles.planStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Cost</Text>
            <Text style={styles.statValue}>{formatPrice(plan.totalCost)}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Family Size</Text>
            <Text style={styles.statValue}>
              {plan.familySize} {plan.familySize === 1 ? 'person' : 'people'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Meals</Text>
            <Text style={styles.statValue}>{plan.meals.length} meals</Text>
          </View>
        </View>

        <View style={styles.planFooter}>
          <Text style={styles.planDate}>
            Saved {formatDate(plan.savedAt)}
          </Text>

          {plan.preferences.allergies.length > 0 && (
            <Text style={styles.allergiesText}>
              🚫 {plan.preferences.allergies.join(', ')}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDeletePlan(plan)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 15,
  },
  planContent: {
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  planFooter: {
    gap: 5,
  },
  planDate: {
    fontSize: 14,
    color: '#666',
  },
  allergiesText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#F44336',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default PlanCard;
