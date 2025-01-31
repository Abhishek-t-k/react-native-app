import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
import RNFetchBlob from 'rn-fetch-blob'; // For downloading the file if needed


const supabaseUrl = 'https://iidipqlrpoxmpjajayjk.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZGlwcWxycG94bXBqYWpheWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDczMTgsImV4cCI6MjA1MzIyMzMxOH0.cHtVWVXJa6M-LyV51aC-tFkYcgd8sZWmrC3XFPAmqbo'; // Replace with your Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);

const audioRecorderPlayer = new AudioRecorderPlayer();

type RootStackParamList = {
  Home: undefined;
  Notification: undefined;
  Alert: { alertId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [userName, setUserName] = useState('User');
  const [receivers, setReceivers] = useState<any[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isReceiverAccepted, setIsReceiverAccepted] = useState(false);
  const [location, setLocation] = useState({
    latitude: 37.78825, // Default latitude
    longitude: -122.4324, // Default longitude
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioPath, setAudioPath] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRecorderPlayer = new AudioRecorderPlayer();
  const [audioFilePath, setAudioFilePath] = useState('');
  const [audioPlayer] = useState(new AudioRecorderPlayer());

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
  const uploadAudioToSupabase = async (filePath) => {
    try {
      const fileExists = await checkFileExistence(filePath);
      if (!fileExists) {
        Alert.alert('Error', 'Audio file does not exist.');
        return;
      }

      const audioBinary = await RNFS.readFile(filePath, 'base64'); // Read the file as base64
      const buffer = Buffer.from(audioBinary, 'base64'); // Convert Base64 to binary

      const fileName = `recordings/${Date.now()}.m4a`; // Unique file name for Supabase storage
      const { data, error } = await supabase.storage
        .from('audio-record') // Replace with your Supabase bucket name
        .upload(fileName, buffer, {
          contentType: 'audio/m4a',
          cacheControl: '3600',
        });

      if (error) {
        console.error('Error uploading audio:', error);
        Alert.alert('Error', 'Failed to upload audio.');
      } else {
        console.log('Audio uploaded successfully:', data);
        Alert.alert('Success', 'Audio uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading audio to Supabase:', error);
      Alert.alert('Error', 'Failed to upload audio.');
    }
  };
// Send emergency alert and upload audio
const sendEmergencyAlert = async () => {
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

    // Check if the audio file exists
    const fileExists = await checkFileExistence(audioFilePath);
    if (!fileExists) {
      Alert.alert('Error', 'No recorded audio file found to upload.');
      return;
    }

    // Upload the audio to Supabase
    const audioBinary = await RNFS.readFile(audioFilePath, 'base64'); // Read file as base64
    const buffer = Buffer.from(audioBinary, 'base64'); // Convert Base64 to binary
    const fileName = `recordings/${Date.now()}.m4a`; // Generate a unique file name

    const { data, error } = await supabase.storage
      .from('audio-record') // Replace with your Supabase bucket name
      .upload(fileName, buffer, {
        contentType: 'audio/m4a',
        cacheControl: '3600',
      });

    if (error) {
      console.error('Error uploading audio:', error);
      Alert.alert('Error', 'Failed to upload audio.');
      return;
    }

    // The public URL of the uploaded audio
    const audioUrl = supabase.storage
      .from('audio-record')
      .getPublicUrl(fileName).data.publicUrl;

    // Send the alert to Firestore with the audio URL
    await firestore().collection('alerts').add({
      senderId: currentUser.uid,
      senderName,
      senderLocation, // Add sender's location
      receiverId: receiver.id,
      receiverName: receiver.name,
      timestamp: firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      message: 'Emergency alert triggered!',
      audioUrl, // Attach the audio URL to the alert
    });

    Alert.alert('Success', `Emergency alert sent to ${receiver.name} with audio!`);
    setIsReceiverAccepted(false); // Reset receiver acceptance status
  } catch (error) {
    console.error('Error sending alert:', error);
    Alert.alert('Error', 'Failed to send alert.');
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
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome, {userName}!</Text>

      {/* Automatically show the accepted receiver's info */}
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
        >
          <Text style={styles.notificationText}>
            New Alert!
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.recordButton, isRecording ? styles.stopButton : null]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.recordButtonText}>
          {isRecording ? 'Stop audio Recording' : 'Start audio Recording'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
  style={[styles.playButton, isPlaying ? styles.stopPlayButton : null]}
  onPress={playAudio}
>
  <Text style={styles.playButtonText}>
    {isPlaying ? 'Stop Audio' : 'Play Audio'}
  </Text>
</TouchableOpacity>

      <TouchableOpacity
        style={[styles.sendButton, !isReceiverAccepted ? styles.disabledButton : null]}
        onPress={sendEmergencyAlert}
        disabled={!isReceiverAccepted}
      >
        <Text style={styles.sendButtonText}>Send Alert</Text>
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
  },
  stopButton: { backgroundColor: '#E63946' },
  recordButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  playButton: {
    padding: 20,
    backgroundColor: '#34A853',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
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
