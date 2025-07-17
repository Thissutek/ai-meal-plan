import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { MealPlan, GroceryList, GroceryItem, StoreSection } from '../../App';

interface Props {
  mealPlan: MealPlan;
  onGroceryListUpdate: (groceryList: GroceryList) => void;
}

const GroceryListComponent: React.FC<Props> = ({ mealPlan, onGroceryListUpdate }) => {
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [viewMode, setViewMode] = useState<'category' | 'store'>('category');

  useEffect(() => {
    // Generate grocery list from meal plan if it doesn't exist
    if (mealPlan.groceryList) {
      setGroceryList(mealPlan.groceryList);
    } else {
      const generatedList = generateGroceryList(mealPlan);
      setGroceryList(generatedList);
      onGroceryListUpdate(generatedList);
    }
  }, [mealPlan]);

  const generateGroceryList = (mealPlan: MealPlan): GroceryList => {
    const consolidatedItems = new Map<string, GroceryItem>();
    let itemIdCounter = 1;

    // Consolidate ingredients from all meals
    mealPlan.meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase().trim();

        if (consolidatedItems.has(key)) {
          const existing = consolidatedItems.get(key)!;
          // Simple quantity consolidation (could be improved with unit parsing)
          existing.price += ingredient.price;
          existing.quantity = combineQuantities(existing.quantity, ingredient.quantity);
        } else {
          consolidatedItems.set(key, {
            id: `item_${itemIdCounter++}`,
            name: ingredient.name,
            quantity: ingredient.quantity,
            price: ingredient.price,
            category: getCategoryFromName(ingredient.name),
            isChecked: false,
          });
        }
      });
    });

    const items = Array.from(consolidatedItems.values());
    const totalCost = items.reduce((sum, item) => sum + item.price, 0);

    // Group by store (simplified - in real implementation, you'd use the store from flyer data)
    const stores = groupItemsByStore(items);

    return {
      items,
      totalCost,
      stores,
      checkedItems: [],
    };
  };

  const combineQuantities = (qty1: string, qty2: string): string => {
    // Simple combination - in reality, you'd want better unit parsing
    const num1 = parseFloat(qty1);
    const num2 = parseFloat(qty2);

    if (!isNaN(num1) && !isNaN(num2)) {
      const unit = qty1.replace(num1.toString(), '').trim();
      return `${(num1 + num2).toString()} ${unit}`;
    }

    return `${qty1}, ${qty2}`;
  };

  const getCategoryFromName = (name: string): string => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('egg') || lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) return 'dairy';
    if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('turkey') || lowerName.includes('meat')) return 'meat';
    if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('lettuce') || lowerName.includes('tomato')) return 'produce';
    if (lowerName.includes('bread') || lowerName.includes('pasta') || lowerName.includes('rice')) return 'pantry';
    if (lowerName.includes('soda') || lowerName.includes('juice') || lowerName.includes('water')) return 'beverages';

    return 'other';
  };

  const groupItemsByStore = (items: GroceryItem[]): StoreSection[] => {
    // Simplified store grouping - in reality, you'd use actual store data from flyers
    const storeGroups = items.reduce((groups, item) => {
      const store = item.store || 'General Store';
      if (!groups[store]) {
        groups[store] = [];
      }
      groups[store].push(item);
      return groups;
    }, {} as { [storeName: string]: GroceryItem[] });

    return Object.entries(storeGroups).map(([storeName, items]) => ({
      storeName,
      items,
      totalCost: items.reduce((sum, item) => sum + item.price, 0),
    }));
  };

  const toggleItemCheck = (itemId: string) => {
    if (!groceryList) return;

    const updatedItems = groceryList.items.map(item =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    const updatedCheckedItems = updatedItems
      .filter(item => item.isChecked)
      .map(item => item.id);

    const updatedGroceryList = {
      ...groceryList,
      items: updatedItems,
      checkedItems: updatedCheckedItems,
    };

    setGroceryList(updatedGroceryList);
    onGroceryListUpdate(updatedGroceryList);
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const shareGroceryList = async () => {
    if (!groceryList) return;

    const listText = generateShareText();
    try {
      await Share.share({
        message: listText,
        title: 'Grocery Shopping List',
      });
    } catch (error) {
      console.error('Error sharing grocery list:', error);
    }
  };

  const generateShareText = (): string => {
    if (!groceryList) return '';

    let text = `🛒 Grocery Shopping List\n`;
    text += `Total Cost: ${formatPrice(groceryList.totalCost)}\n\n`;

    if (viewMode === 'category') {
      const categories = ['dairy', 'meat', 'produce', 'pantry', 'beverages', 'other'];

      categories.forEach(category => {
        const categoryItems = groceryList.items.filter(item => item.category === category);
        if (categoryItems.length > 0) {
          text += `${category.toUpperCase()}:\n`;
          categoryItems.forEach(item => {
            text += `${item.isChecked ? '✓' : '○'} ${item.quantity} ${item.name} - ${formatPrice(item.price)}\n`;
          });
          text += '\n';
        }
      });
    } else {
      groceryList.stores.forEach(store => {
        text += `${store.storeName.toUpperCase()} - ${formatPrice(store.totalCost)}:\n`;
        store.items.forEach(item => {
          text += `${item.isChecked ? '✓' : '○'} ${item.quantity} ${item.name} - ${formatPrice(item.price)}\n`;
        });
        text += '\n';
      });
    }

    return text;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      produce: '🥬',
      meat: '🥩',
      dairy: '🥛',
      pantry: '🥫',
      snacks: '🍿',
      beverages: '🥤',
      other: '🛒'
    };
    return icons[category] || icons.other;
  };

  const renderItemsByCategory = () => {
    if (!groceryList) return null;

    const categories = ['dairy', 'meat', 'produce', 'pantry', 'beverages', 'other'];

    return categories.map(category => {
      const categoryItems = groceryList.items.filter(item => item.category === category);
      if (categoryItems.length === 0) return null;

      const categoryTotal = categoryItems.reduce((sum, item) => sum + item.price, 0);

      return (
        <View key={category} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>
              {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Text style={styles.categoryTotal}>{formatPrice(categoryTotal)}</Text>
          </View>

          {categoryItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.groceryItem, item.isChecked && styles.groceryItemChecked]}
              onPress={() => toggleItemCheck(item.id)}
            >
              <View style={styles.itemCheckbox}>
                <Text style={styles.checkboxText}>
                  {item.isChecked ? '✓' : '○'}
                </Text>
              </View>

              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, item.isChecked && styles.itemNameChecked]}>
                  {item.quantity} {item.name}
                </Text>
              </View>

              <Text style={[styles.itemPrice, item.isChecked && styles.itemPriceChecked]}>
                {formatPrice(item.price)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    });
  };

  const renderItemsByStore = () => {
    if (!groceryList) return null;

    return groceryList.stores.map(store => (
      <View key={store.storeName} style={styles.storeSection}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeTitle}>🏪 {store.storeName}</Text>
          <Text style={styles.storeTotal}>{formatPrice(store.totalCost)}</Text>
        </View>

        {store.items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.groceryItem, item.isChecked && styles.groceryItemChecked]}
            onPress={() => toggleItemCheck(item.id)}
          >
            <View style={styles.itemCheckbox}>
              <Text style={styles.checkboxText}>
                {item.isChecked ? '✓' : '○'}
              </Text>
            </View>

            <View style={styles.itemDetails}>
              <Text style={[styles.itemName, item.isChecked && styles.itemNameChecked]}>
                {item.quantity} {item.name}
              </Text>
            </View>

            <Text style={[styles.itemPrice, item.isChecked && styles.itemPriceChecked]}>
              {formatPrice(item.price)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  if (!groceryList) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Generating grocery list...</Text>
      </View>
    );
  }

  const checkedCount = groceryList.items.filter(item => item.isChecked).length;
  const totalItems = groceryList.items.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Grocery Shopping List</Text>
        <Text style={styles.subtitle}>
          {checkedCount}/{totalItems} items • {formatPrice(groceryList.totalCost)}
        </Text>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'category' && styles.toggleButtonActive]}
          onPress={() => setViewMode('category')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'category' && styles.toggleButtonTextActive]}>
            By Category
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'store' && styles.toggleButtonActive]}
          onPress={() => setViewMode('store')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'store' && styles.toggleButtonTextActive]}>
            By Store
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <ScrollView style={styles.itemsList}>
        {viewMode === 'category' ? renderItemsByCategory() : renderItemsByStore()}
      </ScrollView>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={shareGroceryList}>
        <Text style={styles.shareButtonText}>📤 Share Grocery List</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  storeSection: {
    marginBottom: 20,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  storeTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groceryItemChecked: {
    backgroundColor: '#f0f9f0',
    opacity: 0.7,
  },
  itemCheckbox: {
    marginRight: 15,
  },
  checkboxText: {
    fontSize: 20,
    color: '#4CAF50',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemPriceChecked: {
    color: '#999',
  },
  shareButton: {
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroceryListComponent;
