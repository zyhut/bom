// theme.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#6172a2',
  secondary: '#a29161',
  background: '#e5e6f2',
  outline: '#6172a2',
  surface: '#f4f5f9',
  error: '#a84000',
  onPrimary: '#a29161',
  onSurfaceDisabled: '#a29161',
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#6172a2',
  secondary: '#a29161',
  background: '#0A192F',
  outline: '#6172a2',
  surface: '#102840',
  error: '#a26172',
  onPrimary: '#a29161',
  onSurfaceDisabled: '#a29161',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: lightColors,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
};