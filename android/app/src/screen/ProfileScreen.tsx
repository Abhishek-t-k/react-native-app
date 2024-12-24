import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type Props = {
  navigation: any;
};

const ProfileScreen: React.FC = ({ navigation }) => {
  // State to hold profile data
  const [profile, setProfile] = useState({
    name: 'John Doe',
    phone: '+1234567890',
    email: 'johndoe@gmail.com',
    password: '********',
  });

  // State to track whether we are editing
  const [isEditing, setIsEditing] = useState(false);

  // Local state for editing profile fields
  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPassword, setEditPassword] = useState('');

  // Save changes to profile
  const handleSave = () => {
    setProfile({
      name: editName,
      phone: editPhone,
      email: editEmail,
      password: editPassword ? '********' : profile.password, // Mask password
    });
    setIsEditing(false); // Exit edit mode
  };

  // Log Out functionality
  const handleLogout = () => {
    Alert.alert('Log Out', 'You have been logged out successfully!', [
      { text: 'OK', onPress: () => console.log('Logged Out') },
    ]);
    navigation.navigate('Login'); // Add navigation to Login screen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {/* View Mode */}
      {!isEditing ? (
        <View>
          <View style={styles.profileContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Name:</Text>
              <Text style={styles.fieldValue}>{profile.name}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Phone:</Text>
              <Text style={styles.fieldValue}>{profile.phone}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Email:</Text>
              <Text style={styles.fieldValue}>{profile.email}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldTitle}>Password:</Text>
              <Text style={styles.fieldValue}>{profile.password}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: '#DD2A7B', marginTop: 20 }]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>

          {/* Additional Options */}
          <View style={styles.optionContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Settings')}>
              <MaterialIcons name="settings" size={24} color="#8134AF" />
              <Text style={styles.optionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Help')}>
              <MaterialIcons name="help-outline" size={24} color="#8134AF" />
              <Text style={styles.optionText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Privacy')}>
              <MaterialIcons name="lock" size={24} color="#8134AF" />
              <Text style={styles.optionText}>Privacy</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Edit Mode
        <View>
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
          <View style={{ marginBottom: 10 }} />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#DD2A7B' }]} onPress={() => setIsEditing(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20,  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#8134AF',
  },
  profileContainer: { marginBottom: 20 },
  fieldContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  fieldTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8134AF',
  },
  fieldValue: {
    fontSize: 18,
    marginTop: 5,
    color: '#555',
  },
  input: {
    height: 45,
    borderColor: '#b388f4',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#8134AF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionContainer: {
    marginTop: 30, // Increased margin to separate the options
    marginBottom: 20,
    alignItems: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
    elevation: 3,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#8134AF',
    fontWeight: '600',
  },
});

export default ProfileScreen;
