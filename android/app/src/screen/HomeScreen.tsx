import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';

type RootStackParamList = {
  Home: undefined;
  Notification: undefined;
  Alert: { alertId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [userName, setUserName] = useState('User');
  const [receivers, setReceivers] = useState<any[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isReceiverAccepted, setIsReceiverAccepted] = useState(false);
  const [location, setLocation] = useState({
    latitude: 37.78825, // Default latitude
    longitude: -122.4324, // Default longitude
  });

  // Fetch user data and receivers list
  const fetchUserData = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      setUserName(userDoc.data()?.name || 'User');

      const receiverSnapshot = await firestore().collection('users').get();
      const receiverData = receiverSnapshot.docs
        .filter((doc) => doc.id !== currentUser.uid) // Exclude current user
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setReceivers(receiverData);
    }
  };

  // Fetch request status to check if receiver has accepted
  const fetchRequestStatus = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const requestSnapshot = await firestore()
        .collection('requests')
        .where('senderId', '==', currentUser.uid)
        .get();

      if (!requestSnapshot.empty) {
        const requestData = requestSnapshot.docs[0]?.data();
        if (requestData && requestData.status === 'accepted') {
          setIsReceiverAccepted(true);
          setSelectedReceiver(requestData.receiverId); // Automatically select the accepted receiver
        } else {
          setIsReceiverAccepted(false);
        }
      }
    }
  };

  // Request location permission and fetch current location
  const requestLocationPermission = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        Alert.alert('Error', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Send emergency alert
  const sendEmergencyAlert = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser || !selectedReceiver || !isReceiverAccepted) {
      Alert.alert('Error', 'Please ensure the receiver has accepted the request.');
      return;
    }

    try {
      const senderName = userName;
      const senderLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
      const receiver = receivers.find((r) => r.id === selectedReceiver);

      if (!receiver) {
        Alert.alert('Error', 'Receiver not found.');
        return;
      }

      await firestore().collection('alerts').add({
        senderId: currentUser.uid,
        senderName,
        senderLocation,  // Add sender's location to the alert
        receiverId: receiver.id,
        receiverName: receiver.name,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        message: 'Emergency alert triggered!',
      });

      Alert.alert('Success', `Emergency alert sent to ${receiver.name}!`);
      setIsReceiverAccepted(false);  // Reset receiver acceptance status
    } catch (error) {
      console.error('Error sending alert:', error);
      Alert.alert('Error', 'Failed to send alert.');
    }
  };

  // UseFocusEffect to fetch user data, request status, and subscribe to alerts
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchRequestStatus();  // Check for the accepted receiver request status
      const unsubscribe = firestore()
        .collection('alerts')
        .where('receiverId', '==', auth().currentUser?.uid)
        .onSnapshot((querySnapshot) => {
          const newNotifications = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotifications(newNotifications);
        });

      return () => unsubscribe();
    }, [])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => navigation.navigate('Notification')}
        >
          <Icon name="notifications-outline" size={28} color="#8134AF" />
          {notifications.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifications.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, notifications]);

  useEffect(() => {
    requestLocationPermission();  // Request location on mount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome, {userName}!</Text>

      {/* Automatically show the accepted receiver's info */}
      {isReceiverAccepted ? (
        <Text style={styles.receiverText}>
          Receiver Accepted: {receivers.find(r => r.id === selectedReceiver)?.name}
        </Text>
      ) : (
        <Text style={styles.receiverText}>No accepted receiver yet.</Text>
      )}
      
      {notifications.map((notification) => (
        <TouchableOpacity
          key={notification.id}
          style={styles.notificationContainer}
          onPress={() => navigation.navigate('Alert', { alertId: notification.id })}
        >
          <Text style={styles.notificationText}>
            New Alert!
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.sendButton, !isReceiverAccepted ? styles.disabledButton : null]}
        onPress={sendEmergencyAlert}
        disabled={!isReceiverAccepted}
      >
        <Text style={styles.sendButtonText}>Send Alert</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 30, fontWeight: 'bold', color: '#8134AF', textAlign: 'center', marginBottom: 20 },
  receiverSelection: { marginBottom: 20 },
  receiverButton: { padding: 10, backgroundColor: '#ddd', marginVertical: 5, borderRadius: 5 },
  selectedReceiver: { backgroundColor: '#c482d5' },
  receiverText: { fontSize: 16 },
  sendButton: { padding: 30, backgroundColor: '#8134AF', borderRadius: 100, alignItems: 'center', marginTop: 150 },
  disabledButton: { backgroundColor: '#ccc' },
  sendButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  notificationIcon: { marginRight: 10, position: 'relative' },
  badge: { position: 'absolute', top: -5, right: -10, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  notificationContainer: { marginVertical: 15, padding: 10, backgroundColor: '#fff', borderRadius: 50, borderColor: '#8134AF', borderWidth: 1, marginBottom: 20, marginTop: 20 },
  notificationText: { fontSize: 16, color: '#333', textAlign: 'center', padding: 5 },
});

export default HomeScreen;
