import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

// Import screens
import HomeScreen from './android/app/src/screen/HomeScreen';
import LocationScreen from './android/app/src/screen/LocationScreen';
import DeviceScreen from './android/app/src/screen/DeviceScreen';
import ContactScreen from './android/app/src/screen/ContactScreen';
import ProfileScreen from './android/app/src/screen/ProfileScreen';
import LoginScreen from './android/app/src/screen/LoginScreen';
import SignUpScreen from './android/app/src/screen/SignUpScreen';
import SettingsScreen from './android/app/src/screen/SettingsScreen';
import HelpScreen from './android/app/src/screen/HelpScreen';
import PrivacyPage from './android/app/src/screen/PrivacyScreen';
import NotificationReadPage from './android/app/src/screen/AlertScreen';
import EditProfile from './android/app/src/screen/EditProfile';
import ForgotPasswordScreen from './android/app/src/screen/ForgotPasswordScreen';
import NotificationsScreen from './android/app/src/screen/NotificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profilee" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Help" component={HelpScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Privacy" component={PrivacyPage} options={{ headerShown: false }} />
    <Stack.Screen name="Edit" component={EditProfile} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Home Stack Navigator
const HomeStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Alert" component={NotificationReadPage} options={{ headerShown: false }} />
    <Stack.Screen name="Notification" component={NotificationsScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Main App Tabs Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
          case 'Location': iconName = focused ? 'location' : 'location-outline'; break;
          case 'Device': iconName = focused ? 'hardware-chip' : 'hardware-chip-outline'; break;
          case 'Contact': iconName = focused ? 'call' : 'call-outline'; break;
          case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
          default: iconName = 'help';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'indigo',
      tabBarInactiveTintColor: 'indigo',
      tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10, backgroundColor: 'white' },
    })}
  >
    <Tab.Screen name="Home" component={HomeStackNavigator} options={{ headerShown: false }} />
    <Tab.Screen name="Location" component={LocationScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Device" component={DeviceScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Contact" component={ContactScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ headerShown: false }} />
  </Tab.Navigator>
);

// Authentication Stack Navigator
const AuthStackNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const App = () => {
  const [user, setUser] = useState(null); // Track the authenticated user
  const [initializing, setInitializing] = useState(true); // Track app initialization

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);

      if (currentUser) {
        // Save device token when user logs in
        saveDeviceToken(currentUser.uid);
      }
    });

    return unsubscribe;
  }, [initializing]);

  const saveDeviceToken = async (uid) => {
    // Get the device token
    const token = await messaging().getToken();

    // Save the device token to Firestore
    await firestore().collection('users').doc(uid).set(
      { deviceToken: token },
      { merge: true }
    );
  };

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainTabNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};

export default App;

