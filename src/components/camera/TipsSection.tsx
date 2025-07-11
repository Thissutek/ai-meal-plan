import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TipsSectionProps } from './types';

const TipsSection: React.FC<TipsSectionProps> = ({ tips }) => {
  return (
    <View style={styles.tips}>
      <Text style={styles.tipsTitle}>📝 Tips for better results:</Text>
      {tips.map((tip, index) => (
        <Text key={index} style={styles.tipText}>{tip}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tips: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    paddingLeft: 5,
  },
});

export default TipsSection;
