import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

export default function LocationMap({ location }) {
  if (!location) return null;

  const dogParks = [
  { id: 1, name: 'Tervasaaren koirapuisto', latitude: 60.1709, longitude: 24.9614 },
  { id: 2, name: 'Kivikon koira-aitaus', latitude: 60.2330, longitude: 25.0795 },
  // Lisää muita puistoja
];

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }}
          title="Sinä olet tässä"
        />
        {dogParks.map(park => (
    <Marker
      key={park.id}
      coordinate={{ latitude: park.latitude, longitude: park.longitude }}
      title={park.name}
    />
  ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '90%',
    height: 400,
    marginTop: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
