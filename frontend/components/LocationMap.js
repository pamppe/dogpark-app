import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import MapView, { Marker, Callout, Polygon, UrlTile } from 'react-native-maps';
import { fetchDogParks } from '../api/overpass';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import ParkList from './ParkList';


export default function LocationMap({ location }) {
    const [dogParks, setDogParks] = useState([]);
    const [selectedPark, setSelectedPark] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!location?.coords) return;

        fetchDogParks(location.coords.latitude, location.coords.longitude)
            .then(data => {
                setDogParks(data);
            })
            .catch(console.error);
    }, [location]);

    if (!location || !location.coords) {
        return <Text>Ladataan Karttaa…</Text>;
    }
     const renderDetails = (park) => (
    <View style={styles.details}>
      <Button title="← Takaisin listaan" onPress={() => setSelectedPark(null)} />
      <Text style={styles.title}>{park.name}</Text>
      {park.distance != null && <Text>Etäisyys: {park.distance} m</Text>}
      {park.access      && <Text>Access: {park.access}</Text>}
      {park.fenced      && <Text>Aitaus: {park.fenced === 'yes' ? 'Kyllä' : 'Ei'}</Text>}
      {park.opening_hours && <Text>Auki: {park.opening_hours}</Text>}
      {park.surface     && <Text>Pinta: {park.surface}</Text>}
    </View>
  );

    return (
    <View style={styles.container}>
      {/* Kartta omassa kontissaan */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          
        >
             {/* Oma sijainti */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => setSelectedPark(null)}
            title="Sinä olet tässä"
          >
            <MaterialCommunityIcons name="account" size={30} color="#007AFF" />
          </Marker>

                {/* Koirapuistot */}
             {dogParks.map(park => (
            park.geometry
              ? (
                <Polygon
                  key={park.id}
                  coordinates={park.geometry.map(({ lat, lon }) => ({
                    latitude: lat,
                    longitude: lon
                  }))}
                  strokeColor="#FF4500"
                  fillColor="rgba(255,69,0,0.3)"
                  strokeWidth={2} 
                  tappable
                  onPress={() => {
                    setSelectedPark(park);
                    mapRef.current?.animateToRegion({
                      latitude: park.latitude,
                      longitude: park.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01
                    });
                  }}
                />
              )
              : (
                <Marker
                  key={park.id}
                  coordinate={{ latitude: park.latitude, longitude: park.longitude }}
                  title={park.name}
                  description={`Etäisyys: ${park.distance} m`}
                  anchor={{ x: 0.5, y: 0.5 }}
                  onPress={() => {
                    setSelectedPark(park);
                    mapRef.current?.animateToRegion({
                      latitude: park.latitude,
                      longitude: park.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01
                    });
                  }}
                >
                  <MaterialCommunityIcons name="dog" size={30} color="#FF4500" />
                  <Callout>
                    <Text>{park.name}</Text>
                  </Callout>
                </Marker>
              )
          ))}
        </MapView>
      </View>

        {/* Alapuolella joko lista tai yksityiskohdat */}
        <View style={styles.listContainer}>
      {selectedPark
        ? renderDetails(selectedPark)
        : (
          <ParkList
            parks={dogParks}
            onSelect={(park) => {
              setSelectedPark(park);
              mapRef.current?.animateToRegion({
                latitude: park.latitude,
                longitude: park.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              });
            }}
          />
        )
      }
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  listContainer: { flex: 1, backgroundColor: '#fff' },
  details: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
  },
});