import ExpoTelephony from 'expo-telephony';
import { isServiceRunning, startService } from '@/services/NotificationService';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';

const checkPermissions = async () => {
    const status = await PermissionsAndroid.requestMultiple([
        'android.permission.READ_SMS',
        'android.permission.RECEIVE_SMS',
        'android.permission.READ_CALL_LOG',
        'android.permission.READ_PHONE_STATE',
        'android.permission.POST_NOTIFICATIONS'
    ]);
};

export default function Home() {
    useEffect(() => {
        checkPermissions();
        if (!isServiceRunning) {
            startService();
        }

        return () => {
            ExpoTelephony.stopListening();
            ExpoTelephony.removeAllListeners('onReceiveSMS');
            ExpoTelephony.removeAllListeners('onMissedCall');
        };
    }, []);

    return <Redirect href='/(tabs)' />;
}
