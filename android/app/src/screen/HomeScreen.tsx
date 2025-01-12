import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Notification: undefined;
  Alert: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [userName, setUserName] = useState('User');
  const [emergencyRequests, setEmergencyRequests] = useState<any[]>([]); // Changed from emergencyContacts to emergencyRequests
  const [notifications, setNotifications] = useState<any[]>([]);
  const [alertSent, setAlertSent] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string>(''); // Selecting emergency request instead of contact

  const fetchUserData = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      setUserName(userDoc.data()?.name || 'User');
      
      // Fetch emergency requests instead of contacts
      const requestsSnapshot = await firestore().collection('requests')
        .where('senderId', '==', currentUser.uid)
        .get();
      const requestsData = requestsSnapshot.docs.map(doc => doc.data());
      setEmergencyRequests(requestsData);
    }
  };

  const sendEmergencyAlert = async (requestId: string) => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      alert('User not logged in!');
      return;
    }

    // Get the request data
    const requestDoc = await firestore().collection('requests').doc(requestId).get();
    const requestData = requestDoc.data();
    if (!requestData) {
      alert('Request data not found!');
      return;
    }

    const { senderName, receiverId, receiverName } = requestData;
    if (!receiverId || !receiverName) {
      console.error('Invalid request data:', requestData);
      return;
    }

    try {
      await firestore().collection('alerts').add({
        senderId: currentUser.uid,
        senderName: senderName,
        receiverId: receiverId,
        receiverName: receiverName,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'pending', // Initially set to pending
        message: 'Emergency alert triggered!',
      });

      setAlertSent(true); // Set flag to show the "New Alert" button
      Alert.alert('Success', `Emergency alert sent to ${receiverName}!`);
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert('Failed to send emergency alert.');
    }
  };

  const handleAlertResponse = async (alertId: string, response: string) => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      alert('User not logged in!');
      return;
    }

    try {
      const alertDoc = await firestore().collection('alerts').doc(alertId).get();
      const alertData = alertDoc.data();
      if (alertData) {
        // Update the alert status based on the response
        await firestore().collection('alerts').doc(alertId).update({
          status: response,
        });
        
        // Notify the sender
        await firestore().collection('requests').add({
          senderId: currentUser.uid,
          senderName: alertData.receiverName,
          receiverId: alertData.senderId,
          receiverName: alertData.senderName,
          timestamp: firestore.FieldValue.serverTimestamp(),
          message: response === 'accepted' ? 'Emergency alert accepted!' : 'Emergency alert declined.',
        });

        Alert.alert('Success', `Alert has been ${response} by ${alertData.receiverName}.`);
      } else {
        Alert.alert('Error', 'Alert not found.');
      }
    } catch (error) {
      console.error('Error handling alert response:', error);
      Alert.alert('Failed to update alert response.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      const unsubscribe = firestore()
        .collection('alerts')
        .where('receiverId', '==', auth().currentUser?.uid)
        .onSnapshot((querySnapshot) => {
          const newNotifications = querySnapshot.docs
            .map((doc) => doc.data())
            .filter((notification) => notification.status !== 'declined');
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

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome, {userName}!</Text>

      {/* Dropdown to select emergency request */}
      <View style={styles.requestSelection}>
        <Text>Select an Emergency Request:</Text>
        {emergencyRequests.map((request: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.requestButton}
            onPress={() => setSelectedRequest(request.id)} // Select the request by ID
          >
            <Text style={styles.requestText}>{request.receiverName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conditionally render the "New Alert" button after sending the alert */}
      {alertSent && (
        <View style={styles.alert}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Alert')}
          >
            <Text style={styles.notificationText}>New Alert</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Push Button to send alert */}
      <View style={styles.pushButtonContainer}>
        <TouchableOpacity
          style={styles.pushButton}
          onPress={() => sendEmergencyAlert(selectedRequest)}
          disabled={!selectedRequest} // Button disabled until a request is selected
        >
          <Text style={styles.pushButtonText}>Send Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications to accept/decline */}
      {notifications.map((notification: any, index: number) => (
        <View key={index} style={styles.notificationContainer}>
          <Text>{notification.senderName} has sent you an alert!</Text>
          <View style={styles.notificationButtons}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => handleAlertResponse(notification.id, 'accepted')}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={() => handleAlertResponse(notification.id, 'declined')}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 30, fontWeight: 'bold', color: '#8134AF', textAlign: 'center', marginBottom: 20 },
  requestSelection: { marginBottom: 20 },
  requestButton: { padding: 10, backgroundColor: '#ddd', marginVertical: 5, borderRadius: 5 },
  requestText: { fontSize: 16 },
  alert: { paddingVertical: 20 },
  notificationButton: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10, borderWidth: 1, borderColor: '#c482d5' },
  notificationText: { fontSize: 16, color: 'indigo' },
  pushButtonContainer: { paddingVertical: 20, alignItems: 'center' },
  pushButton: { padding: 15, backgroundColor: '#8134AF', borderRadius: 10 },
  pushButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  notificationIcon: { marginRight: 10, position: 'relative' },
  badge: { position: 'absolute', top: -5, right: -10, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  notificationContainer: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  notificationButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { padding: 10, borderRadius: 5, width: 80 },
  acceptButton: { backgroundColor: '#4CAF50' },
  declineButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#fff', textAlign: 'center' },
});

export default HomeScreen;
