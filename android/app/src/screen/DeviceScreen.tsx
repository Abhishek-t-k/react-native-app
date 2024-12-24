import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';

const DeviceScreen = () => {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    if (connected) {
      // If the device is already connected, display a disconnect option
      setConnected(false);
      Alert.alert('Device Disconnected', 'Your device has been disconnected.');
    } else {
      // If not connected, proceed with connection
      setConnected(true);
      Alert.alert('Device Connected', 'Your device has been successfully connected.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Connection</Text>
      <Text style={styles.status}>
        {connected ? 'Device Status: Connected' : 'Device Status: Not Connected'}
      </Text>
     
      <TouchableOpacity
        style={[styles.button, connected && styles.buttonConnected]} 
        onPress={handleConnect}
      >
        <Text style={styles.buttonText}>
          {connected ? 'Disconnect from Device' : 'Connect to Device'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#8134AF',
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
    color: 'indigo',
  },
  button: {
    backgroundColor: '#8134AF', // Button background color
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10, // Rounded corners
    elevation: 3, // Shadow on Android
    width: '100%',
    alignItems: 'center',
  },
  buttonConnected: {
    backgroundColor: 'green', // Change to green when connected
  },
  buttonText: {
    color: '#fff', // Text color
    fontSize: 18,
    fontWeight: 'bold',
  },
});



export default DeviceScreen;
