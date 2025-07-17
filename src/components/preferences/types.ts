import React from 'react';
import { UserPreferences } from '../../../App';

export interface FamilySizeSelectorProps {
  familySize: number;
  familySizes: number[];
  onSelectFamilySize: (size: number) => void;
}

export interface AllergyTagsProps {
  commonAllergies: string[];
  selectedAllergies: string[];
  onToggleAllergy: (allergy: string) => void;
}

export interface CustomAllergyInputProps {
  customAllergy: string;
  onChangeCustomAllergy: (text: string) => void;
  onAddCustomAllergy: () => void;
}

export interface SelectedAllergiesProps {
  selectedAllergies: string[];
  onRemoveAllergy: (allergy: string) => void;
}

export interface SaveButtonProps {
  onSave: () => void;
  isLoading?: boolean;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}
