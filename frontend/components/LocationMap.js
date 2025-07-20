import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchParks } from '../api/overpass';
import ParkList from './ParkList';

export default function LocationMap({ location, style }) {
  const [parks, setParks] = useState([]);
  const [selectedPark, setSelectedPark] = useState(null);
  const webviewRef = useRef(null);

  useEffect(() => {
    if (!location?.coords) return;
    fetchParks(location.coords.latitude, location.coords.longitude)
      .then(data => {
      console.log('fetchParks palautti:', data.length, 'kohdetta');
      setParks(data);
    })
      .catch(console.error);
  }, [location]);

  const mapHtml = useMemo(() => {
    if (!location?.coords) return `<html><body>Ladataan…</body></html>`;
    const { latitude, longitude } = location.coords;

    // Piirretään vain ne puistot, joilla on geometry (way/relation)
    const polygons = parks
      .filter(p => p.geometry)
      .map(p => {
        const coords = JSON.stringify(p.geometry.map(g => [g.lat, g.lon]));
        return `
          L.polygon(${coords}, {
            color: '#87CEFA',
            fillColor: 'rgba(173,216,230,0.4)',
            weight: 2
          })
          .addTo(map)
          .on('click', () =>
            window.ReactNativeWebView.postMessage(${JSON.stringify(
              JSON.stringify({ type: 'select', id: p.id })
            )})
          );
        `;
      }).join('\n');

    return `
      <!DOCTYPE html>
      <html><head>
        <meta name="viewport" content="initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <style>html,body,#map{height:100%;margin:0;padding:0;}</style>
      </head><body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${latitude}, ${longitude}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom:19, attribution:'&copy; OSM contributors'
          }).addTo(map);

          // Oma sijainti
          L.circleMarker([${latitude}, ${longitude}], {
            radius:8, fillColor:'#007AFF', color:'#fff',
            weight:2, fillOpacity:1
          }).addTo(map).bindPopup('Sinä olet tässä');

          ${polygons}
        </script>
      </body></html>
    `;
  }, [location, parks]);

  const onMessage = ev => {
    let msg;
    try { msg = JSON.parse(ev.nativeEvent.data); } catch { return; }
    if (msg.type === 'select') {
      const park = parks.find(p => p.id === msg.id);
      if (park) setSelectedPark(park);
    }
  };

  if (!location?.coords) return <Text>Ladataan karttaa…</Text>;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
          onMessage={onMessage}
        />
      </View>

      <View style={styles.listContainer}>
        {selectedPark
          ? (
            <View style={styles.details}>
              <Button title="← Takaisin" onPress={() => setSelectedPark(null)} />
              <Text style={styles.title}>{selectedPark.name}</Text>
              {selectedPark.distance != null &&
                <Text>Etäisyys: {selectedPark.distance} m</Text>}
            </View>
          )
          : (
            <ParkList
              parks={parks}
              onSelect={p => setSelectedPark(p)}
            />
          )
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  mapContainer:   { flex: 1.5 },
  map:            { flex: 1 },
  listContainer:  { flex: 1, backgroundColor: '#fff' },
  details:        { padding: 10, borderTopWidth: 1, borderColor: '#ccc' },
  title:          { fontSize: 18, fontWeight: 'bold', marginVertical: 6 },
});