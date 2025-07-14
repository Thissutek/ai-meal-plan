import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProductCardProps } from './types';

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  flyerIndex,
  productIndex,
  onEdit,
  onDelete,
  formatPrice,
  getCategoryIcon,
  getCategoryColor,
}) => {
  const categoryColor = getCategoryColor(product.category);
  const categoryIcon = getCategoryIcon(product.category);

  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productName}>
          <Text style={styles.categoryIcon}>{categoryIcon}</Text>
          <Text style={styles.productNameText}>{product.name}</Text>
        </View>
        <View style={styles.priceContainer}>
          {product.onSale && product.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
          <Text style={[styles.price, product.onSale && styles.salePrice]}>
            {formatPrice(product.price)}
          </Text>
        </View>
      </View>

      <View style={styles.productDetails}>
        <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>

        {product.unit && (
          <Text style={styles.unitText}>per {product.unit}</Text>
        )}

        {product.onSale && (
          <View style={styles.saleTag}>
            <Text style={styles.saleText}>ON SALE</Text>
          </View>
        )}
      </View>

      {/* Edit/Delete Controls */}
      <View style={styles.productControls}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(product, flyerIndex, productIndex)}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(flyerIndex, productIndex)}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  productNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  salePrice: {
    color: '#F44336',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  unitText: {
    fontSize: 12,
    color: '#666',
  },
  saleTag: {
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  productControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProductCard;
