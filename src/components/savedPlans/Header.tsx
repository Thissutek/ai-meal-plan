import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeaderProps } from './types';

const Header: React.FC<HeaderProps> = ({ planCount }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Saved Meal Plans</Text>
      <Text style={styles.subtitle}>
        {planCount} plan{planCount !== 1 ? 's' : ''} saved
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Header;
