import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
  const audioRecorderPlayer = new AudioRecorderPlayer();

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
  }, [alertId]);

  const playAudio = async (audioUrl: string) => {
    try {
      await audioRecorderPlayer.startPlayer(audioUrl);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position === e.duration) {
          audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio.');
    }
  };

  if (!alertDetails) {
    return (
      <View style={styles.container}>
        <Text>Loading alert details...</Text>
      </View>
    );
  }
const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app requires access to your location.',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
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

      {/* Display Play Audio Button if audioUrl exists */}
      {audioUrl ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => playAudio(audioUrl)}
        >
          <Text style={styles.buttonText}>Play Audio</Text>
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
  button: { backgroundColor: '#8134AF', padding: 15, borderRadius: 10, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  map: {
    width: '100%',
    height: 300,
  },
  
});

export default NotificationReadPage;


