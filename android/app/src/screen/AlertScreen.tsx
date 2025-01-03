import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Notification: { notification: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Notification'>;

const NotificationReadPage = ({ route }: Props) => {
  const { notification  } = route.params || {};

  const handleShowLocation = () => {
    Alert.alert('Location', 'Showing location...');
  };

  const handlePlayLiveAudio = () => {
    Alert.alert('Audio', 'Playing live audio...');
  };

  const handleViewUserDetails = () => {
    Alert.alert('User Details', 'Displaying user details...');
  };

  return (
    <View style={styles.container}>
      <View >
        <Text style={styles.title}>Alert</Text>
       
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleShowLocation}>
          <Text style={styles.buttonText}>Show Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePlayLiveAudio}>
          <Text style={styles.buttonText}>Play Live Audio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleViewUserDetails}>
          <Text style={styles.buttonText}>View User Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8134AF',
    marginBottom: 100,
    marginTop: -100,
    textAlign: 'center',
  },
  notificationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '90%',
  },
  button: {
    backgroundColor: '#8134AF',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default NotificationReadPage;
