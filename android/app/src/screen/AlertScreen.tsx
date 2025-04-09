import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import MapView, { Marker } from 'react-native-maps';

type RootStackParamList = {
  Alert: { alertId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Alert'>;

const NotificationReadPage = ({ route }: Props) => {
  const { alertId } = route.params;
  const [alertDetails, setAlertDetails] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const playbackListener = useRef<any>(null);

  useEffect(() => {
    const fetchAlertDetails = async () => {
      try {
        const alertDoc = await firestore().collection('alerts').doc(alertId).get();
        if (alertDoc.exists) {
          setAlertDetails(alertDoc.data());
        } else {
          Alert.alert('Error', 'Alert not found.');
        }
      } catch (error) {
        console.error('Error fetching alert details:', error);
        Alert.alert('Error', 'Failed to fetch alert details.');
      }
    };

    fetchAlertDetails();

    return () => {
      // Clean up on unmount
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [alertId]);

  const toggleAudio = async (audioUrl: string) => {
    try {
      if (!isPlaying) {
        await audioRecorderPlayer.startPlayer(audioUrl);
        setIsPlaying(true);

        // Remove any existing listener before adding a new one
        audioRecorderPlayer.removePlayBackListener();

        playbackListener.current = audioRecorderPlayer.addPlayBackListener((e) => {
          if (e.current_position >= e.duration) {
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
            setIsPlaying(false);
          }
        });
      } else {
        await audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Audio error:', error);
      Alert.alert('Error', 'Failed to play or stop audio.');
    }
  };

  if (!alertDetails) {
    return (
      <View style={styles.container}>
        <Text>Loading alert details...</Text>
      </View>
    );
  }

  const { senderName, message, senderLocation, audioUrl } = alertDetails;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alert Details</Text>
      <Text style={styles.text}>Sender: {senderName}</Text>
      <Text style={styles.text}>Message: {message}</Text>

      {/* Display Sender's Location */}
      {senderLocation ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: senderLocation.latitude,
            longitude: senderLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: senderLocation.latitude,
              longitude: senderLocation.longitude,
            }}
            title="Sender's Location"
          />
        </MapView>
      ) : (
        <Text style={styles.text}>Sender's location not available.</Text>
      )}

      {/* Display Play/Stop Audio Button */}
      {audioUrl ? (
        <TouchableOpacity style={styles.button} onPress={() => toggleAudio(audioUrl)}>
          <Text style={styles.buttonText}>
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.text}>No audio file attached.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 },
  button: {
    backgroundColor: '#8134AF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  map: {
    width: '100%',
    height: 300,
  },
});

export default NotificationReadPage;
