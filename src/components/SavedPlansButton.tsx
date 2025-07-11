import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface SavedPlansButtonProps {
  count: number;
  onPress: () => void;
}

const SavedPlansButton: React.FC<SavedPlansButtonProps> = ({ count, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.savedPlansIconButton}
      onPress={onPress}
    >
      <Text style={styles.savedPlansIcon}>📋</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  savedPlansIconButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedPlansIcon: {
    fontSize: 24,
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SavedPlansButton;
