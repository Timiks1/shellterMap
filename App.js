import { StatusBar } from "expo-status-bar";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import Orientation from "react-native-orientation";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import MapView from "react-native-map-clustering";
import { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import sheltersDataDnepr from "./shelterListDnepr.json";
import sheltersDataLvov from "./shelterListLvov.json";
import sheltersDataHarkov from "./shelterListHarkov.json";
import sheltersDataOdessa from "./shelterListOdessa.json";
export default function App() {
  const [shelters, setShelters] = useState(sheltersDataDnepr);
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

  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
  });
  // const onRegionChangeComplete = (region) => {
  //   setVisibleRegion(region);
  // };
  const getUserLocation = async () => {
    try {
      const cachedLocation = await Location.getLastKnownPositionAsync();
      if (cachedLocation) {
        setUserLocation({
          latitude: cachedLocation.coords.latitude,
          longitude: cachedLocation.coords.longitude,
        });

        setMapRegion({
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
          latitude: cachedLocation.coords.latitude,
          longitude: cachedLocation.coords.longitude,
        });
        if (
          cachedLocation.coords.latitude >= 48.4 &&
          cachedLocation.coords.latitude <= 48.6 &&
          cachedLocation.coords.longitude >= 34.9 &&
          cachedLocation.coords.longitude <= 35.1
        ) {
          // Координаты находятся в городе Днепр
          setShelters(sheltersDataDnepr);
        } else if (
          cachedLocation.coords.latitude >= 49.78 &&
          cachedLocation.coords.latitude <= 49.88 &&
          cachedLocation.coords.longitude >= 23.9 &&
          cachedLocation.coords.longitude <= 24.05
        ) {
          // Координаты находятся в городе Львов
          setShelters(sheltersDataLvov);
        } else if (
          cachedLocation.coords.latitude >= 46.45 &&
          cachedLocation.coords.latitude <= 46.58 &&
          cachedLocation.coords.longitude >= 30.68 &&
          cachedLocation.coords.longitude <= 30.88
        ) {
          setShelters(sheltersDataOdessa);
        } else if (
          cachedLocation.coords.latitude >= 49.95 &&
          cachedLocation.coords.latitude <= 50.05 &&
          cachedLocation.coords.longitude >= 36.2 &&
          cachedLocation.coords.longitude <= 36.35
        ) {
          setShelters(sheltersDataHarkov);
        }
      }

      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          setMapRegion({
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (
            location.coords.latitude >= 48.4 &&
            location.coords.latitude <= 48.6 &&
            location.coords.longitude >= 34.9 &&
            location.coords.longitude <= 35.1
          ) {
            // Координаты находятся в городе Днепр
            setShelters(sheltersDataDnepr);
          } else if (
            cachedLocation.coords.latitude >= 46.45 &&
            cachedLocation.coords.latitude <= 46.58 &&
            cachedLocation.coords.longitude >= 30.68 &&
            cachedLocation.coords.longitude <= 30.88
          ) {
            setShelters(sheltersDataOdessa);
          } else if (
            cachedLocation.coords.latitude >= 49.95 &&
            cachedLocation.coords.latitude <= 50.05 &&
            cachedLocation.coords.longitude >= 36.2 &&
            cachedLocation.coords.longitude <= 36.35
          ) {
            setShelters(sheltersDataHarkov);
          }
        }
      );
      locationSubscription.remove();
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
  const startWay = () => {
    setMapRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.0001,
      longitudeDelta: 0.0001,
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          region={mapRegion}
          // onRegionChangeComplete={onRegionChangeComplete}
          animationEnabled={false}
        >
          {shelters !== null &&
            shelters.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.coordinates.latitude,
                  longitude: marker.coordinates.longitude,
                }}
                title={marker.title}
                onPress={() =>
                  setNearestShelter({
                    longitude: marker.coordinates.longitude,
                    latitude: marker.coordinates.latitude,
                  })
                }
                pinColor={
                  nearestShelter &&
                  nearestShelter.latitude === marker.coordinates.latitude &&
                  nearestShelter.longitude === marker.coordinates.longitude
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
              precision="high"
              mode="WALKING"
            />
          ) : null}
        </MapView>
      </View>
      {/* {nearestShelter.latitude !== 0 ? (
        <TouchableOpacity
          style={[styles.button, styles.wayButton]}
          onPress={startWay}
        >
          <Text style={styles.buttonText}>В путь</Text>
        </TouchableOpacity>
      ) : null} */}
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
  wayButton: {
    position: "absolute",
    top: "65%",
    zIndex: 3,
  },
});
