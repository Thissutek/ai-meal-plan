import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, FlyerData, Product } from '../../App';
import { generateMealPlanFromProducts } from '../services/openaiService';

type Props = StackScreenProps<RootStackParamList, 'FlyerResults'>;

const FlyerResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { flyerData, imageUris, preferences } = route.params;
  const [isGenerating, setIsGenerating] = useState(false);

  const allProducts = flyerData.flatMap(flyer => flyer.products);
  const totalProducts = allProducts.length;
  const totalStores = flyerData.length;

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      produce: '🥬',
      meat: '🥩',
      dairy: '🥛',
      pantry: '🥫',
      snacks: '🍿',
      beverages: '🥤',
      frozen: '🧊',
      bakery: '🍞',
      deli: '🥪',
      other: '🛒'
    };
    return icons[category.toLowerCase()] || icons.other;
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      produce: '#4CAF50',
      meat: '#F44336',
      dairy: '#2196F3',
      pantry: '#FF9800',
      snacks: '#9C27B0',
      beverages: '#00BCD4',
      frozen: '#607D8B',
      bakery: '#795548',
      deli: '#FF5722',
      other: '#9E9E9E'
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const generateMealPlan = async () => {
    if (allProducts.length === 0) {
      Alert.alert('No Products', 'No products were found in the flyers. Please try scanning again with better lighting.');
      return;
    }

    setIsGenerating(true);

    try {
      const mealPlan = await generateMealPlanFromProducts(allProducts, preferences);
      navigation.navigate('MealPlan', { mealPlan });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      Alert.alert(
        'Generation Error',
        'Failed to generate meal plan. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const renderProduct = (product: Product, index: number) => {
    const categoryColor = getCategoryColor(product.category);
    const categoryIcon = getCategoryIcon(product.category);

    return (
      <View key={index} style={styles.productCard}>
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
      </View>
    );
  };

  const renderFlyerSection = (flyer: FlyerData, index: number) => {
    if (flyer.products.length === 0) {
      return (
        <View key={index} style={styles.flyerSection}>
          <View style={styles.flyerHeader}>
            <Text style={styles.flyerTitle}>📄 {flyer.storeName}</Text>
            <Text style={styles.noProductsText}>No products found in this flyer</Text>
          </View>
        </View>
      );
    }

    return (
      <View key={index} style={styles.flyerSection}>
        <View style={styles.flyerHeader}>
          <Text style={styles.flyerTitle}>🏪 {flyer.storeName}</Text>
          <Text style={styles.productCount}>
            {flyer.products.length} product{flyer.products.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {flyer.products.map((product, productIndex) =>
          renderProduct(product, productIndex)
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>

          {/* Summary Header */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Flyer Parsing Results</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalProducts}</Text>
                <Text style={styles.statLabel}>Products Found</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalStores}</Text>
                <Text style={styles.statLabel}>Store{totalStores !== 1 ? 's' : ''} Scanned</Text>
              </View>
            </View>

            {totalProducts === 0 && (
              <View style={styles.noDataWarning}>
                <Text style={styles.noDataText}>
                  ⚠️ No products were detected in your flyer images. This could be due to:
                </Text>
                <Text style={styles.noDataTip}>• Poor image quality or lighting</Text>
                <Text style={styles.noDataTip}>• Text that's too small to read</Text>
                <Text style={styles.noDataTip}>• Flyers without clear price information</Text>
              </View>
            )}
          </View>

          {/* Scanned Images Preview */}
          <View style={styles.imagesSection}>
            <Text style={styles.imagesSectionTitle}>Scanned Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesContainer}>
                {imageUris.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.previewImage} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Flyer Results */}
          {flyerData.map((flyer, index) => renderFlyerSection(flyer, index))}

          {/* Products by Category Summary */}
          {totalProducts > 0 && (
            <View style={styles.categorySummary}>
              <Text style={styles.categorySummaryTitle}>Products by Category</Text>
              {Object.entries(
                allProducts.reduce((acc, product) => {
                  acc[product.category] = (acc[product.category] || 0) + 1;
                  return acc;
                }, {} as { [key: string]: number })
              ).map(([category, count]) => (
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
          )}

        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>📷 Scan Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.generateButton,
            (totalProducts === 0 || isGenerating) && styles.generateButtonDisabled
          ]}
          onPress={generateMealPlan}
          disabled={totalProducts === 0 || isGenerating}
        >
          {isGenerating ? (
            <View style={styles.generatingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </View>
          ) : (
            <Text style={styles.generateButtonText}>
              🍽️ Generate Meal Plan
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  noDataWarning: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noDataText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  noDataTip: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 2,
    paddingLeft: 10,
  },
  imagesSection: {
    marginBottom: 20,
  },
  imagesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  previewImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  flyerSection: {
    marginBottom: 20,
  },
  flyerHeader: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flyerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },
  noProductsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
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
  bottomContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generateButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default FlyerResultsScreen;
