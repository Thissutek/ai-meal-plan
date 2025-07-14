import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlyerSectionProps } from './types';

const FlyerSection: React.FC<FlyerSectionProps> = ({
  flyer,
  index,
  onAddProduct,
  renderProduct,
}) => {
  return (
    <View style={styles.flyerSection}>
      <View style={styles.flyerHeader}>
        <Text style={styles.flyerTitle}>🏪 {flyer.storeName}</Text>
        <View style={styles.flyerHeaderActions}>
          <Text style={styles.productCount}>
            {flyer.products.length} product{flyer.products.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => onAddProduct(index)}
          >
            <Text style={styles.addProductButtonText}>+ Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {flyer.products.length === 0 ? (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>No products found in this flyer</Text>
          <TouchableOpacity
            style={styles.addFirstProductButton}
            onPress={() => onAddProduct(index)}
          >
            <Text style={styles.addFirstProductButtonText}>+ Add First Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        flyer.products.map((product, productIndex) =>
          renderProduct(product, productIndex, index)
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flyerSection: {
    marginBottom: 20,
  },
  flyerHeader: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'column',
    gap: 10,
  },
  flyerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  flyerHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },
  addProductButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  addProductButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noProductsContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  noProductsText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 15,
  },
  addFirstProductButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFirstProductButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FlyerSection;
