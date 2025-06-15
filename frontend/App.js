import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import useLocation from './hooks/useLocation';
import { sendData, fetchStatus } from './api/backend';
import useCounts from './hooks/useCounts';
import LocationMap from './components/LocationMap';
import Icon from 'react-native-vector-icons/FontAwesome';

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
    } catch (err) {
      setError('Yhteys epäonnistui');
    }
  };

  return (
    
    <View style={styles.container}>
         <LocationMap location={location} />
      {/*<Text>People: {peopleCount}</Text>
      <Text>Dogs: {dogCount}</Text> */}
     {/*  <Button title="+1 Person" onPress={() => updatePeopleCount(peopleCount + 1)} icon={<Icon name="human" size={20} color="white"/>} />
      <Button title="+1 Dog" onPress={() => updateDogCount(dogCount + 1)} icon={<Icon name="paw" size={20} color="white"/>} />
      <Button title="Send Data" onPress={handleSend} />
      <Button title="Check Status" onPress={handleFetch} /> */}
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
