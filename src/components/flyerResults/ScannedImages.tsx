import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { ScannedImagesProps } from './types';

const ScannedImages: React.FC<ScannedImagesProps> = ({ imageUris }) => {
  return (
    <View style={styles.imagesSection}>
      <Text style={styles.imagesSectionTitle}>Scanned Images</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.imagesContainer}>
          {imageUris.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.previewImage} />
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
  previewImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default ScannedImages;
