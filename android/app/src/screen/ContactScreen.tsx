import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const EmergencyContactsScreen = () => {
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUser = auth().currentUser;

  const fetchRequests = async () => {
    const snapshot = await firestore()
      .collection('requests')
      .where('senderId', '==', currentUser?.uid)
      .get();

    const requests = await Promise.all(
      snapshot.docs.map(async doc => {
        const request = doc.data();
        const userDoc = await firestore().collection('users').doc(request.receiverId).get();
        const recipientName = userDoc.exists ? userDoc.data().name : 'Unknown User';
        const timestamp = request.timestamp?.toDate()?.toLocaleString(); // Convert timestamp to readable format

        return {
          id: doc.id,
          recipientName,
          status: request.status,
          timestamp,
        };
      })
    );

    setSentRequests(requests);
  };

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests();  // Refresh the data
    setIsRefreshing(false);  // Stop refreshing
  };

  const handleSendRequest = async () => {
    if (!name) {
      alert('Please enter a name to send the request');
      return;
    }

    const senderId = currentUser.uid;
    const recipientDoc = await firestore().collection('users').where('name', '==', name).get();

    if (recipientDoc.empty) {
      alert('Recipient not found!');
      return;
    }

    const receiverId = recipientDoc.docs[0].id;
    const recipientData = recipientDoc.docs[0].data();
    const deviceToken = recipientData.deviceToken;

    // Add request data to Firestore
    const requestRef = await firestore().collection('requests').add({
      senderId,
      receiverId,
      status: 'pending',
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    // Fetch the new request to update the state
    const newRequest = {
      id: requestRef.id,
      recipientName: name,
      status: 'pending',
      timestamp: new Date().toLocaleString(), // or use the server timestamp
    };

    setSentRequests(prevRequests => [...prevRequests, newRequest]);

    // Send push notification if deviceToken exists
    if (deviceToken) {
      sendNotification(deviceToken, name);
    }

    Alert.alert('Request Sent', `A request has been sent to ${name}.`);
    setName('');
  };

  const sendNotification = async (token, name) => {
    try {
      await messaging().sendMessage({
        token: token,
        notification: {
          title: 'Emergency Request',
          body: `${name} has sent you an emergency request.`,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          screen: 'NotificationScreen',
        },
      });
      console.log('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleAddContact = async () => {
    if (!contactName || !contactPhone) {
      alert('Please fill in both the name and phone number fields');
      return;
    }

    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          emergencyContacts: firestore.FieldValue.arrayUnion({
            name: contactName,
            phone: contactPhone,
          }),
        });

      Alert.alert(
        'Contact Added',
        `${contactName} has been added to your emergency contacts.`,
        [{ text: 'OK' }]
      );

      setContactName('');
      setContactPhone('');
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('An error occurred while adding the contact. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.title}>Send Emergency Request</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Name of the person to request"
          placeholderTextColor="indigo"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity
          style={[styles.button, !name ? styles.buttonDisabled : null]}
          onPress={handleSendRequest}
          disabled={!name}
        >
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Your Sent Requests</Text>
        {sentRequests.length > 0 ? (
          sentRequests.map(request => (
            <View key={request.id} style={styles.requestItem}>
              <Text style={styles.requestText}>
                <Text style={styles.boldText}>Sent to:</Text> {request.recipientName}
              </Text>
              <Text style={styles.requestText}>
                <Text style={styles.boldText}>Status:</Text> {request.status}
              </Text>
              <Text style={styles.requestText}>
                <Text style={styles.boldText}>Timestamp:</Text> {request.timestamp}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noRequestsText}>No requests sent yet.</Text>
        )}

        <Text style={styles.title}>Add Emergency Contact</Text>

        <TextInput
          style={styles.input}
          placeholder="Contact Name"
          placeholderTextColor="indigo"
          value={contactName}
          onChangeText={setContactName}
        />

        <TextInput
          style={styles.input}
          placeholder="Contact Phone Number"
          placeholderTextColor="indigo"
          keyboardType="phone-pad"
          value={contactPhone}
          onChangeText={setContactPhone}
        />

        <TouchableOpacity
          style={[styles.button, (!contactName || !contactPhone) ? styles.buttonDisabled : null]}
          onPress={handleAddContact}
          disabled={!contactName || !contactPhone}
        >
          <Text style={styles.buttonText}>Add Contact</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#8134AF',
    padding: 30,
    marginTop: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#c482d5',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#8134AF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: { backgroundColor: '#c482d5' },
  requestItem: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#c482d5',
    borderRadius: 10,
    backgroundColor: '#f3e5f5',
    alignItems: 'flex-start',
  },
  requestText: { fontSize: 16, marginBottom: 5 },
  boldText: { fontWeight: 'bold' },
  noRequestsText: { textAlign: 'center', color: 'gray' },
});

export default EmergencyContactsScreen;



