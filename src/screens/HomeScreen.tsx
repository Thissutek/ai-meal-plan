import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, UserPreferences } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMealPlanCount } from '../services/mealPlanStorage';

// Import components
import Header from '../components/Header';
import SavedPlansButton from '../components/SavedPlansButton';
import PreferencesCard from '../components/PreferencesCard';
import InstructionsCard from '../components/InstructionsCard';
import ActionButton from '../components/ActionButton';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPreferences, setHasPreferences] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [savedPlansCount, setSavedPlansCount] = useState(0);

  useEffect(() => {
    loadPreferences();
    loadMealPlanCount();
  }, []);

  // Reload meal plan count when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMealPlanCount();
    });
    return unsubscribe;
  }, [navigation]);

  const loadMealPlanCount = async () => {
    try {
      const count = await getMealPlanCount();
      setSavedPlansCount(count);
    } catch (error) {
      console.error('Error loading meal plan count:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem('userPreferences');
      if (storedPreferences) {
        const prefs = JSON.parse(storedPreferences);
        setPreferences(prefs);
        setHasPreferences(true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleStartPlanning = () => {
    if (!hasPreferences) {
      Alert.alert(
        'Setup Required',
        'Please set your preferences first to get personalized meal plans.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set Preferences', onPress: () => navigation.navigate('Preferences') }
        ]
      );
      return;
    }
    navigation.navigate('Camera');
  };

  const handleEditPreferences = () => {
    navigation.navigate('Preferences');
  };

  // Define instruction steps
  const instructionSteps = [
    { number: 1, text: 'Set your dietary preferences and family size' },
    { number: 2, text: 'Take photos of up to 3 grocery flyers' },
    { number: 3, text: 'Get AI-generated meal plans with cost estimates' },
    { number: 4, text: 'Save your favorite meal plans for later' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      <Header 
        title="Home Screen" 
        subtitle="Take photos of grocery flyers and get personalized meal plans with cost estimates"
      >
        <SavedPlansButton 
          count={savedPlansCount} 
          onPress={() => navigation.navigate('SavedPlans')} 
        />
      </Header>

      <View style={styles.content}>
        {hasPreferences && preferences && (
          <PreferencesCard 
            preferences={preferences} 
            onEditPress={handleEditPreferences} 
          />
        )}

        <InstructionsCard 
          title="How It Works:" 
          steps={instructionSteps} 
        />
      </View>

      <View style={styles.buttonContainer}>
        <ActionButton
          title={!hasPreferences ? "Set Preferences First" : "Start Meal Planning"}
          onPress={!hasPreferences ? () => navigation.navigate('Preferences') : handleStartPlanning}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    padding: 20,
  },
});

export default HomeScreen;
