import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from 'react-native';

interface ProcessingModalProps {
  visible: boolean;
  message?: string;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ 
  visible, 
  message = 'Processing your flyers...' 
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        // This is intentionally empty - we don't want users to close this modal
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.modalText}>{message}</Text>
          <Text style={styles.subText}>Please wait while we analyze your flyers.</Text>
          <Text style={styles.subText}>This may take up to 10 seconds.</Text>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
  }
});

export default ProcessingModal;
