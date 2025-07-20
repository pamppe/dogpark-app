# DogPark App

**DogPark** is a mobile application that helps dog owners find and explore dog parks on a map. It shows park boundaries, visitor counts, and real-time presence data (who is currently in each park and how long they’ve been there). Users can also send their own presence status (enter/exit) to a backend so everyone sees up-to-date occupancy.

> **WORK IN PROGRESS**

---

## 📦 Technologies

- **Frontend**  
  - React Native + Expo  
  - `react-native-webview`  
  - `react-native-vector-icons`  
  - `@react-native-async-storage/async-storage`  
  - Turf.js (`@turf/turf`) for point-in-polygon checks  

- **Backend**  
  - Node.js + Express  
  - CORS & JSON body parsing  

- **Data Sources**  
  - OpenStreetMap Overpass API (dog-park boundaries & metadata)  
  - Expo Location API (device GPS)  

---

## 🚀 Features

1. **User Location**  
   - Continuous watch with `expo-location`.  
   - Custom “dog” marker for your current position.  

2. **Dog Park Data**  
   - Fetch `leisure=dog_park` nodes, ways & relations in Helsinki.  
   - Draw true park boundaries (polygon overlays) and fallback circles for node-only parks.  
   - Calculate & sort by distance from user.  
   - Show park metadata: `access`, `fenced`, `surface`, `opening_hours`.  
   - Default “Koirapuisto” name for unnamed parks, with a small notice in the detail view.  

3. **Visitor Counts**  
   - Local hooks for people & dog counters, persisted in AsyncStorage.  
   - Backend endpoints:  
     - `POST /update` to send `{ lat, lon, people, dogs }`.  
     - `GET  /status` to retrieve latest aggregated counts.  

4. **Presence Tracking**  
   - Automatic enter/exit detection using Turf.js point-in-polygon & distance buffers.  
   - Persist last known park in AsyncStorage and send exit event on app background.  
   - Backend endpoint:  
     - `POST /presence` to send `{ userId, parkId|null, timestamp }`.  
     - `GET  /status` to list who is currently in which park.  
   - In the park detail view you see a “Users in park” section with names (or IDs) and time since they arrived.  

5. **UI/UX**  
   - **`LocationMap`**: WebView + Leaflet, minimal basemap (e.g. CartoDB Positron No Labels).  
   - **`ParkList`**: Scrollable list under the map, sorted by distance.  
   - Tap a list item or polygon to zoom in & open its popup.  
   - Detail pane shows full metadata, presence info, and distance.  
   - Graceful loading & fallback states for location and data.  

---
