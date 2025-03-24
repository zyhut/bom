// theme.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#0267ab',
  secondary: '#a29161',
  tertiary: '#4d94c4',
  background: '#e5eff6',
  outline: '#0267ab',
  surface: '#f7fafc',
  error: '#ab4602',
  onPrimary: '#bdb290',
  onSurfaceDisabled: '#a29161',
  onSecondaryContainer: '#a29161',
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#0267ab',
  secondary: '#a29161',
  tertiary: '#4d94c4',
  background: '#000a11',
  outline: '#0267ab',
  surface: '#001b2d',
  error: '#ab4602',
  onPrimary: '#a29161',
  onSurfaceDisabled: '#a29161',
  onSecondaryContainer: '#a29161',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: lightColors,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
};