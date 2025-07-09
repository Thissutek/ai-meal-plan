import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, UserPreferences } from '../../App';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { extractFlyerData } from '../services/openaiService';

type Props = StackScreenProps<RootStackParamList, 'Camera'>;

interface CapturedImage {
  uri: string;
  id: string;
}

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        const newImage: CapturedImage = {
          uri: photo.uri,
          id: Date.now().toString(),
        };

        setCapturedImages(prev => [...prev, newImage]);
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage: CapturedImage = {
          uri: result.assets[0].uri,
          id: Date.now().toString(),
        };

        setCapturedImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
  };

  const processImages = async () => {
    if (capturedImages.length === 0) {
      Alert.alert('No Images', 'Please capture at least one flyer image first.');
      return;
    }

    setIsProcessing(true);

    try {
      // Load user preferences
      const storedPreferences = await AsyncStorage.getItem('userPreferences');
      if (!storedPreferences) {
        Alert.alert('Error', 'Please set your preferences first.');
        setIsProcessing(false);
        return;
      }

      const preferences: UserPreferences = JSON.parse(storedPreferences);

      // Extract flyer data from images
      const imageUris = capturedImages.map(img => img.uri);
      console.log('About to extract flyer data from', imageUris.length, 'images');
      const flyerData = await extractFlyerData(imageUris);
      console.log('Extracted flyer data:', flyerData);

      // Navigate to flyer results screen to show parsed data
      console.log('Navigating to FlyerResults screen');
      navigation.navigate('FlyerResults', {
        flyerData,
        imageUris,
        preferences
      });

    } catch (error) {
      console.error('Error processing images:', error);
      Alert.alert(
        'Processing Error',
        'Failed to process the flyer images. Please check your internet connection and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPermissionText}>
          Camera access is required to scan flyer images.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Camera view with no children */}
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={(ref) => setCameraRef(ref)}
        />

        {/* Camera controls positioned absolutely on top */}
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.cameraButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
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
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Scan Grocery Flyers</Text>
            <Text style={styles.subtitle}>
              Take photos of up to 3 grocery flyers to get the best meal plan recommendations
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cameraActionButton]}
              onPress={() => setShowCamera(true)}
            >
              <Text style={styles.actionButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.galleryActionButton]}
              onPress={pickImage}
            >
              <Text style={styles.actionButtonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {capturedImages.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={styles.imagesSectionTitle}>
                Captured Images ({capturedImages.length}/3)
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imagesContainer}>
                  {capturedImages.map((image) => (
                    <View key={image.id} style={styles.imageContainer}>
                      <Image source={{ uri: image.uri }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImage(image.id)}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>📝 Tips for better results:</Text>
            <Text style={styles.tipText}>• Ensure good lighting and clear text</Text>
            <Text style={styles.tipText}>• Capture the entire flyer page</Text>
            <Text style={styles.tipText}>• Avoid shadows and reflections</Text>
            <Text style={styles.tipText}>• Include price information clearly</Text>
          </View>
        </View>
      </ScrollView>

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
          onPress={processImages}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cameraActionButton: {
    backgroundColor: '#4CAF50',
  },
  galleryActionButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagesSection: {
    marginBottom: 20,
  },
  imagesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
  noPermissionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen;
