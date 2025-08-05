// App.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import useLocation from "./hooks/useLocation";
import useUserId from "./hooks/useUserId";
import LocationMap from "./components/LocationMap";
import Constants from "expo-constants";

export default function App() {
  const location = useLocation();
  const userId = useUserId();
  const [error, setError] = React.useState(null);
  const [selectedPark, setSelectedPark] = useState(null);

  if (!userId || !location) {
    return <Text>Ladataan…</Text>;
  }

  return (
    <View style={styles.container}>
      <LocationMap
        location={location}
        style={{ flex: 1 }}
        onSelectPark={(park) => setSelectedPark(park)}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
  },
  error: { color: "red", textAlign: "center", margin: 8 },
});
