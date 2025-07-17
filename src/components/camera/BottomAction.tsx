import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { BottomActionProps } from './types';

const BottomAction: React.FC<BottomActionProps> = ({ 
  capturedImages, 
  isProcessing, 
  onProcess 
}) => {
  return (
    <View style={styles.bottomContainer}>
      {capturedImages.length >= 3 && (
        <Text style={styles.limitText}>
          Maximum of 3 images reached
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.processButton,
          (capturedImages.length === 0 || isProcessing) && styles.processButtonDisabled
        ]}
        onPress={onProcess}
        disabled={capturedImages.length === 0 || isProcessing}
      >
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.processButtonText}>Processing...</Text>
          </View>
        ) : (
          <Text style={styles.processButtonText}>
            Analyze Flyers ({capturedImages.length} image{capturedImages.length !== 1 ? 's' : ''})
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  limitText: {
    textAlign: 'center',
    color: '#ff9800',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  processButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  processButtonDisabled: {
    backgroundColor: '#ccc',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default BottomAction;
