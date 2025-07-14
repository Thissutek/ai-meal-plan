import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SummaryCardProps } from './types';

const SummaryCard: React.FC<SummaryCardProps> = ({ totalProducts, totalStores }) => {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Flyer Parsing Results</Text>
      <View style={styles.summaryStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalProducts}</Text>
          <Text style={styles.statLabel}>Products Found</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalStores}</Text>
          <Text style={styles.statLabel}>Store{totalStores !== 1 ? 's' : ''} Scanned</Text>
        </View>
      </View>

      {totalProducts === 0 && (
        <View style={styles.noDataWarning}>
          <Text style={styles.noDataText}>
            ⚠️ No products were detected in your flyer images. This could be due to:
          </Text>
          <Text style={styles.noDataTip}>• Poor image quality or lighting</Text>
          <Text style={styles.noDataTip}>• Text that's too small to read</Text>
          <Text style={styles.noDataTip}>• Flyers without clear price information</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  noDataWarning: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noDataText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  noDataTip: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 2,
    paddingLeft: 10,
  },
});

export default SummaryCard;
