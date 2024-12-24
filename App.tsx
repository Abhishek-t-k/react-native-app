import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Import screens
import HomeScreen from './android/app/src/screen/HomeScreen';
import LocationScreen from './android/app/src/screen/LocationScreen';
import DeviceScreen from './android/app/src/screen/DeviceScreen';
import ContactScreen from './android/app/src/screen/ContactScreen';
import ProfileScreen from './android/app/src/screen/ProfileScreen';
import LoginScreen from './android/app/src/screen/LoginScreen';
import SignUpScreen from './android/app/src/screen/SignUpScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main App Tabs Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Location':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'Device':
              iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
              break;
            case 'Contact':
              iconName = focused ? 'call' : 'call-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'indigo',
        tabBarInactiveTintColor: 'indigo',
        tabBarStyle: {
          height: 70, // Adjusts the height of the TabBar
          paddingBottom: 10, // Adds spacing for icons/text
          paddingTop: 10, // Adds spacing above the icons/text
          backgroundColor: 'white', // Custom background color
        },
        
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Location" component={LocationScreen} />
      <Tab.Screen name="Device" component={DeviceScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Authentication Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        {/* Authentication Flow */}
        <Stack.Screen name="Auth" component={AuthStackNavigator} options={{ headerShown: false }} />
        {/* Main App after Login */}
        <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

