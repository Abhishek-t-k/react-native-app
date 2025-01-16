import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const DeviceScreen = () => {
  const [connected, setConnected] = useState(false);
  const [manager, setManager] = useState<BleManager | null>(null); // Type explicitly as BleManager
  const [device, setDevice] = useState<any>(null);

  useEffect(() => {
    // Initialize Bluetooth manager and check if BLE is supported
    const initializeBluetooth = () => {
      const bleManager = new BleManager();
      setManager(bleManager); // set the manager state once it is created
    };

    initializeBluetooth();

    return () => {
      if (manager) {
        manager.destroy(); // Clean up manager instance on component unmount
      }
    };
  }, []);

  const handleConnect = async () => {
    if (connected) {
      // If already connected, disconnect
      if (manager && device) {
        manager.cancelDeviceConnection(device.id)
          .then(() => {
            setConnected(false);
            Alert.alert('Device Disconnected', 'Your device has been disconnected.');
          })
          .catch((error) => Alert.alert('Error', error.message));
      }
    } else {
      try {
        // Start scanning for nearby devices (you may add filters here for ESP32)
        const scannedDevice = await scanForDevice();
        if (scannedDevice) {
          setDevice(scannedDevice);
          await connectToDevice(scannedDevice);
        } else {
          Alert.alert('Device Not Found', 'No ESP32 device found nearby.');
        }
      } catch (error) {
        Alert.alert('Connection Error', 'Failed to connect to device.');
      }
    }
  };

  // Scan for devices and find the ESP32 (you can match based on name, UUID, etc.)
  const scanForDevice = () => {
    return new Promise<any>((resolve, reject) => {
      if (!manager) {
        reject('Bluetooth manager not initialized');
        return;
      }
      manager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          reject(error);
        }
        if (scannedDevice && scannedDevice.name === 'ESP32') { // Replace with ESP32's name or other unique identifier
          manager.stopDeviceScan();
          resolve(scannedDevice);
        }
      });
    });
  };

  // Connect to the ESP32 device
  const connectToDevice = (device: any) => {
    return device.connect()
      .then(() => {
        setConnected(true);
        Alert.alert('Device Connected', 'Your device has been successfully connected.');
      })
      .catch((error) => {
        Alert.alert('Connection Error', error.message);
        setConnected(false);
      });
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
