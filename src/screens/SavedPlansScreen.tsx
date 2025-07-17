import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import {
  getAllMealPlans,
  deleteMealPlan,
  SavedMealPlan
} from '../services/mealPlanStorage';
import { useFocusEffect } from '@react-navigation/native';
import {
  Header,
  EmptyState,
  PlanCard,
  SyncInfo,
  BottomAction,
  LoadingState
} from '../components/savedPlans';

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
    navigation.navigate('MealPlan', { mealPlan: serializedPlan, source: 'saved' });
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
      <PlanCard
        key={plan.id}
        plan={plan}
        onViewPlan={handleViewPlan}
        onDeletePlan={handleDeletePlan}
        formatDate={formatDate}
        formatPrice={formatPrice}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState />
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
          <Header planCount={savedPlans.length} />

          {/* Empty State or Plan List */}
          {savedPlans.length === 0 ? (
            <EmptyState onCreatePlan={() => navigation.navigate('Camera')} />
          ) : (
            /* Saved Plans List */
            <View style={styles.plansList}>
              {savedPlans.map(renderPlanCard)}
            </View>
          )}

          {/* Sync Info */}
          <SyncInfo visible={savedPlans.length > 0} />
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <BottomAction 
        visible={savedPlans.length > 0} 
        onCreatePlan={() => navigation.navigate('Camera')} 
      />
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
  plansList: {
    gap: 15,
  },
});

export default SavedPlansScreen;
