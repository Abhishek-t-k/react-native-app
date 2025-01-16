import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';

type RootStackParamList = {
  Alert: { alertId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Alert'>;

const NotificationReadPage = ({ route }: Props) => {
  const { alertId } = route.params;
  const [alertDetails, setAlertDetails] = useState<any>(null);

  useEffect(() => {
    const fetchAlertDetails = async () => {
      const alertDoc = await firestore().collection('alerts').doc(alertId).get();
      if (alertDoc.exists) {
        setAlertDetails(alertDoc.data());
      } else {
        Alert.alert('Error', 'Alert not found.');
      }
    };

    fetchAlertDetails();
  }, [alertId]);

  if (!alertDetails) {
    return (
      <View style={styles.container}>
        <Text>Loading alert details...</Text>
      </View>
    );
  }

  const { senderName, location, message, senderLocation } = alertDetails;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alert Details</Text>
      <Text style={styles.text}>Sender: {senderName}</Text>
      <Text style={styles.text}>Message: {message}</Text>
     
      
      {/* Display Sender's Location */}
      {senderLocation ? (
        <Text style={styles.text}>
          Sender Location: {senderLocation.latitude}, {senderLocation.longitude}
        </Text>
      ) : (
        <Text style={styles.text}>Sender's location not available.</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert('Alert acknowledged!')}
      >
        <Text style={styles.buttonText}>Acknowledge</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 },
  button: { backgroundColor: '#8134AF', padding: 15, borderRadius: 10, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default NotificationReadPage;


