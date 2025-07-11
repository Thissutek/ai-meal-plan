import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PermissionRequestProps } from './types';

const PermissionRequest: React.FC<PermissionRequestProps> = ({ onRequestPermission }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.noPermissionText}>
        Camera access is required to scan flyer images.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onRequestPermission}
      >
        <Text style={styles.buttonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPermissionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PermissionRequest;
