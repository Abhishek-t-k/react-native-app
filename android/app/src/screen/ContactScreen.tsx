import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

const EmergencyContactsScreen = () => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [contacts, setContacts] = useState([]);

  // Function to validate phone number format
  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // A basic phone number regex for 10 digits
    return phoneRegex.test(phone);
  };

  const handleAddContact = () => {
    if (name && number) {
      if (!isValidPhoneNumber(number)) {
        alert('Please enter a valid 10-digit phone number.');
        return;
      }
      setContacts([...contacts, { id: Date.now().toString(), name, number }]);
      setName('');
      setNumber('');
    } else {
      alert('Please enter both name and number');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        placeholderTextColor="indigo"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number"
        placeholderTextColor="indigo"
        value={number}
        onChangeText={setNumber}
        keyboardType="phone-pad"
      />
      
      <TouchableOpacity 
        style={[styles.button, !name || !number ? styles.buttonDisabled : null]} 
        onPress={handleAddContact}
        disabled={!name || !number}
      >
        <Text style={styles.buttonText}>Add Contact</Text>
      </TouchableOpacity>
      
      {/* Display Contacts */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>{item.name}: {item.number}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
   
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#8134AF',
    padding: 30,
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
  buttonDisabled: {
    backgroundColor: '#c1a1d5', // Disabled button background color
  },
  buttonText: {
    color: '#fff', // Text color
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c482d5',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
  },
});

export default EmergencyContactsScreen;

