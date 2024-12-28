import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';

type Props = {
  navigation: any;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Firebase login with email and password
      await auth().signInWithEmailAndPassword(email.trim(), password);
      Alert.alert('Success', 'Login Successful');
      
    } catch (error: any) {
      setLoading(false);

      // Enhanced error handling with improved checks
      switch (error.code) {
        case 'auth/user-not-found':
          Alert.alert(
            'User Not Found',
            'No user found with this email address. Please sign up first.',
          );
          break;
        case 'auth/wrong-password':
          Alert.alert('Incorrect Password', 'The password you entered is incorrect.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Invalid Email', 'The email address entered is not valid.');
          break;
        case 'auth/too-many-requests':
          Alert.alert(
            'Account Locked',
            'Too many failed login attempts. Please try again later.',
          );
          break;
        default:
          Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image
            source={require('./assets/images/logo.png')}
            style={styles.image}
          />
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="indigo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="indigo"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={securePassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setSecurePassword(!securePassword)}
            >
              <MaterialIcons
                name={securePassword ? 'visibility-off' : 'visibility'}
                size={24}
                color="indigo"
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#8134AF" />
          ) : (
            <TouchableOpacity
              style={[styles.button, loading && { backgroundColor: '#ddd' }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.link}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  button: {
    backgroundColor: '#8134AF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 100,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#8134AF',
    marginTop: 30,
    padding: 25,
  },
  input: {
    height: 50,
    borderColor: '#c482d5',
    borderWidth: 1,
    borderRadius: 100,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  image: {
    width: '70%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  link: {
    marginTop: 20,
    color: 'indigo',
    textAlign: 'center',
  },
});

export default LoginScreen;
