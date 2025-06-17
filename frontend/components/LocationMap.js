import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import MapLibreGL from '@react-native-maplibre-gl/maps';
import { fetchDogParks } from '../api/overpass';

MapLibreGL.setAccessToken(null); // ei tarvita Mapbox-tokenia OSM:lle

export default function LocationMap({ location }) {
  const [dogParks, setDogParks] = useState([]);
  const [selectedPark, setSelectedPark] = useState(null);

  useEffect(() => {
    if (!location?.coords) return;
    fetchDogParks(location.coords.latitude, location.coords.longitude)
      .then(setDogParks)
      .catch(console.error);
  }, [location]);

  if (!location || !location.coords) {
    return <Text>Ladataan karttaa…</Text>;
  }

  // Muodosta GeoJSON ShapeSourcea varten:
  const features = dogParks
    .filter(park => Array.isArray(park.geometry))
    .map(park => ({
      type: 'Feature',
      properties: { id: park.id, name: park.name },
      geometry: {
        type: 'Polygon',
        // GeoJSON odottaa array of rings: [ [ [lon, lat], … ] ]
        coordinates: [
          park.geometry.map(({ lon, lat }) => [lon, lat])
        ]
      }
    }));

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView style={styles.map}>
        <MapLibreGL.Camera
          zoomLevel={12}
          centerCoordinate={[
            location.coords.longitude,
            location.coords.latitude
          ]}
        />

        <MapLibreGL.ShapeSource id="parks" shape={{
          type: 'FeatureCollection',
          features
        }}>
          {/* Täytteet */}
          <MapLibreGL.FillLayer
            id="parkFill"
            style={{
              fillColor: 'rgba(255,69,0,0.3)'
            }}
          />
          {/* Ääriviivat */}
          <MapLibreGL.LineLayer
            id="parkBorder"
            style={{
              lineColor: '#FF4500',
              lineWidth: 2
            }}
          />
        </MapLibreGL.ShapeSource>
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
