import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SelectedAllergiesProps } from './types';

const SelectedAllergies: React.FC<SelectedAllergiesProps> = ({
  selectedAllergies,
  onRemoveAllergy
}) => {
  if (selectedAllergies.length === 0) {
    return null;
  }

  return (
    <View style={styles.selectedContainer}>
      <Text style={styles.selectedTitle}>Selected Allergies:</Text>
      <View style={styles.selectedTagContainer}>
        {selectedAllergies.map((allergy) => (
          <TouchableOpacity
            key={allergy}
            style={styles.selectedTag}
            onPress={() => onRemoveAllergy(allergy)}
          >
            <Text style={styles.selectedTagText}>{allergy} ×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedContainer: {
    marginTop: 15,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  selectedTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTag: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 3,
  },
  selectedTagText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SelectedAllergies;
