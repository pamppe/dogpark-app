# DogPark App

**DogPark** is a mobile application that helps dog owners find and explore dog parks on a map. It shows both the park boundaries and visitor data (people and dogs counts), and lets users send their own counts to a backend.

---

## 📦 Technologies

- **Frontend**  
  - React Native + Expo  
  - `react-native-maps`
  - `react-native-vector-icons`  
  - `@react-native-async-storage/async-storage`  

- **Backend**  
  - Node.js + Express  
  - CORS & JSON body parsing  

- **Data Sources**  
  - OpenStreetMap Overpass API (park boundaries & metadata)  
  - Expo Location API (device GPS)  

---

## 🚀 Features

1. **User Location**  
   - Fetch device location (`expo-location`).  
   - Display “You are here” marker on the map.

2. **Dog Park Data**  
   - Overpass API query for `leisure=dog_park` nodes, ways & relations.  
   - Draw park boundaries as `Polygon` overlays.  
   - Calculate distance from user’s location (in meters).  
   - Show park metadata: `access`, `fenced`, `surface`, `opening_hours` etc.

3. **Visitor Counts**  
   - `peopleCount` & `dogCount` hooks in the frontend.  
   - Persist counts locally using `AsyncStorage`.  
   - Backend endpoints:  
     - `POST /update` to send `{ lat, lon, people, dogs }`.  
     - `GET  /status` to retrieve the latest counts.

4. **UI/UX**  
   - `LocationMap` component for map + polygons.  
   - `ParkList` component for a scrollable list under the map.  
   - Tapping a list item animates the map to that park.  
   - Icon buttons with `react-native-vector-icons`.
