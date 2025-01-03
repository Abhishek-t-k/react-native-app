import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const NotificationsScreen = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const currentUser = auth().currentUser;
      const querySnapshot = await firestore()
        .collection('requests')
        .where('receiverId', '==', currentUser.uid)
        .get();

      const data = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const requestData = doc.data();
          const senderDoc = await firestore().collection('users').doc(requestData.senderId).get();
          const senderName = senderDoc.data()?.name || 'Unknown';
          const timestamp = requestData.timestamp?.toDate().toLocaleString() || 'Unknown time';
          return { id: doc.id, ...requestData, senderName, timestamp };
        })
      );
      setRequests(data);
    };

    fetchRequests();
  }, []);

  const handleAcceptRequest = async (id, senderId, senderName) => {
    await firestore().collection('requests').doc(id).update({ status: 'accepted' });
    sendNotification(senderId, senderName);
    Alert.alert('Success', 'Request accepted!');
  };

  const sendNotification = async (senderId, senderName) => {
    const senderDoc = await firestore().collection('users').doc(senderId).get();
    const deviceToken = senderDoc.data()?.deviceToken;

    if (deviceToken) {
      try {
        await messaging().sendToDevice(deviceToken, {
          notification: {
            title: 'Request Accepted',
            body: `${senderName} has accepted your request.`,
          },
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Request from {item.senderName}</Text>
            <Text>Received at: {item.timestamp}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleAcceptRequest(item.id, item.senderId, item.senderName)}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 ,color: 'indigo'},
  item: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#8134AF', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: 'white', textAlign: 'center' },
});

export default NotificationsScreen;

