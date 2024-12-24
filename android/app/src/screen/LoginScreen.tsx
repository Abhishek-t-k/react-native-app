import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type Props = {
  navigation: any;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const handleLogin = () => {
    if (name && password) {
      setLoading(true); // Show loading spinner
      console.log('Logging in with:', name, password);
      setTimeout(() => { // Simulate network request
        setLoading(false);
        navigation.navigate('Main', { userName: name });
      }, 2000); // Adjust timeout as needed
    } else {
      alert('Please enter both username and password');
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
            placeholder="Username"
            placeholderTextColor="indigo"
            value={name}
            onChangeText={setName}
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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.link}>Don't have an account? Sign Up</Text>
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
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 0, // Better for responsive design
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
    marginTop: 60,
    color: 'indigo',
    textAlign: 'center',
  },
});

export default LoginScreen;
