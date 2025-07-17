import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { CapturedImagesGalleryProps } from './types';

const CapturedImagesGallery: React.FC<CapturedImagesGalleryProps> = ({ 
  capturedImages, 
  onRemoveImage 
}) => {
  if (capturedImages.length === 0) {
    return null;
  }

  return (
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
                onPress={() => onRemoveImage(image.id)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default CapturedImagesGallery;
