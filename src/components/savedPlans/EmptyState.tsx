import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EmptyStateProps } from './types';

const EmptyState: React.FC<EmptyStateProps> = ({ onCreatePlan }) => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🍽️</Text>
      <Text style={styles.emptyTitle}>No Saved Meal Plans</Text>
      <Text style={styles.emptyText}>
        Create your first meal plan by scanning grocery flyers
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={onCreatePlan}
      >
        <Text style={styles.createButtonText}>📷 Scan Flyers</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmptyState;
