import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AllergyTagsProps } from './types';

const AllergyTags: React.FC<AllergyTagsProps> = ({ 
  commonAllergies, 
  selectedAllergies, 
  onToggleAllergy 
}) => {
  return (
    <View style={styles.tagContainer}>
      {commonAllergies.map((allergy) => (
        <TouchableOpacity
          key={allergy}
          style={[
            styles.tag,
            selectedAllergies.includes(allergy) && styles.tagSelected
          ]}
          onPress={() => onToggleAllergy(allergy)}
        >
          <Text style={[
            styles.tagText,
            selectedAllergies.includes(allergy) && styles.tagTextSelected
          ]}>
            {allergy}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 5,
  },
  tagSelected: {
    backgroundColor: '#4CAF50',
  },
  tagText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagTextSelected: {
    color: '#fff',
  },
});

export default AllergyTags;
