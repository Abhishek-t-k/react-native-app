import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const EditProfile = ({ route, navigation }: any) => {
  const { profile, updateProfile } = route.params;

  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPassword, setEditPassword] = useState('');

  const handleSave = () => {
    const updatedProfile = {
      name: editName,
      phone: editPhone,
      email: editEmail,
      password: editPassword || profile.password,
    };

    updateProfile(updatedProfile);
    navigation.goBack(); // Go back to ProfileScreen after saving changes
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="indigo"
        value={editName}
        onChangeText={setEditName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        placeholderTextColor="indigo"
        value={editPhone}
        onChangeText={setEditPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="indigo"
        value={editEmail}
        onChangeText={setEditEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="indigo"
        value={editPassword}
        onChangeText={setEditPassword}
        secureTextEntry
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: '#8134AF' }]} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#DD2A7B' }]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#8134AF',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'indigo',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;

