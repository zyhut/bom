import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Platform } from 'react-native';

export default function TabLayout() {
    const { colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 0,
                    elevation: 8,
                    height: 60, // slightly smaller height
                    paddingBottom: Platform.OS === 'ios' ? 5 : 0, // minimal padding
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.tertiary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Goal',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="plus-box" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="history" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="dots-horizontal" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}