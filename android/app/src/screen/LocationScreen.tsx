import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const LocationScreen = () => {
  const [location, setLocation] = useState({
    latitude: 37.78825, // Default latitude
    longitude: -122.4324, // Default longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Request location permissions for Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your permission to access your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required to show your current location.');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation(); // iOS permissions are handled automatically
    }
  };

  // Get the user's current location
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          ...location,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        Alert.alert('Error', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Run when the component mounts
  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
          description="You are here!"
        />
      </MapView>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LocationScreen;
