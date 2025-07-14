import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, FlyerData, Product } from '../../App';
import { generateMealPlanFromProducts, serializeMealPlanForNavigation } from '../services/openaiService';
import {
  ProductCard,
  FlyerSection,
  SummaryCard,
  ScannedImages,
  CategorySummary,
  ProductFormModal,
  BottomActions
} from '../components/flyerResults';

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
      const serializedMealPlan = serializeMealPlanForNavigation(mealPlan);
      navigation.navigate('MealPlan', { mealPlan: serializedMealPlan, source: 'camera' });
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
    return (
      <ProductCard
        key={index}
        product={product}
        flyerIndex={flyerIndex}
        productIndex={index}
        onEdit={openEditModal}
        onDelete={deleteProduct}
        formatPrice={formatPrice}
        getCategoryIcon={getCategoryIcon}
        getCategoryColor={getCategoryColor}
      />
    );
  };

  const renderFlyerSection = (flyer: FlyerData, index: number) => {
    return (
      <FlyerSection
        key={index}
        flyer={flyer}
        index={index}
        onAddProduct={openAddModal}
        renderProduct={renderProduct}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Summary Header */}
          <SummaryCard totalProducts={totalProducts} totalStores={totalStores} />

          {/* Scanned Images Preview */}
          <ScannedImages imageUris={imageUris} />

          {/* Flyer Results */}
          {flyerData.map((flyer, index) => renderFlyerSection(flyer, index))}

          {/* Products by Category Summary */}
          {totalProducts > 0 && (
            <CategorySummary allProducts={allProducts} getCategoryIcon={getCategoryIcon} />
          )}
        </View>
      </ScrollView>

      {/* Edit/Add Product Modal */}
      <ProductFormModal
        visible={editingProduct !== null || showAddProductModal}
        editingProduct={editingProduct}
        editForm={editForm}
        onClose={() => {
          setEditingProduct(null);
          setShowAddProductModal(false);
          resetEditForm();
        }}
        onSave={saveProductEdit}
        setEditForm={setEditForm}
        categories={categories}
        getCategoryIcon={getCategoryIcon}
        getCategoryColor={getCategoryColor}
      />

      {/* Bottom Action */}
      <BottomActions
        totalProducts={totalProducts}
        isGenerating={isGenerating}
        onBack={() => navigation.goBack()}
        onGenerate={generateMealPlan}
      />
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
});

export default FlyerResultsScreen;