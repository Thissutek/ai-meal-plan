import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserPreferences } from '../../App';

interface PreferencesCardProps {
  preferences: UserPreferences;
  onEditPress: () => void;
}

const PreferencesCard: React.FC<PreferencesCardProps> = ({ preferences, onEditPress }) => {
  return (
    <View style={styles.preferencesCard}>
      <Text style={styles.preferencesTitle}>Your Current Settings:</Text>
      <Text style={styles.preferencesText}>
        Family Size: {preferences.familySize} {preferences.familySize === 1 ? 'person' : 'people'}
      </Text>
      {preferences.allergies.length > 0 && (
        <Text style={styles.preferencesText}>
          Allergies: {preferences.allergies.join(', ')}
        </Text>
      )}
      {preferences.dietaryRestrictions.length > 0 && (
        <Text style={styles.preferencesText}>
          Dietary Restrictions: {preferences.dietaryRestrictions.join(', ')}
        </Text>
      )}
      <TouchableOpacity
        style={styles.editButton}
        onPress={onEditPress}
      >
        <Text style={styles.editButtonText}>Edit Preferences</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  preferencesCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  preferencesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
  },
  preferencesText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PreferencesCard;
