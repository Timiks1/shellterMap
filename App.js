import { StatusBar } from "expo-status-bar";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";

import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import sheltersData from "./shelterListDnepr.json";
export default function App() {
  const [shelters, setShelters] = useState(sheltersData);
  const [userLocation, setUserLocation] = useState(null);
  const initialRegion = {
    latitude: 48.379433,
    longitude: 31.16558,
    latitudeDelta: 19,
    longitudeDelta: 19,
  };
  const [mapRegion, setMapRegion] = useState(initialRegion);
  const initialShelter = {
    latitude: 0,
    longitude: 0,
  };
  const [nearestShelter, setNearestShelter] = useState(initialShelter);
  const [userChangedMapRegion, setUserChangedMapRegion] = useState(false);
  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
  });
  const onRegionChangeComplete = (region) => {
    if (userChangedMapRegion) {
      setMapRegion(region);
      setUserChangedMapRegion(false);
    }
  };
  const getUserLocation = async () => {
    try {
      const cachedLocation = await Location.getLastKnownPositionAsync();
      if (cachedLocation) {
        setUserLocation({
          latitude: cachedLocation.coords.latitude,
          longitude: cachedLocation.coords.longitude,
        });

        setMapRegion({
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
          latitude: cachedLocation.coords.latitude,
          longitude: cachedLocation.coords.longitude,
        });
      }

      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          setMapRegion({
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const getNearestShelter = () => {
    if (userLocation == null) {
      return 0;
    } else {
      let nearestShelter = shelters[0];
      let minDistance = getDistance(userLocation, shelters[0].coordinates);

      for (let i = 1; i < shelters.length; i++) {
        const distance = getDistance(userLocation, shelters[i].coordinates);
        if (distance < minDistance) {
          minDistance = distance;
          nearestShelter = shelters[i];
        }
      }
      setNearestShelter({
        latitude: nearestShelter.coordinates.latitude,
        longitude: nearestShelter.coordinates.longitude,
      });
      setMapRegion({
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
        latitude: nearestShelter.coordinates.latitude,
        longitude: nearestShelter.coordinates.longitude,
      });
    }
  };
  const getDistance = (coord1, coord2) => {
    const R = 6371;
    const dLat = degToRad(coord2.latitude - coord1.latitude);
    const dLon = degToRad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(coord1.latitude)) *
        Math.cos(degToRad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };
  const degToRad = (deg) => (deg * Math.PI) / 180;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          region={mapRegion}
          onRegionChangeComplete={onRegionChangeComplete}
          onPanDrag={() => setUserChangedMapRegion(true)}
        >
          {shelters.map((shelter, index) => (
            <Marker
              key={index}
              coordinate={shelter.coordinates}
              title={shelter.title}
              onPress={() => setNearestShelter(shelter.coordinates)}
              pinColor={
                nearestShelter &&
                nearestShelter.latitude === shelter.coordinates.latitude &&
                nearestShelter.longitude === shelter.coordinates.longitude
                  ? "red"
                  : "green"
              }
            />
          ))}
          {nearestShelter.latitude !== 0 ? (
            <MapViewDirections
              origin={userLocation}
              destination={nearestShelter}
              apikey="AIzaSyB0slnHODkNOXye0Tv3mKTYY3FEPbYcaOQ"
              strokeWidth={4}
              strokeColor="red"
              mode="WALKING"
            />
          ) : null}
        </MapView>
      </View>

      <TouchableOpacity style={styles.button} onPress={getUserLocation}>
        <Text style={styles.buttonText}>Де я ?</Text>
      </TouchableOpacity>
      {userLocation !== null ? (
        <TouchableOpacity style={styles.button} onPress={getNearestShelter}>
          <Text style={styles.buttonText}>Найближче укриття</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    width: "100%",
    height: "70%",
    backgroundColor: "red",
    marginBottom: "5%",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  button: {
    width: "70%",
    height: "6%",
    borderColor: "#000000",
    backgroundColor: "#f2f2f2",
    borderWidth: 2,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5%",
  },
  buttonText: {
    fontSize: 20,
    color: "#000000",
    textAlign: "center",
  },
});
