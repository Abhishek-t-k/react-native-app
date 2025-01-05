import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const NotificationsScreen = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetching all requests and filtering out declined ones locally, then sorting by timestamp
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      const querySnapshot = await firestore()
        .collection('requests')
        .where('receiverId', '==', currentUser.uid)
        .get();

      const data = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const requestData = doc.data();
          const senderDoc = await firestore()
            .collection('users')
            .doc(requestData.senderId)
            .get();
          const senderName = senderDoc.data()?.name || 'Unknown';
          const timestamp = requestData.timestamp?.toDate().toLocaleString() || 'Unknown time';
          return { id: doc.id, ...requestData, senderName, timestamp, rawTimestamp: requestData.timestamp };
        })
      );

      // Filter out declined requests locally and sort by timestamp (latest first)
      const activeRequests = data.filter((request) => request.status !== 'declined');
      const sortedRequests = activeRequests.sort((a, b) => b.rawTimestamp - a.rawTimestamp); // Sorting by timestamp descending

      setRequests(sortedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle accepting a request
  const handleAcceptRequest = async (id, senderId, senderName) => {
    try {
      // Update the status to 'accepted' in the requests collection
      await firestore().collection('requests').doc(id).update({ status: 'accepted' });

      // Notify the sender
      sendNotificationToSender(senderId, senderName, 'accepted');

      // After acceptance, re-fetch the data to reflect changes
      fetchRequests();

      Alert.alert('Success', `You have successfully connected with ${senderName}`);
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept the request. Please try again.');
    }
  };

  // Handle declining a request
  const handleDeclineRequest = async (id, senderId, senderName) => {
    try {
      // Update the status to 'declined' in the requests collection
      await firestore().collection('requests').doc(id).update({ status: 'declined' });

      // Notify the sender
      sendNotificationToSender(senderId, senderName, 'declined');

      // After declining, re-fetch the data to reflect changes (without showing declined requests)
      fetchRequests();

      Alert.alert('Request Declined', 'You have declined the request.');
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert('Error', 'Failed to decline the request. Please try again.');
    }
  };

  // Send notification to the sender (request initiator)
  const sendNotificationToSender = async (senderId, senderName, status) => {
    try {
      const senderDoc = await firestore().collection('users').doc(senderId).get();
      const deviceToken = senderDoc.data()?.deviceToken;

      if (deviceToken) {
        // Send notification via FCM
        await messaging().sendMessage({
          token: deviceToken,
          notification: {
            title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            body: `Your request has been ${status} by ${auth().currentUser.displayName || 'Unknown'}.`,
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            screen: 'RequestStatus', // Use this to navigate when the user clicks the notification
            requestId: senderId, // Include request id for redirection purposes
          },
        });

        console.log('Notification sent successfully!');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#8134AF" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              {item.status === 'accepted' ? (
                <Text style={styles.successText}>You have successfully connected with {item.senderName}</Text>
              ) : (
                <>
                  <Text style={styles.senderName}>Request from: {item.senderName}</Text>
                  <Text style={styles.timestamp}>Received at: {item.timestamp}</Text>
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => handleAcceptRequest(item.id, item.senderId, item.senderName)}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.declineButton]}
                      onPress={() => handleDeclineRequest(item.id, item.senderId, item.senderName)}
                    >
                      <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No notifications available.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: 'indigo' },
  item: { borderWidth: 1, borderRadius: 10, padding: 15, marginBottom: 15, backgroundColor: '#fff', borderColor: '#ccc' },
  senderName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  timestamp: { fontSize: 14, color: '#555', marginBottom: 10 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { padding: 10, borderRadius: 5, width: '48%' },
  acceptButton: { backgroundColor: '#4CAF50' },
  declineButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  successText: { fontSize: 16, color: 'green', fontWeight: 'bold', textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#aaa', fontSize: 16 },
});

export default NotificationsScreen;








