import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

const ForgotPasswordScreen: React.FC<any> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert('Success', 'Password reset email sent successfully!');
      navigation.goBack(); // Go back to the login screen after successful email sent
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', 'An error occurred while sending the reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="indigo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#8134AF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#8134AF',
  },
  input: {
    height: 50,
    borderColor: '#c482d5',
    borderWidth: 1,
    borderRadius: 100,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#8134AF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 100,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: 'indigo',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
