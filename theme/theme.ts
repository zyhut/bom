// theme.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#0267ab',
  secondary: '#b9904a',
  tertiary: '#67a3cc',
  background: '#ffffff',
  outline: '#0267ab',
  surface: '#f7fafc',
  error: '#b3552a',
  onPrimary: '#ffffff',
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#5a9ae3',
  secondary: '#b9904a',
  tertiary: '#1d5faa',
  background: '#000a11',
  outline: '#0267ab',
  surface: '#001422',
  error: '#883936',
  onPrimary: '#000a11',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: lightColors,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
};