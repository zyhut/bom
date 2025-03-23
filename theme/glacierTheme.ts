import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const glacierPrimary = '#4e8df1'; // Deep glacier blue
const glacierSecondary = '#4e8df1'; // Lighter blue like sky reflection
const glacierBackground = '#E3F2FD'; // Soft ice blue
const glacierSurface = '#FFFFFF'; // Clean glacier white
const glacierError = '#D32F2F'; // Keep strong red for alerts

const lightColors = {
  ...MD3LightTheme.colors,
  primary: glacierPrimary,
  secondary: glacierSecondary,
  background: glacierBackground,
  surface: glacierSurface,
  error: glacierError,
  onPrimary: '#FFFFFF',
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: glacierSecondary,
  secondary: '#81D4FA', // Icy highlight
  background: '#0A192F', // Deep navy glacier night
  surface: '#102840', // Surface glacier shade
  error: glacierError,
  onPrimary: '#000000',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: lightColors,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
};