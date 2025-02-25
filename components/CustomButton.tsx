// components/CustomButton.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  color?: string;
};

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress, 
  backgroundColor = '#1E3A8A', 
  color = '#FFFFFF' 
}) => (
  <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
    <Text style={[styles.text, { color }]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;
