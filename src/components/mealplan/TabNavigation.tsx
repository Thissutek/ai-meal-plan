import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TabNavigationProps {
  activeTab: 'meals' | 'grocery';
  onTabChange: (tab: 'meals' | 'grocery') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'meals' && styles.tabActive]}
        onPress={() => onTabChange('meals')}
      >
        <Text style={[styles.tabText, activeTab === 'meals' && styles.tabTextActive]}>
          🍽️ Meal Plan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'grocery' && styles.tabActive]}
        onPress={() => onTabChange('grocery')}
      >
        <Text style={[styles.tabText, activeTab === 'grocery' && styles.tabTextActive]}>
          🛒 Grocery List
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  tabTextActive: {
    color: '#4CAF50',
  },
});

export default TabNavigation;
