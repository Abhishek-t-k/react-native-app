import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Notification: undefined;
  Alert: undefined; // Added Alert screen
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [userName, setUserName] = useState('User'); // Placeholder for user's name
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch user data
  const fetchUserData = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      setUserName(userDoc.data()?.name || 'User');
    }
  };

  // Real-time listener for notifications
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = firestore()
        .collection('requests')
        .where('receiverId', '==', auth().currentUser.uid)
        .onSnapshot((querySnapshot) => {
          // Listen to the collection of requests and update notifications state
          const newNotifications = querySnapshot.docs
            .map((doc) => doc.data())
            .filter((notification) => notification.status !== 'declined'); // Exclude declined requests

          setNotifications(newNotifications); // This will automatically update the count
        });

      fetchUserData(); // Fetch user details
      return () => unsubscribe(); // Cleanup on unmount
    }, [])
  );

  // Update notification icon when data changes
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

      {/* Alert Button */}
      <View style={styles.alert}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Alert')}
        >
          <Text style={styles.notificationText}>New Alert</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 30, fontWeight: 'bold', color: '#8134AF', textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: '#8134AF' },
  alert: { paddingVertical: 20, paddingHorizontal: 20 },
  notificationButton: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10, borderWidth: 1, borderColor: '#c482d5' },
  notificationText: { fontSize: 16, color: 'indigo' },
  notificationIcon: { marginRight: 10, position: 'relative' },
  badge: { position: 'absolute', top: -5, right: -10, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});

export default HomeScreen;

