import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategorySummaryProps } from './types';

const CategorySummary: React.FC<CategorySummaryProps> = ({ allProducts, getCategoryIcon }) => {
  // Group products by category and count them
  const categoryCounts = allProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <View style={styles.categorySummary}>
      <Text style={styles.categorySummaryTitle}>Products by Category</Text>
      {Object.entries(categoryCounts).map(([category, count]) => (
        <View key={category} style={styles.categoryRow}>
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(category)}
          </Text>
          <Text style={styles.categoryName}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
          <Text style={styles.categoryCount}>
            {count} item{count !== 1 ? 's' : ''}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  categorySummary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  categorySummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default CategorySummary;
