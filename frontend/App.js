// App.js
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useLocation from './hooks/useLocation';
import useCounts from './hooks/useCounts';
import { sendData, fetchStatus } from './api/backend';
import LocationMap from './components/LocationMap';

export default function App() {
  const location = useLocation();
  const { peopleCount, dogCount, updatePeopleCount, updateDogCount } = useCounts();
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!location) return;
    await sendData(location.coords.latitude, location.coords.longitude, peopleCount, dogCount);
  };

  const handleFetch = async () => {
    try {
      const data = await fetchStatus();
      setStatusData(data);
    } catch {
      setError('Yhteys epäonnistui');
    }
  };

  return (
    <View style={styles.container}>
      {/* Tämä View antaa LocationMapille tilan jakamisen */}
       <LocationMap
        location={location}
        style={{ flex: 1 }}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {statusData && statusData.length > 0 && (
        <View style={styles.status}>
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
   container: { flex: 1 },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 8,
  },
});
