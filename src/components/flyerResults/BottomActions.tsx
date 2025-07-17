import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { BottomActionsProps } from './types';

const BottomActions: React.FC<BottomActionsProps> = ({
  totalProducts,
  isGenerating,
  onBack,
  onGenerate,
}) => {
  return (
    <View style={styles.bottomContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <Text style={styles.backButtonText}>📷 Scan Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.generateButton,
          (totalProducts === 0 || isGenerating) && styles.generateButtonDisabled
        ]}
        onPress={onGenerate}
        disabled={totalProducts === 0 || isGenerating}
      >
        {isGenerating ? (
          <View style={styles.generatingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.generateButtonText}>Generating...</Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>
            🍽️ Generate Meal Plan
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generateButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default BottomActions;
