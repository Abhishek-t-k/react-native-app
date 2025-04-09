import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { createClient } from '@supabase/supabase-js';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import RNFetchBlob from 'react-native-blob-util';
import { BleManager, Device } from 'react-native-ble-plx';

const supabaseUrl = 'https://iidipqlrpoxmpjajayjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZGlwcWxycG94bXBqYWpheWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDczMTgsImV4cCI6MjA1MzIyMzMxOH0.cHtVWVXJa6M-LyV51aC-tFkYcgd8sZWmrC3XFPAmqbo';
const supabase = createClient(supabaseUrl, supabaseKey);

const bleManager = new BleManager();
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';

type RootStackParamList = {
  Home: undefined;
  Notification: undefined;
  Alert: { alertId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [showReceiverInfo, setShowReceiverInfo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deletedAlert, setDeletedAlert] = useState<any>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const alertCancelRef = useRef<NodeJS.Timeout | null>(null);
  

  const [receiverPhone, setReceiverPhone] = useState<string | null>(null);
  const [userName, setUserName] = useState('User');
  const [receivers, setReceivers] = useState<any[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isReceiverAccepted, setIsReceiverAccepted] = useState(false);
  const [location, setLocation] = useState({ latitude: 37.78825, longitude: -122.4324 });
  const [isRecording, setIsRecording] = useState(false);
  const [audioFilePath, setAudioFilePath] = useState('');
  const audioPlayer = new AudioRecorderPlayer();

  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [bleMessage, setBleMessage] = useState('Disconnected');
  const [pingInterval, setPingInterval] = useState<NodeJS.Timer | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const showSnackbar = (msg: string) => {
    setSnackbarMessage(msg);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });
  };
  const toggleReceiverInfo = () => {
    setShowReceiverInfo(prev => !prev);
  };
  
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(res => res === PermissionsAndroid.RESULTS.GRANTED);
    }
    return true;
  };

  const startPingingESP32 = (connectedDevice: Device) => {
    const interval = setInterval(async () => {
      try {
        const pingMessage = Buffer.from('ping', 'ascii').toString('base64');
        await connectedDevice.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          pingMessage
        );
      } catch (err) {
        console.error('Ping error:', err);
      }
    }, 10000);
    setPingInterval(interval);
  };

  const connectToESP32 = async () => {
    const permission = await requestPermissions();
    if (!permission) return;

    setBleMessage('🔍 Scanning for ESP32...');
    let scanCompleted = false;

    bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        console.error('Scan error:', error);
        setBleMessage('❌ BLE Scan Error');
        return;
      }

      if (scannedDevice?.name === 'ESP32-BLE-Device') {
        scanCompleted = true;
        bleManager.stopDeviceScan();

        try {
          const connectedDevice = await scannedDevice.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          
          setDevice(connectedDevice);
          setIsConnected(true);
          setBleMessage('✅ Connected to ESP32');

          connectedDevice.monitorCharacteristicForService(
            SERVICE_UUID,
            CHARACTERISTIC_UUID,
            (notifyError, char) => {
              if (notifyError) {
                console.error('Notification error:', notifyError);
                return;
              }
          
              if (char?.value) {
                const val = Buffer.from(char.value, 'base64').toString('ascii');
                setBleMessage(`🔔 ${val}`);
          
                if (val === 'button_pressed') {
                  showSnackbar('🔘 Button pressed on ESP32!');
          
                  // Use an async IIFE to safely call async function
                  (async () => {
                    await sendEmergencyAlert();
                  })();
                }
              }
            }
          );
          

          startPingingESP32(connectedDevice);
        } catch (err) {
          console.error('Connection error:', err);
          setBleMessage('❌ Connection failed');
        }
      }
    });

    setTimeout(() => {
      bleManager.stopDeviceScan();
      if (!isConnected && !scanCompleted) {
        setBleMessage('⚠️ ESP32 not found. Try again.');
      }
    }, 10000);
  };

  const disconnect = async () => {
    if (pingInterval) clearInterval(pingInterval);
    if (device) {
      await device.cancelConnection();
      setDevice(null);
      setIsConnected(false);
      setBleMessage('🔌 Disconnected');
    }
  };

  useEffect(() => {
    return () => {
      bleManager.stopDeviceScan();
      if (pingInterval) clearInterval(pingInterval);
      device?.cancelConnection();
    };
  }, [device]);
  // Fetch user data and receivers list
  const fetchUserData = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      setUserName(userDoc.data()?.name || 'User');

      const receiverSnapshot = await firestore().collection('users').get();
      const receiverData = receiverSnapshot.docs
        .filter((doc) => doc.id !== currentUser.uid) // Exclude current user
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setReceivers(receiverData);
    }
  };
  

  // Fetch request status to check if receiver has accepted
  const fetchRequestStatus = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const requestSnapshot = await firestore()
        .collection('requests')
        .where('senderId', '==', currentUser.uid)
        .get();

      if (!requestSnapshot.empty) {
        const requestData = requestSnapshot.docs[0]?.data();
        if (requestData && requestData.status === 'accepted') {
          setIsReceiverAccepted(true);
          setSelectedReceiver(requestData.receiverId); // Automatically select the accepted receiver
        } else {
          setIsReceiverAccepted(false);
        }
      }
    }
  };

  // Request location permission and fetch current location
  const requestLocationPermission = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        Alert.alert('Error', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
 

global.Buffer = global.Buffer || Buffer;

  // Check if the file exists
  const checkFileExistence = async (path) => {
    try {
      const fileExists = await RNFS.exists(path);
      if (!fileExists) {
        console.log('File does not exist!');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/audioRecord.m4a`; // Save to a valid directory with `.m4a` extension
      setIsRecording(true);
      const result = await audioPlayer.startRecorder(path);
      setAudioFilePath(result);
      console.log('Recording started at:', result);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  // Stop recording and upload to Supabase
const stopRecording = async () => {
  try {
    const result = await audioPlayer.stopRecorder();
    setIsRecording(false);
    setAudioFilePath(result);
    console.log('Recording stopped at:', result);

    // Upload audio to Supabase
    await uploadAudioToSupabase(result);

    Alert.alert('Success', 'Recording stopped and uploaded successfully!');
  } catch (error) {
    console.error('Error stopping recording:', error);
    Alert.alert('Error', 'Failed to stop recording.');
  }
};


  // Play the recorded audio
  const playAudio = async () => {
    if (audioFilePath) {
      const fileExists = await checkFileExistence(audioFilePath);
      if (fileExists) {
        try {
          await audioPlayer.stopPlayer(); // Stop any previous playback
          await audioPlayer.startPlayer(audioFilePath); // Play the audio
          console.log('Playing audio from path:', audioFilePath);
        } catch (error) {
          console.error('Error playing audio:', error);
          Alert.alert('Error', 'Failed to play audio.');
        }
      } else {
        Alert.alert('Error', 'Audio file does not exist.');
      }
    } else {
      Alert.alert('Error', 'No audio file found to play.');
    }
  };

  // Upload audio to Supabase
  
// Send emergency alert and upload audio
const sendEmergencyAlert = async () => {
  if (isAlertActive) {
    // CANCEL ALERT
    audioPlayer.stopRecorder(); // Stop recording if active
    setIsRecording(false);
    setIsAlertActive(false);
    if (alertCancelRef.current) clearTimeout(alertCancelRef.current);
    showSnackbar('❌ Alert canceled');
    return;
  }

  const currentUser = auth().currentUser;
  if (!currentUser || !selectedReceiver || !isReceiverAccepted) {
    Alert.alert('Error', 'Please ensure the receiver has accepted the request.');
    return;
  }

  try {
    const senderName = userName;
    const senderLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    const receiver = receivers.find((r) => r.id === selectedReceiver);

    if (!receiver) {
      Alert.alert('Error', 'Receiver not found.');
      return;
    }

    // Start recording
    const path = `${RNFS.DocumentDirectoryPath}/audioRecord.m4a`;
    setIsRecording(true);
    await audioPlayer.startRecorder(path);
    setAudioFilePath(path);
    setIsAlertActive(true);
    showSnackbar('⏳ Recording started, sending alert in 30s...');

    // Delay sending alert for 30s
    alertCancelRef.current = setTimeout(async () => {
      try {
        const result = await audioPlayer.stopRecorder();
        setIsRecording(false);
        setAudioFilePath(result);
        setIsAlertActive(false);

        const audioBinary = await RNFS.readFile(result, 'base64');
        const buffer = Buffer.from(audioBinary, 'base64');
        const fileName = `recordings/${Date.now()}.m4a`;

        const { error } = await supabase.storage
          .from('audio-record')
          .upload(fileName, buffer, {
            contentType: 'audio/m4a',
            cacheControl: '3600',
          });

        if (error) {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to upload audio.');
          return;
        }

        const audioUrl = supabase.storage
          .from('audio-record')
          .getPublicUrl(fileName).data.publicUrl;

        await firestore().collection('alerts').add({
          senderId: currentUser.uid,
          senderName,
          senderLocation,
          receiverId: receiver.id,
          receiverName: receiver.name,
          timestamp: firestore.FieldValue.serverTimestamp(),
          status: 'pending',
          message: 'Emergency alert triggered!',
          audioUrl,
        });

        Alert.alert('✅ Success', `Emergency alert sent to ${receiver.name}`);
        setIsReceiverAccepted(false);
      } catch (err) {
        console.error('Finalization error:', err);
        Alert.alert('Error', 'Failed to send alert.');
        setIsAlertActive(false);
      }
    }, 30000); // 30s

  } catch (error) {
    console.error('Error starting alert:', error);
    Alert.alert('Error', 'Failed to initiate alert.');
    setIsAlertActive(false);
  }
};



  // UseFocusEffect to fetch user data, request status, and subscribe to alerts
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchRequestStatus();  // Check for the accepted receiver request status
      const unsubscribe = firestore()
        .collection('alerts')
        .where('receiverId', '==', auth().currentUser?.uid)
        .onSnapshot((querySnapshot) => {
          const newNotifications = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
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

  useEffect(() => {
    requestLocationPermission();  // Request location on mount
  }, []);
  

  return (
    <View style={{ flex: 1 }}>
      {/* TOP BUTTONS */}
      <View style={styles.topButtonsContainer}>
      <Text style={styles.greeting}>Welcome, {userName}!</Text>

        <TouchableOpacity
        
          style={[styles.bleButton, isConnected ? styles.disconnectButton : styles.connectButton]}
          onPress={isConnected ? disconnect : connectToESP32}
        >
          <Text style={styles.bleButtonText}>
            {isConnected ? 'Disconnect from ESP32' : 'Connect to ESP32'}
          </Text>

        </TouchableOpacity>
        <Text style={styles.bleStatus}>{bleMessage}</Text>

        <TouchableOpacity
          style={[styles.recordButton, isRecording ? styles.stopButton : null]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Audio Recording' : 'Start Audio Recording'}
          </Text>
        </TouchableOpacity>
      </View>
  
      {/* SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.container}>
  
          {isReceiverAccepted ? (
            <Text style={styles.receiverText}>
              Receiver Accepted: {receivers.find(r => r.id === selectedReceiver)?.name}
            </Text>
          ) : (
            <Text style={styles.receiverText}>No accepted receiver yet.</Text>
          )}
  
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationContainer}
              onPress={() => navigation.navigate('Alert', { alertId: notification.id })}
              activeOpacity={0.9}
            >
              <View style={styles.notificationRow}>
                <Text style={styles.notificationText}>New Alert!</Text>
                {notification.timestamp && (
                  <Text style={styles.timestampText}>
                    {new Date(notification.timestamp.seconds * 1000).toLocaleString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={async () => {
                    try {
                      setDeletedAlert(notification);
                      await firestore().collection('alerts').doc(notification.id).delete();
                      showSnackbar('🗑️ Alert deleted');
                      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
                      deleteTimeoutRef.current = setTimeout(() => setDeletedAlert(null), 5000);
                    } catch (error) {
                      console.error('Delete error:', error);
                      Alert.alert('Error', 'Failed to delete alert.');
                    }
                  }}
                >
                  <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
  
        </View>
      </ScrollView>
  
      {/* FIXED SEND ALERT BUTTON AT BOTTOM */}
      <TouchableOpacity
        style={[
          styles.sendButtonFixed,
          !isReceiverAccepted ? styles.disabledButton : null,
        ]}
        onPress={sendEmergencyAlert}
        disabled={!isReceiverAccepted}
      >
<Text style={styles.sendButtonText}>
  {isAlertActive ? 'Cancel Alert' : 'Send Alert'}
</Text>
      </TouchableOpacity>
  

    </View>
  );
  
  
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 30, fontWeight: 'bold', color: '#8134AF', textAlign: 'center', marginBottom: 20 },
  receiverSelection: { marginBottom: 20 },
  receiverButton: { padding: 10, backgroundColor: '#ddd', marginVertical: 5, borderRadius: 5 },
  selectedReceiver: { backgroundColor: '#c482d5' },
  receiverText: { fontSize: 16 },
  sendButton: { padding: 30, backgroundColor: '#8134AF', borderRadius: 100, alignItems: 'center', marginTop: 150 },
  disabledButton: { backgroundColor: '#ccc' },
  sendButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  notificationIcon: { marginRight: 10, position: 'relative' },
  badge: { position: 'absolute', top: -5, right: -10, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  notificationContainer: { marginVertical: 15, padding: 10, backgroundColor: '#fff', borderRadius: 50, borderColor: '#8134AF', borderWidth: 1, marginBottom: 20, marginTop: 20 },
  notificationText: { fontSize: 16, color: '#333', textAlign: 'center', padding: 5 },
  recordButton: {
    padding: 20,
    backgroundColor: '#8134AF',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  
  notificationText: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  
  timestampText: {
    fontSize: 12,
    color: '#999',
    minWidth: 90,
    textAlign: 'right',
  },
  
  deleteIcon: {
    paddingLeft: 8,
    paddingRight: 4,
  },
  topButtonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#f9f9f9',
  },
  
  sendButtonFixed: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#8134AF',
    borderRadius: 100,
    padding: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  
  
  notificationText: {
    fontSize: 16,
    color: '#333',
    padding: 5,
    flex: 1,
  },
  
  timestampText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    marginLeft: 10,
    minWidth: 60,
  },
  
  stopButton: { backgroundColor: '#E63946' },
  recordButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  playButton: {
    padding: 20,
    backgroundColor: '#34A853',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },bleButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  connectButton: {
    backgroundColor: '#3498db',
  },
  disconnectButton: {
    backgroundColor: '#e74c3c',
  },
  bleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bleStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  snackbar: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  snackbarText: {
    color: 'white',
    fontSize: 14,
  },
  
  stopPlayButton: {
    backgroundColor: '#E63946',
  },
  playButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },

  
  
});

export default HomeScreen;
