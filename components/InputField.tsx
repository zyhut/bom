// components/InputField.tsx
import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

type InputFieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false 
}) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
});

export default InputField;
