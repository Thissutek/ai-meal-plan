import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { CameraView } from 'expo-camera';
import ProcessingModal from '../ProcessingModal';
import { CameraViewComponentProps } from './types';

const CameraViewComponent: React.FC<CameraViewComponentProps> = ({
  cameraRef,
  facing,
  setFacing,
  onCapture,
  onCancel,
  isProcessing,
  processingMessage
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Processing Modal */}
      <ProcessingModal visible={isProcessing} message={processingMessage} />
      
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={(ref) => {
          if (cameraRef && 'current' in cameraRef) {
            cameraRef.current = ref;
          }
        }}
      />

      {/* Camera controls positioned absolutely on top */}
      <View style={styles.cameraButtonContainer}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={onCancel}
        >
          <Text style={styles.cameraButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={onCapture}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => {
            setFacing(current => (current === 'back' ? 'front' : 'back'));
          }}
        >
          <Text style={styles.cameraButtonText}>Flip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 10,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});

export default CameraViewComponent;
