import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ActionButtonsProps } from './types';

const ActionButtons: React.FC<ActionButtonsProps> = ({ onOpenCamera, onPickImage }) => {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[styles.actionButton, styles.cameraActionButton]}
        onPress={onOpenCamera}
      >
        <Text style={styles.actionButtonText}>📷 Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.galleryActionButton]}
        onPress={onPickImage}
      >
        <Text style={styles.actionButtonText}>🖼️ Choose from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cameraActionButton: {
    backgroundColor: '#4CAF50',
  },
  galleryActionButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActionButtons;
