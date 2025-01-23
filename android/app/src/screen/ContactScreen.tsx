import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const EmergencyContactsScreen = () => {
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const currentUser = auth().currentUser;

  const fetchRequests = async () => {
    const snapshot = await firestore()
      .collection('requests')
      .where('senderId', '==', currentUser?.uid)
      .get();

    const requests = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const request = doc.data();
        const userDoc = await firestore().collection('users').doc(request.receiverId).get();
        const recipientName = userDoc.exists ? userDoc.data().name : 'Unknown User';
        const timestamp = request.timestamp?.toDate()?.toLocaleString();

        return {
          id: doc.id,
          recipientName,
          status: request.status,
          timestamp,
        };
      })
    );

    setSentRequests(requests);
  };

  const fetchEmergencyContacts = async () => {
    if (currentUser) {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();
      setEmergencyContacts(userData?.emergencyContacts || []);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
      fetchEmergencyContacts();
    }
  }, [currentUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests();
    await fetchEmergencyContacts();
    setIsRefreshing(false);
  };

  const handleSendRequest = async () => {
    if (!name) {
      alert('Please enter a name to send the request');
      return;
    }

    const senderId = currentUser.uid;
    const recipientDoc = await firestore().collection('users').where('name', '==', name).get();

    if (recipientDoc.empty) {
      alert('Recipient not found!');
      return;
    }

    const receiverId = recipientDoc.docs[0].id;
    const recipientData = recipientDoc.docs[0].data();
    const recipientPhone = recipientData.phone;

    const userDoc = await firestore().collection('users').doc(senderId).get();
    const userData = userDoc.data();
    const isContact = userData?.emergencyContacts?.some(contact => contact.phone === recipientPhone);

    if (isContact) {
      alert('This person is already in your emergency contacts. You cannot send another request.');
      return;
    }

    const requestRef = await firestore().collection('requests').add({
      senderId,
      receiverId,
      status: 'pending',
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    const newRequest = {
      id: requestRef.id,
      recipientName: name,
      status: 'pending',
      timestamp: new Date().toLocaleString(),
    };

    setSentRequests(prevRequests => [...prevRequests, newRequest]);
    Alert.alert('Request Sent', `A request has been sent to ${name}.`);
    setName('');
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await firestore().collection('requests').doc(requestId).delete();
      setSentRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
      Alert.alert('Request Canceled', 'The request has been successfully canceled.');
    } catch (error) {
      console.error('Error canceling request:', error);
      Alert.alert('Error', 'An error occurred while canceling the request. Please try again.');
    }
  };

  const handleAddContact = async () => {
    if (!contactName || !contactPhone) {
      alert('Please fill in both the name and phone number fields');
      return;
    }

    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          emergencyContacts: firestore.FieldValue.arrayUnion({
            name: contactName,
            phone: contactPhone,
          }),
        });

      Alert.alert(
        'Contact Added',
        `${contactName} has been added to your emergency contacts.`,
        [{ text: 'OK' }]
      );

      setContactName('');
      setContactPhone('');
      fetchEmergencyContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('An error occurred while adding the contact. Please try again.');
    }
  };

  const handleDeleteContact = async (contact) => {
    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          emergencyContacts: firestore.FieldValue.arrayRemove(contact),
        });

      setEmergencyContacts(prevContacts => prevContacts.filter(c => c.phone !== contact.phone));
      Alert.alert('Contact Removed', `${contact.name} has been removed from your emergency contacts.`);
    } catch (error) {
      console.error('Error removing contact:', error);
      Alert.alert('Error', 'An error occurred while removing the contact. Please try again.');
    }
  };

  // Filter the sent requests based on the selected filter
  const filteredRequests = sentRequests.filter(request => 
    filter === 'all' || request.status === filter
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        <Text style={styles.title}>Add Emergency Contact</Text>
        <TextInput style={styles.input} placeholder="Contact Name" placeholderTextColor="gray" value={contactName} onChangeText={setContactName} />
        <TextInput style={styles.input} placeholder="Contact Phone Number" placeholderTextColor="gray" keyboardType="phone-pad" value={contactPhone} onChangeText={setContactPhone} />
        <TouchableOpacity style={[styles.button, (!contactName || !contactPhone) ? styles.buttonDisabled : null]} onPress={handleAddContact} disabled={!contactName || !contactPhone}>
          <Text style={styles.buttonText}>Add Contact</Text>
        </TouchableOpacity>

        {emergencyContacts.length > 0 ? (
          emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <Text style={styles.contactText}>
                <Text style={styles.boldText}>Name:</Text> {contact.name}
              </Text>
              <Text style={styles.contactText}>
                <Text style={styles.boldText}>Phone:</Text> {contact.phone}
              </Text>
              <TouchableOpacity style={styles.cancelButton} onPress={() => handleDeleteContact(contact)}>
                <Text style={styles.cancelButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noContactsText}>No emergency contacts added yet.</Text>
        )}

        <Text style={styles.title}>Send Emergency Request</Text>
        <TextInput style={styles.input} placeholder="Enter Name of Person" placeholderTextColor="gray" value={name} onChangeText={setName} />
        <TouchableOpacity style={[styles.button, !name ? styles.buttonDisabled : null]} onPress={handleSendRequest} disabled={!name}>
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>

        {/* Filter buttons at the bottom */}
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter('all')} style={styles.filterButton}>
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('pending')} style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('accepted')} style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Accepted</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('declined')} style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Rejected</Text>
        </TouchableOpacity>
      </View>
        {filteredRequests.length > 0 ? (
          filteredRequests.map(request => (
            <View key={request.id} style={styles.requestItem}>
              <Text style={styles.requestText}>
                <Text style={styles.boldText}>Sent to:</Text> {request.recipientName}
              </Text>
              <Text style={styles.requestText}>
                <Text style={styles.boldText}>Status:</Text> <Text style={styles.statusText}>{request.status}</Text>
              </Text>
              <Text style={styles.requestText}>
                <Text style={styles.boldText}>Timestamp:</Text> {request.timestamp}
              </Text>
              {request.status === 'pending' && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelRequest(request.id)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noRequestsText}>No requests found.</Text>
        )}
      </ScrollView>

      
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#8134AF', textAlign: 'center', marginBottom: 20, marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#8134AF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#8134AF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }, // Adjusted font size
  buttonDisabled: { backgroundColor: '#c482d5' },
  contactItem: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#8134AF',
    borderRadius: 10,
    backgroundColor: '#f3e5f5',
  },
  contactText: { fontSize: 16, marginBottom: 5 },
  boldText: { fontWeight: 'bold' },
  noContactsText: { textAlign: 'center', color: 'gray', fontSize: 16, marginTop: 20 },
  cancelButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#e53935',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: { color: 'white', fontWeight: 'bold' },
  noRequestsText: { textAlign: 'center', color: 'gray', fontSize: 16, marginTop: 20 },

  requestItem: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#8134AF',
    borderRadius: 10,
    backgroundColor: '#f3e5f5',
  },
  requestText: { fontSize: 16, marginBottom: 5 },
  statusText: {
    color: '#8134AF', 
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
  },
  filterButton: {
    backgroundColor: '#8134AF',
    padding: 8,
    borderRadius: 5,
    width: '22%',
    alignItems: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13, // Adjusted font size
  },
});

export default EmergencyContactsScreen;
