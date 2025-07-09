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
  TextInput,
  Modal,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, FlyerData, Product } from '../../App';
import { generateMealPlanFromProducts } from '../services/openaiService';

type Props = StackScreenProps<RootStackParamList, 'FlyerResults'>;

const FlyerResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { flyerData: initialFlyerData, imageUris, preferences } = route.params;
  const [flyerData, setFlyerData] = useState<FlyerData[]>(initialFlyerData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ product: Product, flyerIndex: number, productIndex: number } | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedFlyerIndex, setSelectedFlyerIndex] = useState(0);

  // Form state for editing/adding products
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: 'other',
    unit: '',
    originalPrice: '',
    onSale: false
  });

  const allProducts = flyerData.flatMap(flyer => flyer.products);
  const totalProducts = allProducts.length;
  const totalStores = flyerData.length;

  const categories = ['produce', 'meat', 'dairy', 'pantry', 'snacks', 'beverages', 'frozen', 'bakery', 'deli', 'other'];

  const resetEditForm = () => {
    setEditForm({
      name: '',
      price: '',
      category: 'other',
      unit: '',
      originalPrice: '',
      onSale: false
    });
  };

  const openEditModal = (product: Product, flyerIndex: number, productIndex: number) => {
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      unit: product.unit || '',
      originalPrice: product.originalPrice?.toString() || '',
      onSale: product.onSale || false
    });
    setEditingProduct({ product, flyerIndex, productIndex });
  };

  const openAddModal = (flyerIndex: number) => {
    resetEditForm();
    setSelectedFlyerIndex(flyerIndex);
    setShowAddProductModal(true);
  };

  const saveProductEdit = () => {
    if (!editForm.name.trim() || !editForm.price.trim()) {
      Alert.alert('Missing Information', 'Please enter both product name and price.');
      return;
    }

    const price = parseFloat(editForm.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    const originalPrice = editForm.originalPrice ? parseFloat(editForm.originalPrice) : undefined;
    if (editForm.originalPrice && (isNaN(originalPrice!) || originalPrice! <= price)) {
      Alert.alert('Invalid Original Price', 'Original price must be higher than sale price.');
      return;
    }

    const updatedProduct: Product = {
      name: editForm.name.trim(),
      price: price,
      category: editForm.category,
      unit: editForm.unit.trim() || undefined,
      originalPrice: originalPrice,
      onSale: editForm.onSale && originalPrice !== undefined
    };

    if (editingProduct) {
      // Update existing product
      const newFlyerData = [...flyerData];
      newFlyerData[editingProduct.flyerIndex].products[editingProduct.productIndex] = updatedProduct;
      setFlyerData(newFlyerData);
      setEditingProduct(null);
    } else {
      // Add new product
      const newFlyerData = [...flyerData];
      newFlyerData[selectedFlyerIndex].products.push(updatedProduct);
      setFlyerData(newFlyerData);
      setShowAddProductModal(false);
    }

    resetEditForm();
  };

  const deleteProduct = (flyerIndex: number, productIndex: number) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to remove this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newFlyerData = [...flyerData];
            newFlyerData[flyerIndex].products.splice(productIndex, 1);
            setFlyerData(newFlyerData);
          }
        }
      ]
    );
  };

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

  const renderProduct = (product: Product, index: number, flyerIndex: number) => {
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

        {/* Edit/Delete Controls */}
        <View style={styles.productControls}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(product, flyerIndex, index)}
          >
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteProduct(flyerIndex, index)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFlyerSection = (flyer: FlyerData, index: number) => {
    return (
      <View key={index} style={styles.flyerSection}>
        <View style={styles.flyerHeader}>
          <Text style={styles.flyerTitle}>🏪 {flyer.storeName}</Text>
          <View style={styles.flyerHeaderActions}>
            <Text style={styles.productCount}>
              {flyer.products.length} product{flyer.products.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={() => openAddModal(index)}
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
              onPress={() => openAddModal(index)}
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

      {/* Edit/Add Product Modal */}
      <Modal
        visible={editingProduct !== null || showAddProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setEditingProduct(null);
          setShowAddProductModal(false);
          resetEditForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>

            <ScrollView style={styles.modalForm}>
              {/* Product Name */}
              <Text style={styles.fieldLabel}>Product Name *</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="e.g., Organic Bananas"
                autoCapitalize="words"
              />

              {/* Price */}
              <Text style={styles.fieldLabel}>Price *</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.price}
                onChangeText={(text) => setEditForm({ ...editForm, price: text })}
                placeholder="e.g., 2.99"
                keyboardType="decimal-pad"
              />

              {/* Category */}
              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      editForm.category === category && styles.categoryOptionSelected,
                      { backgroundColor: editForm.category === category ? getCategoryColor(category) : '#f0f0f0' }
                    ]}
                    onPress={() => setEditForm({ ...editForm, category })}
                  >
                    <Text style={styles.categoryOptionIcon}>{getCategoryIcon(category)}</Text>
                    <Text style={[
                      styles.categoryOptionText,
                      editForm.category === category && styles.categoryOptionTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Unit */}
              <Text style={styles.fieldLabel}>Unit (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.unit}
                onChangeText={(text) => setEditForm({ ...editForm, unit: text })}
                placeholder="e.g., lb, kg, each"
              />

              {/* Sale Toggle */}
              <View style={styles.saleContainer}>
                <TouchableOpacity
                  style={[styles.saleToggle, editForm.onSale && styles.saleToggleActive]}
                  onPress={() => setEditForm({ ...editForm, onSale: !editForm.onSale })}
                >
                  <Text style={[styles.saleToggleText, editForm.onSale && styles.saleToggleTextActive]}>
                    {editForm.onSale ? '✓' : '○'} On Sale
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Original Price (if on sale) */}
              {editForm.onSale && (
                <>
                  <Text style={styles.fieldLabel}>Original Price</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.originalPrice}
                    onChangeText={(text) => setEditForm({ ...editForm, originalPrice: text })}
                    placeholder="e.g., 3.99"
                    keyboardType="decimal-pad"
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setEditingProduct(null);
                  setShowAddProductModal(false);
                  resetEditForm();
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={saveProductEdit}
              >
                <Text style={styles.modalSaveButtonText}>
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalForm: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  categoryScroll: {
    marginVertical: 10,
  },
  categoryOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 70,
  },
  categoryOptionSelected: {
    // Background color set dynamically
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'capitalize',
  },
  categoryOptionTextSelected: {
    color: '#fff',
  },
  saleContainer: {
    marginVertical: 15,
  },
  saleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  saleToggleActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  saleToggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  saleToggleTextActive: {
    color: '#4CAF50',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  modalSaveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
