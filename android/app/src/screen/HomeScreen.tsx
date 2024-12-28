import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const notifications = [
    'New notification 1',
    'New notification 2',
    'New notification 3',
  ];

  const handleNavigate = (screen: string) => {
    navigation.navigate('Notification'); // Navigate to different screens
  };

  return (
    <View style={styles.container}>
      {/* User Greeting */}
      <Text style={styles.greeting}>Welcome to the Home Screen!</Text>

      {/* Notifications */}
      <View style={styles.notifications}>
        {notifications.map((notification, index) => (
          <TouchableOpacity
            key={index}
            style={styles.notificationButton}
            onPress={() => handleNavigate('Notification')}
          >
            <Text style={styles.notificationText}>{notification}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content */}
      <Text style={styles.title}>Home Screen</Text>

      {/* Footer */}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    marginTop: 80,
    
  },
  greeting: {
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#8134AF',
  },
  notifications: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  notificationButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#c482d5',
  },
  notificationText: {
    fontSize: 16,
    color: 'indigo',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    color: '#8134AF',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 16,
    color: '#c482d5',
  },
});

export default HomeScreen;

