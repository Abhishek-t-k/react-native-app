import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Button,  TextInput, TouchableOpacity } from 'react-native';

const SettingsScreen = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [text, setText] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const toggleTheme = () => setIsDarkTheme(previousState => !previousState);

  return (
    <View style={[styles.container, isDarkTheme ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.title, isDarkTheme ? styles.darkTitle : styles.lightTitle]}>Settings</Text>

      {/* Toggle Notifications */}
      <View style={styles.settingItem}>
        <Text style={[styles.text, isDarkTheme ? styles.darkText : styles.lightText]}>Enable Notifications</Text>
        <Switch value={isEnabled} onValueChange={toggleSwitch} />
      </View>

      

      {/* User Name Input */}
      <View style={styles.settingItem}>
        <Text style={[styles.text, isDarkTheme ? styles.darkText : styles.lightText]}>User Name</Text>
        <TextInput
          style={[styles.input, isDarkTheme ? styles.darkInput : styles.lightInput]}
          value={text}
          onChangeText={setText}
          placeholder="Enter your name"
          placeholderTextColor={isDarkTheme ? '#aaa' : '#555'}
        />
      </View>

      {/* Theme Toggle */}
      <View style={styles.settingItem}>
        <Text style={[styles.text, isDarkTheme ? styles.darkText : styles.lightText]}>Dark Theme</Text>
        <Switch value={isDarkTheme} onValueChange={toggleTheme} />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={() => alert('Settings Saved!')}>
        <Text style={styles.buttonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  darkTitle: {
    color: '#fff',
  },
  lightTitle: {
    color: '#8134AF',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#8134AF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  slider: {
    width: 200,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    width: '60%',
    paddingLeft: 10,
  },
  darkInput: {
    backgroundColor: '#444',
    color: '#fff',
    borderColor: '#888',
  },
  lightInput: {
    backgroundColor: '#f1f1f1',
    color: '#333',
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#8134AF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;

