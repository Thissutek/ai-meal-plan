import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LoadingStateProps } from './types';

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading saved meal plans...' }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default LoadingState;
