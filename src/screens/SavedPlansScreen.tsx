import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import {
  getAllMealPlans,
  deleteMealPlan,
  syncLocalPlansToCloud,
  SavedMealPlan
} from '../services/mealPlanStorage';
import { useFocusEffect } from '@react-navigation/native';

type Props = StackScreenProps<RootStackParamList, 'SavedPlans'>;

const SavedPlansScreen: React.FC<Props> = ({ navigation }) => {
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedPlans = async () => {
    try {
      const plans = await getAllMealPlans();
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
      Alert.alert('Error', 'Failed to load saved meal plans.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await syncLocalPlansToCloud();
    await loadSavedPlans();
    setRefreshing(false);
  };

  const handleDeletePlan = (plan: SavedMealPlan) => {
    Alert.alert(
      'Delete Meal Plan',
      `Are you sure you want to delete "${plan.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMealPlan(plan.id);
              await loadSavedPlans();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meal plan.');
            }
          }
        }
      ]
    );
  };

  const handleViewPlan = (plan: SavedMealPlan) => {
    // Serialize the meal plan for navigation to avoid Date object issues
    const serializedPlan = {
      ...plan,
      savedAt: plan.savedAt.toISOString()
    };
    navigation.navigate('MealPlan', { mealPlan: serializedPlan });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedPlans();
    }, [])
  );

  const renderPlanCard = (plan: SavedMealPlan) => {
    return (
      <View key={plan.id} style={styles.planCard}>
        <TouchableOpacity
          style={styles.planContent}
          onPress={() => handleViewPlan(plan)}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={styles.syncStatus}>
              {plan.isSyncedToCloud ? (
                <Text style={styles.cloudIcon}>☁️</Text>
              ) : (
                <Text style={styles.localIcon}>📱</Text>
              )}
            </View>
          </View>

          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Cost</Text>
              <Text style={styles.statValue}>{formatPrice(plan.totalCost)}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Family Size</Text>
              <Text style={styles.statValue}>
                {plan.familySize} {plan.familySize === 1 ? 'person' : 'people'}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Meals</Text>
              <Text style={styles.statValue}>{plan.meals.length} meals</Text>
            </View>
          </View>

          <View style={styles.planFooter}>
            <Text style={styles.planDate}>
              Saved {formatDate(plan.savedAt)}
            </Text>

            {plan.preferences.allergies.length > 0 && (
              <Text style={styles.allergiesText}>
                🚫 {plan.preferences.allergies.join(', ')}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePlan(plan)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading saved meal plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Saved Meal Plans</Text>
            <Text style={styles.subtitle}>
              {savedPlans.length} plan{savedPlans.length !== 1 ? 's' : ''} saved
            </Text>
          </View>

          {/* Empty State */}
          {savedPlans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>No Saved Meal Plans</Text>
              <Text style={styles.emptyText}>
                Create your first meal plan by scanning grocery flyers
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('Camera')}
              >
                <Text style={styles.createButtonText}>📷 Scan Flyers</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Saved Plans List */
            <View style={styles.plansList}>
              {savedPlans.map(renderPlanCard)}
            </View>
          )}

          {/* Sync Info */}
          {savedPlans.length > 0 && (
            <View style={styles.syncInfo}>
              <Text style={styles.syncInfoText}>
                ☁️ = Synced to cloud  📱 = Local only
              </Text>
              <Text style={styles.syncInfoSubtext}>
                Pull down to refresh and sync with cloud
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {savedPlans.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.newPlanButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.newPlanButtonText}>📷 Create New Meal Plan</Text>
          </TouchableOpacity>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  plansList: {
    gap: 15,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  planContent: {
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
  },
  syncStatus: {
    marginLeft: 10,
  },
  cloudIcon: {
    fontSize: 20,
  },
  localIcon: {
    fontSize: 20,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  planFooter: {
    gap: 5,
  },
  planDate: {
    fontSize: 14,
    color: '#666',
  },
  allergiesText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#F44336',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  syncInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    alignItems: 'center',
  },
  syncInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  syncInfoSubtext: {
    fontSize: 12,
    color: '#4CAF50',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  newPlanButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  newPlanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SavedPlansScreen;
