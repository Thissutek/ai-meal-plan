import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
  isChecked: boolean;
}

interface GroceryListViewProps {
  groceryList: GroceryItem[];
  toggleGroceryItem: (itemId: string) => void;
  shareGroceryList: (items: GroceryItem[], totalCost: number) => void;
  formatPrice: (price: number) => string;
}

const GroceryListView: React.FC<GroceryListViewProps> = ({
  groceryList,
  toggleGroceryItem,
  shareGroceryList,
  formatPrice,
}) => {
  const totalCost = groceryList.reduce((sum, item) => sum + item.price, 0);
  const checkedCount = groceryList.filter(item => item.isChecked).length;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Grocery Shopping List</Text>
          <Text style={styles.summarySubtitle}>
            {checkedCount}/{groceryList.length} items checked • {formatPrice(totalCost)}
          </Text>
        </View>

        {groceryList.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.groceryItem, item.isChecked && styles.groceryItemChecked]}
            onPress={() => toggleGroceryItem(item.id)}
          >
            <View style={styles.groceryCheckbox}>
              <Text style={styles.checkboxText}>
                {item.isChecked ? '✓' : '○'}
              </Text>
            </View>
            <View style={styles.groceryItemContent}>
              <Text style={[styles.groceryItemName, item.isChecked && styles.groceryItemNameChecked]}>
                {item.name}
              </Text>
              <Text style={[styles.groceryItemQuantity, item.isChecked && styles.groceryItemQuantityChecked]}>
                {item.quantity}
              </Text>
            </View>
            <Text style={[styles.groceryItemPrice, item.isChecked && styles.groceryItemPriceChecked]}>
              {formatPrice(item.price)}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.shareGroceryButton}
          onPress={() => shareGroceryList(groceryList, totalCost)}
        >
          <Text style={styles.shareGroceryButtonText}>📤 Share Grocery List</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
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
  groceryItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groceryItemChecked: {
    backgroundColor: '#f0f9f0',
    opacity: 0.8,
  },
  groceryCheckbox: {
    marginRight: 15,
    width: 30,
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  groceryItemContent: {
    flex: 1,
  },
  groceryItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groceryItemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  groceryItemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  groceryItemQuantityChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  groceryItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  groceryItemPriceChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  shareGroceryButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  shareGroceryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroceryListView;
