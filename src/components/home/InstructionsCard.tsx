import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Step {
  number: number;
  text: string;
}

interface InstructionsCardProps {
  title: string;
  steps: Step[];
}

const InstructionsCard: React.FC<InstructionsCardProps> = ({ title, steps }) => {
  return (
    <View style={styles.instructions}>
      <Text style={styles.instructionsTitle}>{title}</Text>
      {steps.map((step) => (
        <View key={step.number} style={styles.step}>
          <Text style={styles.stepNumber}>{step.number}</Text>
          <Text style={styles.stepText}>{step.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  instructions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E7D32',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 15,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});

export default InstructionsCard;
