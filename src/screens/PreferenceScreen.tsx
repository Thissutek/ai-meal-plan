import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, UserPreferences } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SectionHeader,
  FamilySizeSelector,
  AllergyTags,
  CustomAllergyInput,
  SelectedAllergies,
  SaveButton
} from '../components/preferences';

type Props = StackScreenProps<RootStackParamList, 'Preferences'>;

const FAMILY_SIZES = [1, 2, 3, 4, 5];
const COMMON_ALLERGIES = [
  'Nuts', 'Dairy', 'Gluten', 'Eggs', 'Seafood', 'Soy', 'Shellfish'
];

const PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const [familySize, setFamilySize] = useState(1);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');

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

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies(prev => [...prev, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };


  const removeAllergy = (allergy: string) => {
    setSelectedAllergies(prev => prev.filter(a => a !== allergy));
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
            onPress: () => navigation.replace('Home')
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
            <SectionHeader 
              title="Family Size" 
              subtitle="How many people will you be cooking for?" 
            />
            <FamilySizeSelector 
              familySize={familySize} 
              familySizes={FAMILY_SIZES} 
              onSelectFamilySize={setFamilySize} 
            />
          </View>

          {/* Allergies */}
          <View style={styles.section}>
            <SectionHeader 
              title="Allergies" 
              subtitle="Select any allergies to avoid" 
            />
            
            <AllergyTags 
              commonAllergies={COMMON_ALLERGIES} 
              selectedAllergies={selectedAllergies} 
              onToggleAllergy={toggleAllergy} 
            />

            <CustomAllergyInput 
              customAllergy={customAllergy} 
              onChangeCustomAllergy={setCustomAllergy} 
              onAddCustomAllergy={addCustomAllergy} 
            />

            <SelectedAllergies 
              selectedAllergies={selectedAllergies} 
              onRemoveAllergy={removeAllergy} 
            />
          </View>
        </View>
      </ScrollView>

      <SaveButton onSave={savePreferences} />
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
});

export default PreferencesScreen;
