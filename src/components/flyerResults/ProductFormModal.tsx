import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ProductFormModalProps } from './types';

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  editingProduct,
  editForm,
  onClose,
  onSave,
  setEditForm,
  categories,
  getCategoryIcon,
  getCategoryColor,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
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
              onPress={onClose}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={onSave}
            >
              <Text style={styles.modalSaveButtonText}>
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default ProductFormModal;
