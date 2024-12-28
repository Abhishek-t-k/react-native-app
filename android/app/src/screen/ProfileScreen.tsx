import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';

type Props = {
  navigation: any;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  // State to hold profile data
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    password: '********',
  });

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setProfile({
        name: user.displayName || 'John', // If display name is not set, fallback to 'John Doe'
        email: user.email || '',
        phone: user.phoneNumber || '1234567890',
        password:'********', // Hide the password (you can implement password reset if needed)
      });
    } else {
      navigation.navigate('Login');
    }
  }, [navigation]);

  // Log Out functionality
  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        Alert.alert('Success', 'You have been logged out.');
        
      })
      .catch((error) => {
        console.log('error:', error);
        Alert.alert('Error', 'Unable to logout. Please try again.');
      });
  };

  // Update profile data after edit
  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {/* View Mode */}
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

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Edit', { profile, updateProfile: handleProfileUpdate })}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#DD2A7B', marginTop: 20 }]}
        onPress={handleLogout}
      >
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
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
    marginTop: 30,
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

