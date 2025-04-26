import Colors from '@/constants/Colors';
import { useSettings } from '@/hooks/useSettings';
import { Tabs } from 'expo-router';
import { History, Chrome as Home, Settings } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    const updateSettings = () => {
        if (!settings.telegramBotToken || !settings.telegramChatId) {
            loadSettings();
        }
    };

    const { settings, loadSettings } = useSettings();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height:
                            60 + (Platform.OS === 'ios' ? insets.bottom : 0),
                        paddingBottom:
                            Platform.OS === 'ios' ? insets.bottom : 8,
                    },
                ],
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.gray[500],
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
            }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Send',
                    tabBarIcon: ({ color, size }) => (
                        <Home size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='history'
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <History size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='settings'
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Settings size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
        paddingTop: 8,
    },
    tabBarLabel: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
    },
});
