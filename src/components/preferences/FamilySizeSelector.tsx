import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FamilySizeSelectorProps } from './types';

const FamilySizeSelector: React.FC<FamilySizeSelectorProps> = ({ 
  familySize, 
  familySizes, 
  onSelectFamilySize 
}) => {
  return (
    <View style={styles.familySizeContainer}>
      {familySizes.map((size) => (
        <TouchableOpacity
          key={size}
          style={[
            styles.familySizeButton,
            familySize === size && styles.familySizeButtonSelected
          ]}
          onPress={() => onSelectFamilySize(size)}
        >
          <Text style={[
            styles.familySizeButtonText,
            familySize === size && styles.familySizeButtonTextSelected
          ]}>
            {size}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  familySizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  familySizeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  familySizeButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  familySizeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  familySizeButtonTextSelected: {
    color: '#fff',
  },
});

export default FamilySizeSelector;
