import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomAllergyInputProps } from './types';

const CustomAllergyInput: React.FC<CustomAllergyInputProps> = ({
  customAllergy,
  onChangeCustomAllergy,
  onAddCustomAllergy
}) => {
  return (
    <View style={styles.customInputContainer}>
      <TextInput
        style={[styles.textInput, styles.customInput]}
        placeholder="Add custom allergy"
        value={customAllergy}
        onChangeText={onChangeCustomAllergy}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddCustomAllergy}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  customInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  customInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CustomAllergyInput;
