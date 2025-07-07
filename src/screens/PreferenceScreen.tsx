import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, UserPreferences } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = StackScreenProps<RootStackParamList, 'Preferences'>;

const FAMILY_SIZES = [1, 2, 3, 4, 5];
const COMMON_ALLERGIES = [
  'Nuts', 'Dairy', 'Gluten', 'Eggs', 'Seafood', 'Soy', 'Shellfish'
];
const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Low Carb', 'Halal', 'Kosher'
];

const PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const [familySize, setFamilySize] = useState(1);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDietary, setCustomDietary] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem('userPreferences');
      if (storedPreferences) {
        const prefs: UserPreferences = JSON.parse(storedPreferences);
        setFamilySize(prefs.familySize);
        setSelectedAllergies(prefs.allergies);
        setSelectedDietary(prefs.dietaryRestrictions);
        setBudget(prefs.budget?.toString() || '');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleDietary = (dietary: string) => {
    setSelectedDietary(prev =>
      prev.includes(dietary)
        ? prev.filter(d => d !== dietary)
        : [...prev, dietary]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies(prev => [...prev, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const addCustomDietary = () => {
    if (customDietary.trim() && !selectedDietary.includes(customDietary.trim())) {
      setSelectedDietary(prev => [...prev, customDietary.trim()]);
      setCustomDietary('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setSelectedAllergies(prev => prev.filter(a => a !== allergy));
  };

  const removeDietary = (dietary: string) => {
    setSelectedDietary(prev => prev.filter(d => d !== dietary));
  };

  const savePreferences = async () => {
    try {
      const preferences: UserPreferences = {
        familySize,
        allergies: selectedAllergies,
        dietaryRestrictions: selectedDietary,
        budget: budget ? parseFloat(budget) : undefined,
      };

      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));

      Alert.alert(
        'Preferences Saved',
        'Your preferences have been saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>

          {/* Family Size */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Family Size</Text>
            <Text style={styles.sectionSubtitle}>How many people will you be cooking for?</Text>
            <View style={styles.familySizeContainer}>
              {FAMILY_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.familySizeButton,
                    familySize === size && styles.familySizeButtonSelected
                  ]}
                  onPress={() => setFamilySize(size)}
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
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Budget (Optional)</Text>
            <Text style={styles.sectionSubtitle}>What's your approximate weekly grocery budget?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 150"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
          </View>

          {/* Allergies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <Text style={styles.sectionSubtitle}>Select any allergies to avoid</Text>

            <View style={styles.tagContainer}>
              {COMMON_ALLERGIES.map((allergy) => (
                <TouchableOpacity
                  key={allergy}
                  style={[
                    styles.tag,
                    selectedAllergies.includes(allergy) && styles.tagSelected
                  ]}
                  onPress={() => toggleAllergy(allergy)}
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

            <View style={styles.customInputContainer}>
              <TextInput
                style={[styles.textInput, styles.customInput]}
                placeholder="Add custom allergy"
                value={customAllergy}
                onChangeText={setCustomAllergy}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addCustomAllergy}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {selectedAllergies.length > 0 && (
              <View style={styles.selectedContainer}>
                <Text style={styles.selectedTitle}>Selected Allergies:</Text>
                <View style={styles.selectedTagContainer}>
                  {selectedAllergies.map((allergy) => (
                    <TouchableOpacity
                      key={allergy}
                      style={styles.selectedTag}
                      onPress={() => removeAllergy(allergy)}
                    >
                      <Text style={styles.selectedTagText}>{allergy} ×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
          {/* Dietary Restrictions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
            <Text style={styles.sectionSubtitle}>Select any dietary preferences</Text>

            <View style={styles.tagContainer}>
              {DIETARY_RESTRICTIONS.map((dietary) => (
                <TouchableOpacity
                  key={dietary}
                  style={[
                    styles.tag,
                    selectedDietary.includes(dietary) && styles.tagSelected
                  ]}
                  onPress={() => toggleDietary(dietary)}
                >
                  <Text style={[
                    styles.tagText,
                    selectedDietary.includes(dietary) && styles.tagTextSelected
                  ]}>
                    {dietary}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customInputContainer}>
              <TextInput
                style={[styles.textInput, styles.customInput]}
                placeholder="Add custom dietary restriction"
                value={customDietary}
                onChangeText={setCustomDietary}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addCustomDietary}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {selectedDietary.length > 0 && (
              <View style={styles.selectedContainer}>
                <Text style={styles.selectedTitle}>Selected Dietary Restrictions:</Text>
                <View style={styles.selectedTagContainer}>
                  {selectedDietary.map((dietary) => (
                    <TouchableOpacity
                      key={dietary}
                      style={styles.selectedTag}
                      onPress={() => removeDietary(dietary)}
                    >
                      <Text style={styles.selectedTagText}>{dietary} ×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePreferences}
        >
          <Text style={styles.saveButtonText}>Save Preferences</Text>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
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
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
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
  customInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
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
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PreferencesScreen;
