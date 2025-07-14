import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ActionButtonsProps {
  onSave: () => void;
  onShare: () => void;
  onNewPlan: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onShare,
  onNewPlan,
}) => {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.saveActionButton]}
        onPress={onSave}
      >
        <Text style={styles.actionButtonText}>💾 Save Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.shareButton]}
        onPress={onShare}
      >
        <Text style={styles.actionButtonText}>📤 Share</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.newPlanButton]}
        onPress={onNewPlan}
      >
        <Text style={styles.actionButtonText}>🆕 New Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveActionButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  newPlanButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ActionButtons;
