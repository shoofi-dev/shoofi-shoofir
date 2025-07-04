import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      vibrate:true
    }),
  });
export async function schedulePushNotification(data: any) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "אטליז עבד אלחי",
            body: 'طلبية جديدة',
            data: data,
            sound: 'buffalosound.wav',
            vibrate: [10]
        },
        trigger: { seconds: 2 },
    });
}

export async function schedulePushNotificationDeliveryDelay(data: any) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "אטליז עבד אלחי",
            body: 'تاخير بالارسالية',
            data: data,
            sound: 'deliverysound.wav',
            vibrate: [10]
        },
        trigger: { seconds: 2 },
    });
}

export async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        // if (finalStatus !== 'granted') {
        //     // alert('Failed to get push token for push notification!');
        //     return;
        // }
        token = (await Notifications.getExpoPushTokenAsync({projectId:'1d86c36c-c036-4d93-8e4f-8d8a47fe4f3f'})).data;
    } else {
       // alert('Must use physical device for Push Notifications');
    }
    return token;
}