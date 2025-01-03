import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const EditProfile = ({ route, navigation }: any) => {
  const { profile, updateProfile } = route.params;

  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPassword, setEditPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/; // Adjust for your locale
    return phoneRegex.test(phone);
  };

  const handleSave = async () => {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      navigation.navigate('Login');
      return;
    }

    // Validate inputs
    if (!validateEmail(editEmail)) {
      Alert.alert('Error', 'Invalid email format.');
      return;
    }
    if (!validatePhone(editPhone)) {
      Alert.alert('Error', 'Invalid phone number format.');
      return;
    }
    if (editPassword && editPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      // Reauthenticate the user with the current password
      const credential = auth.EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await currentUser.reauthenticateWithCredential(credential);

      // Update email in Firebase Authentication if changed
      if (editEmail !== profile.email) {
        await currentUser.updateEmail(editEmail);
      }

      // If the password field is filled, update the password
      if (editPassword) {
        await currentUser.updatePassword(editPassword);
      }

      // Update phone and email in Firestore
      await firestore().collection('users').doc(currentUser.uid).update({
        phone: editPhone,
        email: editEmail,
      });

      const updatedProfile = {
        ...profile,
        phone: editPhone,
        email: editEmail,
        password: editPassword || profile.password,
      };

      updateProfile(updatedProfile);

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={[styles.input, { backgroundColor: '#E8E8E8' }]}
        value={profile.name}
        editable={false}
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
        placeholder="Current Password"
        placeholderTextColor="indigo"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="New Password (optional)"
        placeholderTextColor="indigo"
        value={editPassword}
        onChangeText={setEditPassword}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: '#8134AF' }]} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#DD2A7B' }]}
        onPress={() => navigation.goBack()}
      >
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



