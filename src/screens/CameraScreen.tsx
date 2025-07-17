import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  BackHandler,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, UserPreferences } from '../../App';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { extractFlyerData } from '../services/openaiService';
import ProcessingModal from '../components/ProcessingModal';
import {
  Header,
  ActionButtons,
  CapturedImagesGallery,
  TipsSection,
  CameraViewComponent,
  PermissionRequest,
  BottomAction,
  CapturedImage
} from '../components/camera';

type Props = StackScreenProps<RootStackParamList, 'Camera'>;

// CapturedImage interface is now imported from '../components/camera'

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const cameraRef = useRef<CameraView | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Processing your flyers...');

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Handle back button press during processing
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isProcessing) {
        // Prevent going back while processing
        Alert.alert(
          'Processing in Progress',
          'Please wait until your flyers are fully processed.'
        );
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior
    });

    return () => backHandler.remove();
  }, [isProcessing]);
  
  // Prevent navigation while processing
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isProcessing) {
        // If not processing, allow navigation
        return;
      }

      // Prevent navigation while processing
      e.preventDefault();
      
      // Alert the user
      Alert.alert(
        'Processing in Progress',
        'Please wait until your flyers are fully processed.',
        [{ text: 'OK' }]
      );
    });

    return unsubscribe;
  }, [navigation, isProcessing]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
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
        mediaTypes: ['images'],
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
    setProcessingMessage('Preparing your flyers for analysis...');

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
      setProcessingMessage(`Analyzing ${imageUris.length} flyer${imageUris.length > 1 ? 's' : ''}...`);
      
      const flyerData = await extractFlyerData(imageUris);
      console.log('Extracted flyer data:', flyerData);
      
      setProcessingMessage('Processing complete! Preparing results...');

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
    return <PermissionRequest onRequestPermission={requestPermission} />;
  }

  if (showCamera) {
    return (
      <CameraViewComponent
        cameraRef={cameraRef}
        facing={facing}
        setFacing={setFacing}
        onCapture={takePicture}
        onCancel={() => setShowCamera(false)}
        isProcessing={isProcessing}
        processingMessage={processingMessage}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Processing Modal */}
      <ProcessingModal visible={isProcessing} message={processingMessage} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Header 
            title="Scan Grocery Flyers" 
            subtitle="Take photos of up to 3 grocery flyers to get the best meal plan recommendations" 
          />

          <ActionButtons 
            onOpenCamera={() => setShowCamera(true)} 
            onPickImage={pickImage} 
          />

          <CapturedImagesGallery 
            capturedImages={capturedImages} 
            onRemoveImage={removeImage} 
          />

          <TipsSection 
            tips={[
              '• Ensure good lighting and clear text',
              '• Capture the entire flyer page',
              '• Avoid shadows and reflections',
              '• Include price information clearly'
            ]} 
          />
        </View>
      </ScrollView>

      <BottomAction 
        capturedImages={capturedImages} 
        isProcessing={isProcessing} 
        onProcess={processImages} 
      />
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
  }
});

export default CameraScreen;
