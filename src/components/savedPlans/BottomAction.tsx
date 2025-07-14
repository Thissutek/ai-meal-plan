import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomActionProps } from './types';

const BottomAction: React.FC<BottomActionProps> = ({ visible, onCreatePlan }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.bottomContainer}>
      <TouchableOpacity
        style={styles.newPlanButton}
        onPress={onCreatePlan}
      >
        <Text style={styles.newPlanButtonText}>📷 Create New Meal Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default BottomAction;
