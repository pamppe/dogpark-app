import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchParks } from '../api/overpass';
import ParkList from './ParkList';
import useParkPresence from '../hooks/useParkPresence';
import { fetchStatus } from '../api/backend';

export default function LocationMap({ location, style }) {
  const [parks, setParks] = useState([]);
  const [selectedPark, setSelectedPark] = useState(null);
  const webviewRef = useRef(null);
  const [presences, setPresences] = useState([]);

  // taustaseuranta (enter/exit)
  useParkPresence(location, parks);

   // hae puistot
  useEffect(() => {
    if (!location?.coords) return;
    fetchParks(location.coords.latitude, location.coords.longitude)
      .then(data => {
      console.log('fetchParks palautti:', data.length, 'kohdetta');
      setParks(data);
    })
      .catch(console.error);
  }, [location]);

  // hae läsnäolot aina kun valittu puisto vaihtuu
  useEffect(() => {
  if (!selectedPark) {
    setPresences([]);
    return;
  }
  fetchStatus()
    .then(data => {
      const here = data.filter(s => s.parkId === selectedPark.id);
      setPresences(here);
    })
    .catch(console.error);
}, [selectedPark]);

  const mapHtml = useMemo(() => {
    if (!location?.coords) return `<html><body>Ladataan…</body></html>`;
    const { latitude, longitude } = location.coords;

     // Rakennetaan polygon-layerit ja tallennetaan ne window.parkLayers-hakemistoon
    const polygonScripts = parks
      .filter(p => p.geometry)
      .map(p => {
        const coords = JSON.stringify(p.geometry.map(g => [g.lat, g.lon]));
        return `
          // Luo karttakerros ja tallenna se id:llä
          var layer${p.id} = L.polygon(${coords}, {
            color: '#39b3ffff',
            fillColor: 'rgba(173,216,230,0.4)',
            weight: 3
          }).addTo(map);
          window.parkLayers[${p.id}] = layer${p.id};

          // Klikkaus kartalla
          layer${p.id}.on('click', function() {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type:'select', id:${p.id} })
            );
          });
        `;
      }).join('\n');

       // 2) Circles for Node-only parks
  const circleScripts = parks
    .filter(p => !p.geometry)
    .map(p => `
      var layer${p.id} = L.circle([${p.latitude}, ${p.longitude}], {
        radius: 30,  // arvo sentteinä, säädä tarpeen mukaan
        color: '#87CEFA',
        fillColor: 'rgba(173,216,230,0.4)',
        weight: 2
      }).addTo(map);
      window.parkLayers[${p.id}] = layer${p.id};
      layer${p.id}.on('click', function() {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type:'select', id:${p.id} })
        );
      });
    `).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <style>html,body,#map{height:100%;margin:0;padding:0;}</style>
      </head><body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          // Alusta kartta
          var map = L.map('map').setView([${latitude}, ${longitude}], 13);
          window.map = map;
          window.parkLayers = {};

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom:19, attribution:'&copy; OSM contributors'
          }).addTo(map);

          // Oman sijainnin merkki
          var dogIcon = L.icon({
           iconUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',  // koira‐ikoni verkosta
           iconSize: [30, 30],      // koon voi säätää
           iconAnchor: [15, 30],    // ankkuri alareunassa keskellä
           popupAnchor: [0, -30]    // popup napsahtaa ikonista ylös
         });
         L.marker([${latitude}, ${longitude}], { icon: dogIcon })
          .addTo(map)
          .bindPopup('Sinä olet tässä 🐶');

          ${polygonScripts}
           ${circleScripts}
        </script>
      </body>
      </html>
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
               {!selectedPark.hasName && (
                  <Text style={styles.noName}>
                      Puiston nimeä ei ole tiedossa
                  </Text>
              )}
               {/* Läsnäolotiedot */}
            <View style={styles.presenceSection}>
              <Text style={styles.sectionTitle}>Käyttäjät puistossa:</Text>
              {presences.length > 0 ? (
                presences.map(p => (
                  <Text key={p.userId} style={styles.presenceItem}>
                    {p.userName || `Käyttäjä ${p.userId}`} –{' '}
                    {new Date(p.timestamp).toLocaleTimeString()}
                  </Text>
                ))
              ) : (
                <Text style={styles.presenceEmpty}>Ei ketään</Text>
              )}
            </View>
          </View>
        ) : (
             <ParkList
              parks={parks}
              onSelect={p => {
                setSelectedPark(p);
                // kun listalta valitaan, ohjataan karttaa osoitteeseen + zoom
                if (webviewRef.current) {
                  const js = `
                    window.map.flyTo([${p.latitude}, ${p.longitude}], 18);
                    // jos haluat avata popupin, niin:
                    if (window.parkLayers[${p.id}]) {
                      window.parkLayers[${p.id}].openPopup();
                    }
                    true;  // pakollinen palautusarvo WebView:ssä
                  `;
                  webviewRef.current.injectJavaScript(js);
                }
              }}
            />
          )
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#fff' },
  mapContainer:  { flex: 1.5 },
  map:           { flex: 1 },
  listContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd'
  },
  details:       { padding: 10, borderTopWidth: 1, borderColor: '#ccc' },
  title:         { fontSize: 18, fontWeight: 'bold', marginVertical: 6 },
  noName:        {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'gray',
    marginBottom: 6,
  },
  presenceSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  presenceItem: {
    fontSize: 14,
    marginBottom: 2
  },
  presenceEmpty: {
    fontStyle: 'italic',
    color: 'gray'
  },
});