import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface ViewToggleProps {
  showWeeklyView: boolean;
  onToggle: (value: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  showWeeklyView,
  onToggle,
}) => {
  return (
    <View style={styles.viewToggleContainer}>
      <Text style={styles.viewToggleLabel}>Weekly View</Text>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={showWeeklyView ? '#4CAF50' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => onToggle(!showWeeklyView)}
        value={showWeeklyView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  viewToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  viewToggleLabel: {
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default ViewToggle;
