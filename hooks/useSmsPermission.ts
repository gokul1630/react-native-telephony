import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

export function useSmsPermission() {
  const [hasSmsPermission, setHasSmsPermission] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      checkSmsPermission();
    }
  }, []);

  const checkSmsPermission = async () => {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.SEND_SMS
      );
      setHasSmsPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error checking SMS permission:', error);
      return false;
    }
  };

  const requestSmsPermission = async () => {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs permission to send SMS messages.',
          buttonPositive: 'OK',
        }
      );

      const permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      setHasSmsPermission(permissionGranted);
      return permissionGranted;
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
      return false;
    }
  };

  return {
    hasSmsPermission,
    requestSmsPermission,
    checkSmsPermission,
  };
}