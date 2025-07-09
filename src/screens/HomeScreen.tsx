import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, UserPreferences } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMealPlanCount } from '../services/mealPlanStorage';

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      <View style={styles.header}>
        <Text style={styles.title}>Home Screen</Text>
        <Text style={styles.subtitle}>
          Take photos of grocery flyers and get personalized meal plans with cost estimates
        </Text>
      </View>

      <View style={styles.content}>
        {hasPreferences && preferences && (
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
              onPress={handleEditPreferences}
            >
              <Text style={styles.editButtonText}>Edit Preferences</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Set your preferences (family size, allergies, etc.)</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Take photos of up to 3 grocery flyers</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Get AI-generated meal plans with cost estimates</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Save your favorite meal plans for later</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!hasPreferences ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Preferences')}
          >
            <Text style={styles.primaryButtonText}>Set Preferences First</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartPlanning}
          >
            <Text style={styles.primaryButtonText}>Start Meal Planning</Text>
          </TouchableOpacity>
        )}

        {/* Smaller saved plans button */}
        <TouchableOpacity
          style={styles.savedPlansButton}
          onPress={() => navigation.navigate('SavedPlans')}
        >
          <Text style={styles.savedPlansButtonText}>
            📋 Saved Plans {savedPlansCount > 0 ? `(${savedPlansCount})` : ''}
          </Text>
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
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
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
  instructions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E7D32',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 15,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  savedPlansButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
    marginTop: 5,
  },
  savedPlansButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
