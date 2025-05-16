import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [peopleCount, setPeopleCount] = useState(0);
  const [dogCount, setDogCount] = useState(0);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const sendData = async () => {
    if (!location) return;
    await fetch('http://192.168.1.110:3000/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        people: peopleCount,
        dogs: dogCount
      })
    });
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://192.168.1.110:3000/status');
      const data = await res.json();
      setStatusData(data);
    } catch (err) {
      setError('Yhteys epäonnistui');
    }
  };

  return (
    <View style={styles.container}>
      <Text>People: {peopleCount}</Text>
      <Text>Dogs: {dogCount}</Text>
      <Button title="+1 Person" onPress={() => setPeopleCount(peopleCount + 1)} />
      <Button title="+1 Dog" onPress={() => setDogCount(dogCount + 1)} />
      <Button title="Send Data" onPress={sendData} />
      <Button title="Check Status" onPress={fetchStatus} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {statusData && statusData.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text>Latest Data:</Text>
          <Text>People: {statusData[0].people}</Text>
          <Text>Dogs: {statusData[0].dogs}</Text>
          <Text>Time: {new Date(statusData[0].timestamp).toLocaleTimeString()}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});