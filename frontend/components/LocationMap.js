import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { fetchDogParks } from '../api/overpass';

export default function LocationMap({ location }) {
    const [dogParks, setDogParks] = useState([]);

    useEffect(() => {
        fetchDogParks()
            .then(data => {
                console.log('Fetched parks:', data);
                setDogParks(data);
            })
            .catch(console.error);
    }, []);

    if (!location || !location.coords) {
        return <Text>Ladataan sijaintia…</Text>;
    }

    return (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1
                }}
            >
                <Marker
                    coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    }}
                    title="You are here"
                />
                {dogParks.map(park => {
                    console.log("Drawing marker:", park);
                    return (
                        <Marker
                            key={park.id}
                            coordinate={{
                                latitude: park.latitude,
                                longitude: park.longitude
                            }}
                            title={park.name}
                        />
                    );
                })}
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
