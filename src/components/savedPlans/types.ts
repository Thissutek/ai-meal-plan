import React from 'react';
import { SavedMealPlan } from '../../services/mealPlanStorage';

export interface HeaderProps {
  planCount: number;
}

export interface EmptyStateProps {
  onCreatePlan: () => void;
}

export interface PlanCardProps {
  plan: SavedMealPlan;
  onViewPlan: (plan: SavedMealPlan) => void;
  onDeletePlan: (plan: SavedMealPlan) => void;
  formatDate: (date: Date) => string;
  formatPrice: (price: number) => string;
}

export interface SyncInfoProps {
  visible: boolean;
}

export interface BottomActionProps {
  visible: boolean;
  onCreatePlan: () => void;
}

export interface LoadingStateProps {
  message?: string;
}
