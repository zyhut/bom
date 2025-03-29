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
                    backgroundColor: colors.surfaceContainer,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    borderTopWidth: 0,
                    elevation: 9,
                    height: 60, // slightly smaller height
                    paddingBottom: Platform.OS === 'ios' ? 5 : 0, // minimal padding
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarIconStyle: {
                },
                tabBarItemStyle: {
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.outline,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons name={focused ? "home" : "home-outline"} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Goal',
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons name={focused ? "plus-box" : "plus"} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons name={focused ? "clock-time-four" : "history"} color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons name={focused ? "dots-horizontal-circle" : "dots-horizontal"} color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}