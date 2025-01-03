import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const EmergencyContactsScreen = () => {
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Function to handle sending the request
  const handleSendRequest = async () => {
    if (!name) {
      alert('Please enter a name to send the request');
      return;
    }

    const currentUser = auth().currentUser;
    const senderId = currentUser.uid;

    // Check if the recipient exists by name
    const recipientDoc = await firestore().collection('users').where('name', '==', name).get();
    if (recipientDoc.empty) {
      alert('Recipient not found!');
      return;
    }

    const receiverId = recipientDoc.docs[0].id; // Get the receiver's ID

    // Retrieve the recipient's device token (for sending notifications)
    const recipientData = recipientDoc.docs[0].data();
    const deviceToken = recipientData.deviceToken; // Assuming the device token is saved in the user data

    // Add a request document in Firestore
    const requestRef = await firestore().collection('requests').add({
      senderId,
      receiverId,
      status: 'pending', // You can change this later
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    // Trigger Firebase Cloud Function to send the notification
    if (deviceToken) {
      sendNotification(deviceToken, name);
    }

    // Alert user that the request has been sent
    Alert.alert(
      'Request Sent',
      `A request has been sent to ${name}. They will receive a notification to accept the request.`,
      [{ text: 'OK' }]
    );

    // Clear the name input after sending the request
    setName('');
  };

  // Function to send push notification
  const sendNotification = async (token, name) => {
    try {
      // Send notification to the recipient using their device token
      await messaging().sendToDevice(token, {
        notification: {
          title: 'Emergency Request',
          body: `${name} has sent you an emergency request.`,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          screen: 'NotificationScreen', // Use the screen name to navigate after click
        },
      });
      console.log('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Function to add an emergency contact
  const handleAddContact = async () => {
    if (!contactName || !contactPhone) {
      alert('Please fill in both the name and phone number fields');
      return;
    }

    const currentUser = auth().currentUser;

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

      // Clear the input fields
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
    paddingBottom: 20, // To avoid content being hidden by the keyboard
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#8134AF', padding: 30, marginTop: 50 },
  input: { borderWidth: 1, borderColor: '#c482d5', borderRadius: 10, marginBottom: 15, padding: 10, fontSize: 16 },
  button: { backgroundColor: '#8134AF', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  buttonDisabled: { backgroundColor: '#c482d5' },
});

export default EmergencyContactsScreen;

