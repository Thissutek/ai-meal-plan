import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SyncInfoProps } from './types';

const SyncInfo: React.FC<SyncInfoProps> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.syncInfo}>
      <Text style={styles.syncInfoText}>
        All plans are stored in the cloud database
      </Text>
      <Text style={styles.syncInfoSubtext}>
        Pull down to refresh and get latest data
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  syncInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    alignItems: 'center',
  },
  syncInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  syncInfoSubtext: {
    fontSize: 12,
    color: '#4CAF50',
  },
});

export default SyncInfo;
